import { isOverdue } from '../utils/isOverdue';
import type { Task } from '../types';

const baseTask = (overrides: Partial<Task> = {}): Task => ({
  id: '1',
  user_id: 'u1',
  habit_id: null,
  title: 'Test',
  description: null,
  due_date: null,
  status: 'pending',
  completed_at: null,
  created_at: new Date().toISOString(),
  ...overrides,
});

const TODAY = new Date('2026-05-24');

describe('isOverdue', () => {
  it('returns false when no due_date', () => {
    expect(isOverdue(baseTask(), TODAY)).toBe(false);
  });

  it('returns false when due today', () => {
    expect(isOverdue(baseTask({ due_date: '2026-05-24' }), TODAY)).toBe(false);
  });

  it('returns true when due in the past', () => {
    expect(isOverdue(baseTask({ due_date: '2026-05-23' }), TODAY)).toBe(true);
  });

  it('returns false when due in the future', () => {
    expect(isOverdue(baseTask({ due_date: '2026-05-25' }), TODAY)).toBe(false);
  });

  it('returns false when already completed, even if past due', () => {
    expect(
      isOverdue(
        baseTask({ due_date: '2026-05-23', status: 'completed', completed_at: new Date().toISOString() }),
        TODAY,
      ),
    ).toBe(false);
  });
});
