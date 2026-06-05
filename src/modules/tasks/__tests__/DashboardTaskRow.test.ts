import React from 'react';
import { DashboardTaskRow } from '../components/DashboardTaskRow';
import type { TaskWithHabit } from '../types';

const renderer = require('react-test-renderer');
const { act, create } = renderer;
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const mockTheme = {
  bg: { base: '#FAFAFA', surface: '#FFFFFF', surfaceAlt: '#F4F4F4', elevated: '#FFFFFF' },
  border: { subtle: '#E5E5E5', default: '#E5E5E5', strong: '#111111' },
  text: { primary: '#111111', secondary: '#666666', tertiary: '#A3A3A3', inverse: '#FFFFFF' },
  accent: { primary: '#111111', onPrimary: '#FFFFFF', muted: 'rgba(17,17,17,0.10)' },
  status: { success: '#111111', skip: '#666666', danger: '#BA1A1A', info: '#666666' },
  radius: { sm: 4, md: 8, lg: 12, pill: 9999 },
  borderWidth: { hairline: 1, default: 1, bold: 2 },
  spacing: { unit: 4, gutter: 20, marginMobile: 20, stackSm: 8, stackMd: 24, stackLg: 48 },
  typography: {
    scale: {
      bodyMain: { fontSize: 16, lineHeight: 24 },
      microBold: { fontSize: 12, lineHeight: 14, letterSpacing: 0.24 },
      labelCaps: { fontSize: 14, lineHeight: 17, letterSpacing: 0.7 },
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
  const AnimatedComponent = mock('AnimatedComponent');
  return {
    View: mock('View'),
    Text: mock('Text'),
    TouchableOpacity: mock('TouchableOpacity'),
    ActivityIndicator: mock('ActivityIndicator'),
    Animated: {
      View: mock('AnimatedView'),
      Text: mock('AnimatedText'),
      Value: class {
        value: number;

        constructor(value: number) {
          this.value = value;
        }

        setValue(next: number) {
          this.value = next;
        }

        interpolate() {
          return this.value;
        }
      },
      createAnimatedComponent: () => AnimatedComponent,
      timing: () => ({ start: () => undefined }),
      sequence: () => ({ start: () => undefined }),
      parallel: () => ({ start: () => undefined }),
    },
  };
});

jest.mock('@expo/vector-icons', () => {
  const ReactLocal = require('react');
  return { MaterialIcons: (props: any) => ReactLocal.createElement('MaterialIcons', props, props.name) };
});

jest.mock('@core/components', () => ({ ProgressBar: (props: any) => React.createElement('ProgressBar', props) }));
jest.mock('@core/theming', () => ({ useTheme: () => mockTheme }));

const task = (overrides: Partial<TaskWithHabit> = {}): TaskWithHabit => ({
  id: 'task-1',
  user_id: 'user-1',
  habit_id: null,
  title: 'Ship feature',
  description: 'Notes',
  due_date: '2026-05-25',
  status: 'pending',
  completed_at: null,
  created_at: '2026-05-25T00:00:00.000Z',
  habits: null,
  task_subtasks: [
    { id: 'sub-1', task_id: 'task-1', user_id: 'user-1', title: 'Write tests', status: 'completed', completed_at: '2026-05-25T09:00:00.000Z', order_index: 0, created_at: '2026-05-25T00:00:00.000Z' },
    { id: 'sub-2', task_id: 'task-1', user_id: 'user-1', title: 'Implement', status: 'pending', completed_at: null, order_index: 1, created_at: '2026-05-25T00:00:00.000Z' },
  ],
  ...overrides,
});

describe('DashboardTaskRow', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation((message: unknown) => {
      if (typeof message === 'string' && message.includes('react-test-renderer is deprecated')) return;
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('renders subtask checkboxes and a progress circle percentage', () => {
    let tree: any;
    act(() => {
      tree = create(React.createElement(DashboardTaskRow, { task: task(), status: 'active' }));
    });

    const subtaskChecks = tree.root.findAll((node: any) => node.type === 'TouchableOpacity' && String(node.props.testID ?? '').startsWith('dashboard-subtask-check-'));
    const progress = tree.root.findByProps({ testID: 'dashboard-task-progress-task-1' });

    expect(subtaskChecks).toHaveLength(2);
    expect(progress.props.children).toContain('50%');
  });

  it('emits subtask toggles with the selected subtask id', () => {
    const onPressSubtask = jest.fn();
    let tree: any;
    act(() => {
      tree = create(React.createElement(DashboardTaskRow, { task: task(), status: 'active', onPressSubtask }));
    });

    const pendingSubtask = tree.root.findByProps({ testID: 'dashboard-subtask-check-sub-2' });
    act(() => pendingSubtask.props.onPress());

    expect(onPressSubtask).toHaveBeenCalledWith('sub-2');
  });
});
