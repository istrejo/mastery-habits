import React from 'react';
import TodayScreen from '../today';
import type { TaskWithHabit } from '@tasks/index';

const renderer = require('react-test-renderer');
const { act, create } = renderer;
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const readChildren = (children: unknown): string => Array.isArray(children) ? children.join('') : String(children);

const pushMock = jest.fn();
const useTodayTasksMock = jest.fn();
const useTaskActionsMock = jest.fn();
const useHabitsMock = jest.fn();
const useTodayCheckInsMock = jest.fn();
const dashboardTaskRowMock = jest.fn((props: any) => React.createElement('DashboardTaskRow', props));
const taskCreateSheetMock = jest.fn((props: any) => React.createElement('TaskCreateSheet', props));
const dashboardHabitRowMock = jest.fn((props: any) => React.createElement('DashboardHabitRow', props));
const updateTaskOptimisticMock = jest.fn();
const updateSubtaskOptimisticMock = jest.fn();

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
    Alert: { alert: jest.fn() },
    View: mock('View'),
    Text: mock('Text'),
    TouchableOpacity: mock('TouchableOpacity'),
    Pressable: mock('Pressable'),
    ScrollView: mock('ScrollView'),
    ActivityIndicator: mock('ActivityIndicator'),
  };
});

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'en' },
    t: (key: string, params?: { count?: number; completed?: number }) => {
      if (key === 'dashboard.app_name') return 'Mastery Habits';
      if (key === 'dashboard.empty_tasks_title') return 'No tasks for today';
      if (key === 'dashboard.empty_tasks_body') return 'Create a task with a due date to make it show here.';
      if (key === 'dashboard.create_task') return '+ Create task';
      if (key === 'dashboard.tasks_today') return `${params?.count ?? 0} tasks due today`;
      if (key === 'dashboard.tasks_section') return 'Today Tasks';
      if (key === 'dashboard.tasks_completed') return `${params?.completed ?? 0} / ${params?.count ?? 0} Completed`;
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

jest.mock('@core/theming', () => ({ useTheme: () => mockTheme }));
jest.mock('@core/i18n', () => ({ useDateLocale: () => undefined }));
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
    ProgressBar: mock('ProgressBar'),
    SyncIndicator: mock('SyncIndicator'),
  };
});

const mockConfig = {
  tasks: [] as TaskWithHabit[],
  handleInlineToggle: jest.fn().mockResolvedValue(undefined) as jest.Mock<Promise<void>, [TaskWithHabit]>,
  handleSubtaskToggle: jest.fn().mockResolvedValue(undefined) as jest.Mock<Promise<void>, [TaskWithHabit, string]>,
  handleSheetSubmit: jest.fn().mockResolvedValue(undefined) as jest.Mock<Promise<void>, [{ title: string; notes?: string | null; subtasks?: Array<{ title: string; completed: boolean }> }]>,
};

const useTodayScreenMock = jest.fn().mockImplementation(() => {
  const [sheetVisible, setSheetVisible] = React.useState(false);
  return {
    tasks: mockConfig.tasks,
    loading: false,
    todayLabel: 'Monday, May 24',
    isDaytime: true,
    completedCount: 0,
    activeTaskId: undefined,
    completedAllToday: false,
    getTaskStatus: (task: TaskWithHabit) => task.status === 'completed' ? 'completed' : 'pending',
    submittingTaskIds: new Set(),
    submittingHabitIds: new Set(),
    sheetVisible,
    sheetTask: null,
    submittingSheet: false,
    openCreateSheet: () => setSheetVisible(true),
    openEditSheet: jest.fn(),
    handleInlineToggle: mockConfig.handleInlineToggle,
    handleSubtaskToggle: mockConfig.handleSubtaskToggle,
    handleSheetSubmit: mockConfig.handleSheetSubmit,
    closeSheet: jest.fn(),
  };
});

jest.mock('@tasks/index', () => ({
  useTodayScreen: () => useTodayScreenMock(),
  useTodayTasks: () => useTodayTasksMock(),
  useTaskActions: () => useTaskActionsMock(),
  useTaskAutoSync: jest.fn(),
  DashboardTaskRow: (props: any) => dashboardTaskRowMock(props),
  TaskCreateSheet: (props: any) => taskCreateSheetMock(props),
}));

