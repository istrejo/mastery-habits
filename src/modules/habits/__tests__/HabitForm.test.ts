import React from 'react';
import { HabitForm } from '../components/HabitForm';

const renderer = require('react-test-renderer');
const { act, create } = renderer;
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

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

const translations: Record<string, string> = {
  'habit_form.name_label': 'Habit Name',
  'habit_form.name_placeholder': 'e.g. Read 30 pages',
  'habit_form.description_label': 'Description',
  'habit_form.description_placeholder': 'Optional context or motivation',
  'habit_form.error_required': 'Required',
  'habit_form.error_name_max': 'Max 80',
  'habit_form.error_days_min': 'Select at least one day',
  'habit_form.save_default': 'Save',
  'create_habit.sections.identity': 'IDENTITY',
  'create_habit.sections.category': 'CATEGORY',
  'create_habit.sections.frequency': 'FREQUENCY',
  'create_habit.frequency_presets.daily': 'DAILY',
  'create_habit.frequency_presets.mon_fri': 'MON-FRI',
  'create_habit.frequency_presets.custom': 'CUSTOM',
  'create_habit.select_days': 'SELECT DAYS',
  'create_habit.custom_category_error': 'Custom requires name and icon',
  'frequency.day_mon': 'M',
  'frequency.day_tue': 'T',
  'frequency.day_wed': 'W',
  'frequency.day_thu': 'T',
  'frequency.day_fri': 'F',
  'frequency.day_sat': 'S',
  'frequency.day_sun': 'S',
  'categories.health.label': 'HEALTH',
  'categories.mind.label': 'MIND',
  'categories.learning.label': 'LEARNING',
  'categories.productivity.label': 'PRODUCTIVITY',
  'categories.nutrition.label': 'NUTRITION',
  'categories.creativity.label': 'CREATIVITY',
  'categories.social.label': 'SOCIAL',
  'categories.finance.label': 'FINANCE',
  'categories.custom.label': 'CUSTOM',
  'custom_category.emoji_label': 'Icon',
  'custom_category.name_label': 'Name',
  'custom_category.name_placeholder': 'My category',
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
  };
});

jest.mock('@expo/vector-icons', () => {
  const ReactLocal = require('react');
  return {
    MaterialIcons: (props: any) => ReactLocal.createElement('MaterialIcons', props, props.name),
  };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => translations[key] ?? key,
  }),
}));

jest.mock('@core/theming', () => ({
  useTheme: () => mockTheme,
}));

jest.mock('@core/components', () => {
  const ReactLocal = require('react');

  return {
    Input: (props: any) => ReactLocal.createElement('Input', props, props.label),
    Button: (props: any) => ReactLocal.createElement('Button', props, props.label),
    Card: (props: any) => ReactLocal.createElement('Card', props, props.children),
  };
});

describe('HabitForm', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation((message: unknown) => {
      if (typeof message === 'string' && message.includes('react-test-renderer is deprecated')) return;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders all domain categories and no redundant iconography section in stitch mode', () => {
    let tree: any;

    act(() => {
      tree = create(
        React.createElement(HabitForm, {
          onSubmit: jest.fn(async () => undefined),
          submitLabel: 'Create habit',
          mode: 'stitch',
        }),
      );
    });

    const labels = tree.root.findAll((node: any) => node.type === 'Text').map((node: any) => String(node.props.children));

    expect(labels).toEqual(expect.arrayContaining([
      'IDENTITY',
      'CATEGORY',
      'FREQUENCY',
      'SELECT DAYS',
      'HEALTH',
      'MIND',
      'LEARNING',
      'PRODUCTIVITY',
      'NUTRITION',
      'CREATIVITY',
      'SOCIAL',
      'FINANCE',
      'CUSTOM',
    ]));
    expect(labels).not.toContain('ICONOGRAPHY');
  });

  it('allows selecting the custom category and reveals the custom controls', () => {
    let tree: any;

    act(() => {
      tree = create(
        React.createElement(HabitForm, {
          onSubmit: jest.fn(async () => undefined),
          submitLabel: 'Create habit',
          mode: 'stitch',
        }),
      );
    });

    const touchables = tree.root.findAll((node: any) => node.type === 'TouchableOpacity');
    const customTrigger = touchables[8];

    act(() => {
      customTrigger.props.onPress();
    });

    const labels = tree.root.findAll((node: any) => node.type === 'Text').map((node: any) => String(node.props.children));
    expect(labels).toEqual(expect.arrayContaining(['Icon']));
    expect(tree.root.findAll((node: any) => node.type === 'Input' && node.props.label === 'Name')).toHaveLength(1);
  });

  it('allows selecting custom frequency and then toggling custom days', () => {
    let tree: any;

    act(() => {
      tree = create(
        React.createElement(HabitForm, {
          onSubmit: jest.fn(async () => undefined),
          submitLabel: 'Create habit',
          mode: 'stitch',
        }),
      );
    });

    let touchables = tree.root.findAll((node: any) => node.type === 'TouchableOpacity');
    const customFrequencyTrigger = touchables[11];

    act(() => {
      customFrequencyTrigger.props.onPress();
    });

    touchables = tree.root.findAll((node: any) => node.type === 'TouchableOpacity');
    const mondayChip = touchables[12];

    act(() => {
      mondayChip.props.onPress();
    });

    expect(mondayChip.props.activeOpacity).toBe(0.82);
  });

  it('submits a HabitInsert payload without changing the existing API shape', async () => {
    const onSubmit = jest.fn(async () => undefined);
    let tree: any;

    act(() => {
      tree = create(
        React.createElement(HabitForm, {
          onSubmit,
          submitLabel: 'Create habit',
          mode: 'stitch',
          defaultValues: {
            name: 'Read 30 pages',
            description: '',
            category: 'learning',
            frequency_days: [1, 2, 3, 4, 5, 6, 7],
          },
        }),
      );
    });

    const button = tree.root.find((node: any) => node.type === 'Button' && node.props.label === 'Create habit');

    await act(async () => {
      await button.props.onPress();
    });

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Read 30 pages',
      frequency_days: [1, 2, 3, 4, 5, 6, 7],
      category: 'learning',
      description: undefined,
      custom_label: null,
      custom_emoji: null,
    });
  });
});
