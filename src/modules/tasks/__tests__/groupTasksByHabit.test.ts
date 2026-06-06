import { groupTasksByHabit } from '../utils/groupTasksByHabit';
import type { Task } from '../types';

const task = (id: string, habit_id: string | null): Task => ({
  id,
  user_id: 'u1',
  habit_id,
  title: `Task ${id}`,
  description: null,
  due_date: null,
  status: 'pending',
  completed_at: null,
  created_at: new Date().toISOString(),
});

describe('groupTasksByHabit', () => {
  it('returns empty object for empty input', () => {
    expect(groupTasksByHabit([])).toEqual({});
  });

  it('groups tasks by habit_id', () => {
    const tasks = [task('1', 'h1'), task('2', 'h1'), task('3', 'h2')];
    const result = groupTasksByHabit(tasks);
    expect(result['h1']).toHaveLength(2);
    expect(result['h2']).toHaveLength(1);
  });

  it('groups tasks without habit under "none"', () => {
    const tasks = [task('1', null), task('2', null)];
    const result = groupTasksByHabit(tasks);
    expect(result['none']).toHaveLength(2);
    expect(Object.keys(result)).toEqual(['none']);
  });

  it('handles mixed habit_id and null', () => {
    const tasks = [task('1', 'h1'), task('2', null)];
    const result = groupTasksByHabit(tasks);
    expect(result['h1']).toHaveLength(1);
    expect(result['none']).toHaveLength(1);
  });
});
