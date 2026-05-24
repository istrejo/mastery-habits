import { formatTime } from '../utils/formatTime';

describe('formatTime', () => {
  it('formats 0 as 00:00', () => expect(formatTime(0)).toBe('00:00'));
  it('formats 59 as 00:59', () => expect(formatTime(59)).toBe('00:59'));
  it('formats 60 as 01:00', () => expect(formatTime(60)).toBe('01:00'));
  it('formats 1500 as 25:00', () => expect(formatTime(1500)).toBe('25:00'));
  it('formats 3599 as 59:59', () => expect(formatTime(3599)).toBe('59:59'));
  it('clamps negative to 00:00', () => expect(formatTime(-5)).toBe('00:00'));
  it('floors fractional seconds', () => expect(formatTime(61.9)).toBe('01:01'));
});
