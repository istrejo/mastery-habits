import React from 'react';
import type { HabitWithScore } from '../types';
import { DashboardHabitRow } from '../components/DashboardHabitRow';

const renderer = require('react-test-renderer');
const { act, create } = renderer;
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const readChildren = (children: unknown): string => Array.isArray(children) ? children.join('') : String(children);

const mockTheme = {
  bg: { base: '#FAFAFA', surface: '#FFFFFF', surfaceAlt: '#F4F4F4', elevated: '#FFFFFF' },
  border: { subtle: '#E5E5E5', default: '#E5E5E5', strong: '#111111' },
  text: { primary: '#111111', secondary: '#666666', tertiary: '#A3A3A3', inverse: '#FFFFFF' },
  accent: { primary: '#111111', onPrimary: '#FFFFFF', muted: 'rgba(17,17,17,0.10)' },
  score: { excellent: '#111111', good: '#111111', warning: '#666666', critical: '#BA1A1A' },
  level: {
    seed: { fg: '#666666', bg: '#F4F4F4', border: '#E5E5E5' },
    sprout: { fg: '#111111', bg: '#F4F4F4', border: '#E5E5E5' },
    tree: { fg: '#111111', bg: '#F4F4F4', border: '#E5E5E5' },
    forest: { fg: '#111111', bg: '#F4F4F4', border: '#111111' },
    ancient: { fg: '#FFFFFF', bg: '#111111', border: '#111111' },
  },
  status: { success: '#111111', skip: '#666666', danger: '#BA1A1A', info: '#666666' },
  activity: { none: '#F4F4F4', low: '#D8D8D8', medium: '#9A9A9A', high: '#555555', veryHigh: '#111111' },
  radius: { sm: 4, md: 8, lg: 12, pill: 9999 },
  borderWidth: { hairline: 1, default: 1, bold: 2 },
  spacing: { unit: 4, gutter: 20, marginMobile: 20, stackSm: 8, stackMd: 24, stackLg: 48 },
  typography: {
    displayFontFamily: 'Anton_400Regular',
    bodyFontFamily: 'Lexend_400Regular',
    numericFeatures: 'tnum',
    scale: {
      displayXl: { fontSize: 64, fontWeight: '400', lineHeight: 82, letterSpacing: 1.28 },
      displaySm: { fontSize: 40, fontWeight: '400', lineHeight: 54, letterSpacing: 0.8 },
      titleLg: { fontSize: 32, fontWeight: '400', lineHeight: 44, letterSpacing: 0.64 },
      titleSm: { fontSize: 24, fontWeight: '400', lineHeight: 34, letterSpacing: 0.24 },
      labelCaps: { fontSize: 14, fontWeight: '600', lineHeight: 17, letterSpacing: 0.7 },
      bodyMain: { fontSize: 16, fontWeight: '400', lineHeight: 24, letterSpacing: 0 },
      microBold: { fontSize: 12, fontWeight: '500', lineHeight: 14, letterSpacing: 0.24 },
    },
  },
};

jest.mock('react-native', () => {
  const ReactLocal = require('react');

  const mock = (name: string) => {
    const Component = (props: any) => ReactLocal.createElement(name, props, props.children);
    Component.displayName = name;
    return Component;
  };

  return {
    View: mock('View'),
    Text: mock('Text'),
    TouchableOpacity: mock('TouchableOpacity'),
    Pressable: mock('Pressable'),
  };
});

jest.mock('@expo/vector-icons', () => {
  const ReactLocal = require('react');
  return {
    MaterialIcons: (props: any) => ReactLocal.createElement('MaterialIcons', props, props.name),
  };
});

jest.mock('@core/theming', () => ({
  useTheme: () => mockTheme,
}));

jest.mock('@core/components', () => {
  const ReactLocal = require('react');
  return {
    ProgressBar: (props: any) => ReactLocal.createElement('ProgressBar', props, props.children),
  };
});

const createHabit = (overrides: Partial<HabitWithScore> = {}): HabitWithScore => ({
  id: 'habit-1',
  user_id: 'user-1',
  name: 'Deep Work',
  description: '90 Mins • Focused Output',
  category: 'productivity',
  custom_label: null,
  custom_emoji: null,
  frequency_days: [1, 2, 3, 4, 5],
  created_at: '2026-05-12T00:00:00.000Z',
  archived_at: null,
  mastery_scores: {
    habit_id: 'habit-1',
    user_id: 'user-1',
    score: 8,
    level: 'Seed',
    last_calculated_date: '2026-05-12',
    updated_at: '2026-05-12T00:00:00.000Z',
  },
  ...overrides,
});

describe('DashboardHabitRow', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation((message: unknown) => {
      if (typeof message === 'string' && message.includes('react-test-renderer is deprecated')) return;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders completed state with line-through and no start CTA', () => {
    let tree: any;

    act(() => {
      tree = create(
        React.createElement(DashboardHabitRow, {
          habit: createHabit({ name: 'Morning Hydration' }),
          status: 'completed',
        }),
      );
    });

    const textNodes = tree.root.findAll((node: any) => node.type === 'Text');
    const titleNode = textNodes.find((node: any) => node.props.children === 'Morning Hydration');

    expect(titleNode.props.style.textDecorationLine).toBe('line-through');
    expect(textNodes.some((node: any) => readChildren(node.props.children) === 'Start')).toBe(false);
    expect(textNodes.some((node: any) => readChildren(node.props.children) === '30%')).toBe(false);
  });

  it('renders active state with inline progress and chevron navigation', () => {
    let tree: any;

    act(() => {
      tree = create(
        React.createElement(DashboardHabitRow, {
          habit: createHabit(),
          status: 'active',
          inlineProgressPercent: 30,
        }),
      );
    });

    const textNodes = tree.root.findAll((node: any) => node.type === 'Text');

    expect(textNodes.some((node: any) => readChildren(node.props.children) === 'Start')).toBe(false);
    expect(textNodes.some((node: any) => readChildren(node.props.children) === '30%')).toBe(true);
    expect(tree.root.findAll((node: any) => node.type === 'ProgressBar')).toHaveLength(1);
    expect(
      tree.root.findAll(
        (node: any) => node.type === 'Pressable' && node.props?.testID === 'dashboard-habit-row-chevron-habit-1',
      ),
    ).toHaveLength(1);
  });

  it('renders pending state with fallback category label and no inline progress', () => {
    let tree: any;

    act(() => {
      tree = create(
        React.createElement(DashboardHabitRow, {
          habit: createHabit({
            description: null,
            category: 'health',
            name: 'Zone 2 Cardio',
          }),
          status: 'pending',
        }),
      );
    });

    const textNodes = tree.root.findAll((node: any) => node.type === 'Text');

    expect(textNodes.some((node: any) => readChildren(node.props.children) === 'Salud')).toBe(true);
    expect(textNodes.some((node: any) => readChildren(node.props.children) === 'Start')).toBe(false);
    expect(tree.root.findAll((node: any) => node.type === 'ProgressBar')).toHaveLength(0);
  });
});
