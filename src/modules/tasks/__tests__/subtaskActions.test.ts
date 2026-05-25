import { tasksService } from '../services/tasks.service';

const getStateMock = jest.fn();
const fromMock = jest.fn();

jest.mock('@core/states/session.store', () => ({
  useSessionStore: { getState: () => getStateMock() },
}));

jest.mock('@core/lib/supabase', () => ({
  supabase: { from: (...args: unknown[]) => fromMock(...args) },
}));

const makeTaskQuery = (task: any) => {
  const query: any = {
    insert: jest.fn(() => query),
    update: jest.fn(() => query),
    eq: jest.fn(() => query),
    select: jest.fn(() => query),
    single: jest.fn(() => Promise.resolve({ data: task, error: null })),
  };
  return query;
};

const makeSubtaskInsertQuery = () => {
  const query: any = {
    insert: jest.fn(() => query),
    select: jest.fn(() => query),
    order: jest.fn(() => Promise.resolve({ data: [], error: null })),
  };
  return query;
};

describe('tasksService subtasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getStateMock.mockReturnValue({ user: { id: 'user-1' } });
  });

  it('creates a task with notes and ordered subtasks', async () => {
    const task = { id: 'task-1', user_id: 'user-1', title: 'Plan launch', description: 'No shortcuts', due_date: '2026-05-25', status: 'pending', completed_at: null, created_at: '2026-05-25T00:00:00.000Z', habits: null, task_subtasks: [] };
    const taskQuery = makeTaskQuery(task);
    const subtaskQuery = makeSubtaskInsertQuery();
    fromMock.mockImplementation((table: string) => table === 'tasks' ? taskQuery : subtaskQuery);

    await tasksService.createWithSubtasks({ title: 'Plan launch', notes: 'No shortcuts', subtasks: ['Write tests', 'Ship'] });

    expect(fromMock).toHaveBeenCalledWith('tasks');
    expect(taskQuery.insert).toHaveBeenCalledWith(expect.objectContaining({ title: 'Plan launch', description: 'No shortcuts', user_id: 'user-1' }));
    expect(fromMock).toHaveBeenCalledWith('task_subtasks');
    expect(subtaskQuery.insert).toHaveBeenCalledWith([
      expect.objectContaining({ task_id: 'task-1', user_id: 'user-1', title: 'Write tests', order_index: 0 }),
      expect.objectContaining({ task_id: 'task-1', user_id: 'user-1', title: 'Ship', order_index: 1 }),
    ]);
  });

  it('completes all subtasks when completing a task', async () => {
    const task = { id: 'task-1', user_id: 'user-1', title: 'Plan launch', description: null, due_date: '2026-05-25', status: 'completed', completed_at: 'now', created_at: '2026-05-25T00:00:00.000Z', habits: null, task_subtasks: [] };
    const taskQuery = makeTaskQuery(task);
    const subtaskQuery: any = { update: jest.fn(() => subtaskQuery), eq: jest.fn(() => Promise.resolve({ error: null })) };
    fromMock.mockImplementation((table: string) => table === 'tasks' ? taskQuery : subtaskQuery);

    await tasksService.complete('task-1');

    expect(fromMock).toHaveBeenCalledWith('task_subtasks');
    expect(subtaskQuery.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'completed' }));
    expect(subtaskQuery.eq).toHaveBeenCalledWith('task_id', 'task-1');
  });
});