jest.mock('@habits/index', () => ({
  useHabits: () => useHabitsMock(),
  DashboardHabitRow: (props: any) => dashboardHabitRowMock(props),
}));

jest.mock('@checkin/index', () => ({
  useTodayCheckIns: () => useTodayCheckInsMock(),
}));

const createTask = (id: string, overrides: Partial<TaskWithHabit> = {}): TaskWithHabit => ({
  id,
  user_id: 'user-1',
  habit_id: null,
  title: `Task ${id}`,
  description: `Description ${id}`,
  due_date: '2026-05-24',
  status: 'pending',
  completed_at: null,
  created_at: '2026-05-24T00:00:00.000Z',
  habits: null,
  task_subtasks: [],
  ...overrides,
});

const setup = (overrides: Partial<{
  tasks: TaskWithHabit[];
  handleInlineToggle: jest.Mock<Promise<void>, [TaskWithHabit]>;
  handleSubtaskToggle: jest.Mock<Promise<void>, [TaskWithHabit, string]>;
  handleSheetSubmit: jest.Mock<Promise<void>, [{ title: string; notes?: string | null; subtasks?: Array<{ title: string; completed: boolean }> }]>;
}> = {}) => {
  mockConfig.tasks = overrides.tasks ?? [];
  mockConfig.handleInlineToggle = overrides.handleInlineToggle ?? jest.fn().mockResolvedValue(undefined);
  mockConfig.handleSubtaskToggle = overrides.handleSubtaskToggle ?? jest.fn().mockResolvedValue(undefined);
  mockConfig.handleSheetSubmit = overrides.handleSheetSubmit ?? jest.fn().mockResolvedValue(undefined);
  useHabitsMock.mockReturnValue({ habits: [], loading: false });
  useTodayCheckInsMock.mockReturnValue({
    completedToday: new Set(),
    submittingHabitIds: new Set(),
    completeHabit: jest.fn().mockResolvedValue(undefined),
    undoHabit: jest.fn().mockResolvedValue(undefined),
  });
  useTodayTasksMock.mockReturnValue({
    tasks: overrides.tasks ?? [],
    loading: false,
    refresh: jest.fn(),
    updateTaskOptimistic: updateTaskOptimisticMock,
    updateSubtaskOptimistic: updateSubtaskOptimisticMock,
  });
  useTaskActionsMock.mockReturnValue({
    completeTask: jest.fn().mockResolvedValue(createTask('updated', { status: 'completed' })),
    uncompleteTask: jest.fn().mockResolvedValue(createTask('updated')),
    createTaskWithSubtasks: jest.fn().mockResolvedValue(createTask('created')),
    updateTaskWithSubtasks: jest.fn().mockResolvedValue(createTask('updated')),
    toggleSubtask: jest.fn().mockResolvedValue(createTask('updated')),
    deleteTask: jest.fn().mockResolvedValue(true),
  });
};

