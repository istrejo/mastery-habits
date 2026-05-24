import { useTasksStore } from '../states/tasks.store';
import type { Task } from '../types';

const task = (id: string): Task => ({
  id,
  user_id: 'u1',
  habit_id: null,
  title: `Task ${id}`,
  description: null,
  due_date: null,
  status: 'pending',
  completed_at: null,
  created_at: new Date().toISOString(),
});

beforeEach(() => {
  useTasksStore.setState({ tasks: [] });
});

describe('useTasksStore', () => {
  it('setTasks replaces the list', () => {
    const tasks = [task('1'), task('2')];
    useTasksStore.getState().setTasks(tasks);
    expect(useTasksStore.getState().tasks).toHaveLength(2);
  });

  it('upsertTask inserts a new task', () => {
    useTasksStore.getState().upsertTask(task('1'));
    expect(useTasksStore.getState().tasks).toHaveLength(1);
  });

  it('upsertTask updates an existing task', () => {
    useTasksStore.getState().upsertTask(task('1'));
    const updated = { ...task('1'), title: 'Updated' };
    useTasksStore.getState().upsertTask(updated);
    expect(useTasksStore.getState().tasks).toHaveLength(1);
    expect(useTasksStore.getState().tasks[0]?.title).toBe('Updated');
  });

  it('removeTask removes by id', () => {
    useTasksStore.getState().setTasks([task('1'), task('2')]);
    useTasksStore.getState().removeTask('1');
    expect(useTasksStore.getState().tasks).toHaveLength(1);
    expect(useTasksStore.getState().tasks[0]?.id).toBe('2');
  });
});
