import React from 'react';
import StatsScreen from '../stats';

const renderer = require('react-test-renderer');
const { act, create } = renderer;
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const pushMock = jest.fn();
const useStatsMetricsMock = jest.fn();
const resolveCategoryMock = jest.fn();

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

const readChildren = (children: unknown): string => Array.isArray(children) ? children.join('') : String(children);

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
    ScrollView: mock('ScrollView'),
  };
});

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: { count?: number }) => {
      if (key === 'dashboard.app_name') return 'Mastery Habits';
      if (key === 'stats.current_streak') return 'Current Streak';
      if (key === 'stats.days') return 'Days';
      if (key === 'stats.best_streak') return `Best: ${params?.count ?? 0} days`;
      if (key === 'stats.top_habits') return 'Top Habits';
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
    ProgressBar: (props: any) => ReactLocal.createElement('ProgressBar', props, null),
  };
});

jest.mock('@core/theming', () => ({
  useTheme: () => mockTheme,
}));

jest.mock('@commitment/index', () => ({
  useStatsMetrics: () => useStatsMetricsMock(),
}));

jest.mock('@habits/index', () => ({
  resolveCategory: (...args: any[]) => resolveCategoryMock(...args),
}));

describe('StatsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resolveCategoryMock.mockReturnValue({ label: 'Focus' });
    useStatsMetricsMock.mockReturnValue({
      globalCurrentStreak: 14,
      globalBestStreak: 19,
      completion30d: { completed: 26, planned: 30, percent: 87 },
      completionCurrentWeek: { completed: 6, planned: 7, percent: 86 },
      completionPreviousWeek: { completed: 5, planned: 7, percent: 71 },
      completionDeltaVsPrevWeek: 15,
      activity30dCells: Array.from({ length: 30 }, (_, index) => ({
        dateKey: `2026-05-${String(index + 1).padStart(2, '0')}`,
        plannedCount: 1,
        successCount: index % 2 === 0 ? 1 : 0,
        ratio: index % 2 === 0 ? 1 : 0,
        intensity: index % 2 === 0 ? 'veryHigh' : 'low',
        isToday: index === 29,
      })),
      topHabitsByCurrentStreak: [
        {
          habit: { id: 'habit-1', name: 'Morning Run', category: 'health', custom_label: null, custom_emoji: null },
          currentStreak: 28,
          bestStreak: 28,
          masteryScore: 92,
        },
        {
          habit: { id: 'habit-2', name: 'Deep Work', category: 'productivity', custom_label: null, custom_emoji: null },
          currentStreak: 14,
          bestStreak: 20,
          masteryScore: 90,
        },
        {
          habit: { id: 'habit-3', name: 'Read 20 Pages', category: 'learning', custom_label: null, custom_emoji: null },
          currentStreak: 8,
          bestStreak: 11,
          masteryScore: 88,
        },
      ],
      loading: false,
    });
  });

  it('renders the Stitch-aligned streak hero, completion card, activity badge, and top habits rows', () => {
    let tree: any;

    act(() => {
      tree = create(React.createElement(StatsScreen));
    });

    const textNodes = tree.root.findAll((node: any) => node.type === 'Text');
    const values = textNodes.map((node: any) => readChildren(node.props.children));

    expect(values).toContain('Stats');
    expect(values).toContain('14 Days');
    expect(values).toContain('87%');
    expect(values).toContain('Last 30 Days');
    expect(values).toContain('Top Habits');
    expect(values).toContain('Morning Run');
    expect(values).toContain('28 Days');
  });

  it('navigates to a habit detail row when tapped', () => {
    let tree: any;

    act(() => {
      tree = create(React.createElement(StatsScreen));
    });

    const buttons = tree.root.findAll((node: any) => node.type === 'TouchableOpacity');
    const firstHabitRow = buttons[1];

    act(() => {
      firstHabitRow.props.onPress();
    });

    expect(pushMock).toHaveBeenCalledWith('/habit/habit-1');
  });
});
