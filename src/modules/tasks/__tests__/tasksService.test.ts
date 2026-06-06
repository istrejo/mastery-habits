import { tasksService } from '../services/tasks.service';

const getStateMock = jest.fn();
const fromMock = jest.fn();

jest.mock('@core/states/session.store', () => ({
  useSessionStore: { getState: () => getStateMock() },
}));

jest.mock('@core/lib/supabase', () => ({
  supabase: { from: (...args: unknown[]) => fromMock(...args) },
}));

const createQuery = () => {
  const query: any = {
    select: jest.fn(() => query),
    eq: jest.fn(() => query),
    or: jest.fn(() => query),
    order: jest.fn(() => Promise.resolve({ data: [], error: null })),
  };
  return query;
};

describe('tasksService.listToday', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-24T12:00:00.000Z'));
    jest.clearAllMocks();
    getStateMock.mockReturnValue({ user: { id: 'user-1' } });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('queries due-today and overdue pending tasks plus tasks completed today', async () => {
    const query = createQuery();
    fromMock.mockReturnValue(query);

    await tasksService.listToday();

    expect(fromMock).toHaveBeenCalledWith('tasks');
    expect(query.eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(query.or).toHaveBeenCalledTimes(1);

    const filter = query.or.mock.calls[0][0] as string;
    expect(filter).toContain('status.eq.pending');
    expect(filter).toContain('due_date.lte.2026-05-24');
    expect(filter).toContain('status.eq.completed');
    expect(filter).toContain('completed_at.gte.');
    expect(filter).toContain('completed_at.lt.');
    expect(filter).not.toContain('due_date.is.null');
  });
});