describe('TodayScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    updateTaskOptimisticMock.mockReset();
    updateSubtaskOptimisticMock.mockReset();
    jest.spyOn(console, 'error').mockImplementation((message: unknown) => {
      if (typeof message === 'string' && message.includes('react-test-renderer is deprecated')) return;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders today tasks with DashboardTaskRow and removes habit rows / Next Block', () => {
    setup({
      tasks: [
        createTask('task-1', { title: 'Write proposal' }),
        createTask('task-2', { title: 'Train', habit_id: 'habit-1', habits: { id: 'habit-1', name: 'Fitness' } }),
      ],
    });

    let tree: any;
    act(() => {
      tree = create(React.createElement(TodayScreen));
    });

    const textNodes = tree.root.findAll((node: any) => node.type === 'Text');

    expect(dashboardTaskRowMock).toHaveBeenCalledTimes(2);
    expect(dashboardHabitRowMock).not.toHaveBeenCalled();
    expect(textNodes.some((node: any) => readChildren(node.props.children) === 'Next Block')).toBe(false);
    expect(textNodes.some((node: any) => readChildren(node.props.children) === 'Today Tasks')).toBe(true);
  });

  it('opens a swipe task creation sheet instead of navigating to a new task route', () => {
    setup();

    let tree: any;
    act(() => {
      tree = create(React.createElement(TodayScreen));
    });

    const addButtons = tree.root.findAll((node: any) => node.type === 'Pressable' && node.props.testID === 'today-add-task');
    expect(addButtons).toHaveLength(2);

    expect(taskCreateSheetMock).toHaveBeenLastCalledWith(expect.objectContaining({ visible: false }));

    act(() => {
      addButtons[0].props.onPress();
    });

    expect(pushMock).not.toHaveBeenCalled();
    expect(taskCreateSheetMock).toHaveBeenLastCalledWith(expect.objectContaining({ visible: true }));
  });



  it('creates a Today task from the sheet with name, notes, and subtasks', async () => {
    const handleSheetSubmit = jest.fn().mockResolvedValue(undefined);
    setup({ handleSheetSubmit });

    act(() => {
      create(React.createElement(TodayScreen));
    });

    const sheetProps = taskCreateSheetMock.mock.calls.at(-1)?.[0];
    await act(async () => {
      await sheetProps.onSubmit({ title: 'Plan launch', notes: 'No shortcuts', subtasks: ['Write tests', 'Ship'] });
    });

    expect(handleSheetSubmit).toHaveBeenCalledWith({
      title: 'Plan launch',
      notes: 'No shortcuts',
      subtasks: ['Write tests', 'Ship'],
    });
  });

  it('registers the linked habit check-in once when completing a linked pending task', async () => {
    const handleInlineToggle = jest.fn().mockResolvedValue(undefined);
    setup({
      tasks: [createTask('task-1', { habit_id: 'habit-1', habits: { id: 'habit-1', name: 'Fitness' } })],
      handleInlineToggle,
    });

    act(() => {
      create(React.createElement(TodayScreen));
    });

    const [rowProps] = dashboardTaskRowMock.mock.calls[0] as [any];
    await act(async () => {
      await rowProps.onPressCheck();
    });

    expect(handleInlineToggle).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'task-1', habit_id: 'habit-1' })
    );
  });

  it('does not register a habit check-in again when the linked habit is already completed today', async () => {
    const handleInlineToggle = jest.fn().mockResolvedValue(undefined);
    setup({
      tasks: [createTask('task-1', { habit_id: 'habit-1', habits: { id: 'habit-1', name: 'Fitness' } })],
      handleInlineToggle,
    });

    act(() => {
      create(React.createElement(TodayScreen));
    });

    const [rowProps] = dashboardTaskRowMock.mock.calls[0] as [any];
    await act(async () => {
      await rowProps.onPressCheck();
    });

    expect(handleInlineToggle).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'task-1', habit_id: 'habit-1' })
    );
  });

  it('keeps the habit check-in when unchecking one linked task but another linked task remains completed', async () => {
    const handleInlineToggle = jest.fn().mockResolvedValue(undefined);
    setup({
      tasks: [
        createTask('task-1', { habit_id: 'habit-1', status: 'completed', completed_at: '2026-05-24T10:00:00.000Z' }),
        createTask('task-2', { habit_id: 'habit-1', status: 'completed', completed_at: '2026-05-24T11:00:00.000Z' }),
      ],
      handleInlineToggle,
    });

    act(() => {
      create(React.createElement(TodayScreen));
    });

    const [rowProps] = dashboardTaskRowMock.mock.calls[0] as [any];
    await act(async () => {
      await rowProps.onPressCheck();
    });

    expect(handleInlineToggle).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'task-1', habit_id: 'habit-1' })
    );
  });

  it('forwards subtask toggles from task rows to task actions', async () => {
    const handleSubtaskToggle = jest.fn().mockResolvedValue(undefined);
    setup({
      tasks: [createTask('task-1', {
        task_subtasks: [
          { id: 'sub-1', task_id: 'task-1', user_id: 'user-1', title: 'Write tests', status: 'pending', completed_at: null, order_index: 0, created_at: '2026-05-25T00:00:00.000Z' },
        ],
      })],
      handleSubtaskToggle,
    });

    act(() => {
      create(React.createElement(TodayScreen));
    });

    const [rowProps] = dashboardTaskRowMock.mock.calls[0] as [any];
    await act(async () => {
      await rowProps.onPressSubtask('sub-1');
    });

    expect(handleSubtaskToggle).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'task-1' }),
      'sub-1'
    );
  });

});
