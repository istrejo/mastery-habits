import { CheckInError, checkinService } from '../services/checkin.service';
import { useScoreStore } from '@commitment/states/score.store';

const registerCheckInMock = jest.fn();
const setScoreMock = jest.fn();

jest.mock('@core/lib/supabase', () => ({
  supabase: { rpc: jest.fn() },
}));

jest.mock('@commitment/services/score.service', () => ({
  scoreService: {
    registerCheckIn: (...args: unknown[]) => registerCheckInMock(...args),
  },
}));

jest.mock('@commitment/states/score.store', () => ({
  useScoreStore: {
    getState: () => ({ setScore: setScoreMock }),
  },
}));

describe('checkinService.register — error mapping', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const date = new Date('2026-06-06T12:00:00Z');

  const errorCodes: Array<{ code: string; expected: string }> = [
    { code: 'cannot_recover_missed_day', expected: 'cannot_recover_missed_day' },
    { code: 'checkin_too_old', expected: 'checkin_too_old' },
    { code: 'checkin_in_future', expected: 'checkin_in_future' },
    { code: 'weekly_skip_already_used', expected: 'weekly_skip_already_used' },
    { code: 'habit_not_found', expected: 'habit_not_found' },
    { code: 'unauthenticated', expected: 'unauthenticated' },
  ];

  it.each(errorCodes)('maps known SQL code "$code" to CheckInError with code "$expected"', async ({ code, expected }) => {
    registerCheckInMock.mockRejectedValueOnce(new Error(code));

    try {
      await checkinService.register('habit-1', date, 'completed');
      throw new Error('expected throw');
    } catch (err) {
      expect(err).toBeInstanceOf(CheckInError);
      expect((err as CheckInError).code).toBe(expected);
    }
  });

  it('maps unknown error message to CheckInError with code "unknown_error"', async () => {
    registerCheckInMock.mockRejectedValueOnce(new Error('something unexpected'));

    await expect(checkinService.register('habit-1', date, 'completed')).rejects.toMatchObject({
      code: 'unknown_error',
    });
  });

  it('maps non-Error throws to CheckInError with code "unknown_error"', async () => {
    registerCheckInMock.mockRejectedValueOnce('string error');

    await expect(checkinService.register('habit-1', date, 'completed')).rejects.toMatchObject({
      code: 'unknown_error',
    });
  });

  it('returns the score result on success', async () => {
    registerCheckInMock.mockResolvedValueOnce({ score: 60, level: 'sprout', used_skip: false });

    const result = await checkinService.register('habit-1', date, 'completed');
    expect(result).toEqual({ score: 60, level: 'sprout', used_skip: false });
  });

  it('updates the score store on success', async () => {
    registerCheckInMock.mockResolvedValueOnce({ score: 80, level: 'tree', used_skip: false });

    await checkinService.register('habit-1', date, 'completed');
    expect(setScoreMock).toHaveBeenCalledWith('habit-1', 80, 'tree');
  });

  it('does not call the score store on failure', async () => {
    registerCheckInMock.mockRejectedValueOnce(new Error('cannot_recover_missed_day'));

    await expect(checkinService.register('habit-1', date, 'completed')).rejects.toBeInstanceOf(CheckInError);
    expect(setScoreMock).not.toHaveBeenCalled();
  });
});

