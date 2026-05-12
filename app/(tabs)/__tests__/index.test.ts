import React from 'react';
import type { HabitWithScore } from '@habits/types';
import DashboardScreen from '../index';

const renderer = require('react-test-renderer');
const { act, create } = renderer;
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const readChildren = (children: unknown): string => Array.isArray(children) ? children.join('') : String(children);

const pushMock = jest.fn();
const useHabitsMock = jest.fn();
const useTodayCheckInsMock = jest.fn();
const isPlannedDayMock = jest.fn();
const dashboardHabitRowMock = jest.fn((props: any) => React.createElement('DashboardHabitRow', props));

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
    ScrollView: mock('ScrollView'),
  };
});

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'en' },
    t: (key: string, params?: { count?: number }) => {
      if (key === 'dashboard.app_name') return 'Mastery Habits';
      if (key === 'dashboard.empty_title') return 'No habits yet';
      if (key === 'dashboard.empty_body') return 'Create your first habit';
      if (key === 'dashboard.create_habit') return 'Create habit';
      if (key === 'dashboard.habits_today') return `${params?.count ?? 0} habits planned for today`;
      return key;
    },
  }),
}));

jest.mock('@expo/vector-icons', () => {
  const ReactLocal = require('react');
  return {
    MaterialIcons: (props: any) => ReactLocal.createElement('MaterialIcons', props, props.name),
  };
});

jest.mock('@core/theming', () => ({
  useTheme: () => mockTheme,
}));

jest.mock('@core/i18n', () => ({
  useDateLocale: () => undefined,
}));

jest.mock('@core/components', () => {
  const ReactLocal = require('react');
  const mock = (name: string) => {
    const Component = (props: any) => ReactLocal.createElement(name, props, props.children);
    Component.displayName = name;
    return Component;
  };

  return {
    Screen: mock('Screen'),
    Card: mock('Card'),
    Skeleton: mock('Skeleton'),
    Button: (props: any) => ReactLocal.createElement('Button', props, props.label),
  };
});

jest.mock('@habits/index', () => ({
  useHabits: () => useHabitsMock(),
  DashboardHabitRow: (props: any) => dashboardHabitRowMock(props),
}));

jest.mock('@checkin/index', () => ({
  useTodayCheckIns: () => useTodayCheckInsMock(),
  isPlannedDay: (...args: any[]) => isPlannedDayMock(...args),
}));

const createHabit = (id: string, overrides: Partial<HabitWithScore> = {}): HabitWithScore => ({
  id,
  user_id: 'user-1',
  name: `Habit ${id}`,
  description: `Description ${id}`,
  category: 'productivity',
  custom_label: null,
  custom_emoji: null,
  frequency_days: [1, 2, 3, 4, 5],
  created_at: '2026-05-12T00:00:00.000Z',
  archived_at: null,
  mastery_scores: {
    habit_id: id,
    user_id: 'user-1',
    score: 20,
    level: 'Seed',
    last_calculated_date: '2026-05-12',
    updated_at: '2026-05-12T00:00:00.000Z',
  },
  ...overrides,
});

describe('DashboardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation((message: unknown) => {
      if (typeof message === 'string' && message.includes('react-test-renderer is deprecated')) return;
    });
    isPlannedDayMock.mockReturnValue(true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('uses DashboardHabitRow for each habit and marks statuses correctly', () => {
    const habits = [
      createHabit('habit-1', { name: 'Morning Hydration' }),
      createHabit('habit-2', { name: 'Deep Work' }),
      createHabit('habit-3', { name: 'Zone 2 Cardio' }),
    ];

    useHabitsMock.mockReturnValue({ habits, loading: false });
    useTodayCheckInsMock.mockReturnValue({ completedToday: new Set(['habit-1']) });

    act(() => {
      create(React.createElement(DashboardScreen));
    });

    const calls = dashboardHabitRowMock.mock.calls as Array<[any]>;

    expect(dashboardHabitRowMock).toHaveBeenCalledTimes(3);
    expect(calls[0]![0].status).toBe('completed');
    expect(calls[1]![0].status).toBe('active');
    expect(calls[1]![0].showStartAction).toBe(true);
    expect(calls[2]![0].status).toBe('pending');
  });

  it('shows Recovery fallback when all planned habits are completed', () => {
    const habits = [
      createHabit('habit-1', { name: 'Morning Hydration' }),
      createHabit('habit-2', { name: 'Mobility Routine' }),
    ];

    useHabitsMock.mockReturnValue({ habits, loading: false });
    useTodayCheckInsMock.mockReturnValue({ completedToday: new Set(['habit-1', 'habit-2']) });

    let tree: any;
    act(() => {
      tree = create(React.createElement(DashboardScreen));
    });

    const textNodes = tree.root.findAll((node: any) => node.type === 'Text');

    expect(textNodes.some((node: any) => readChildren(node.props.children) === 'Recovery')).toBe(true);
    expect(textNodes.some((node: any) => readChildren(node.props.children) === 'Optimal alignment detected.')).toBe(true);
  });
});
