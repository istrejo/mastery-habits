import { getLevel, getLevelProgress } from '../utils/getLevel';

describe('getLevel', () => {
  it('seed at 0',    () => expect(getLevel(0).key).toBe('seed'));
  it('seed at 20',   () => expect(getLevel(20).key).toBe('seed'));
  it('sprout at 21', () => expect(getLevel(21).key).toBe('sprout'));
  it('sprout at 45', () => expect(getLevel(45).key).toBe('sprout'));
  it('tree at 46',   () => expect(getLevel(46).key).toBe('tree'));
  it('tree at 70',   () => expect(getLevel(70).key).toBe('tree'));
  it('forest at 71', () => expect(getLevel(71).key).toBe('forest'));
  it('forest at 90', () => expect(getLevel(90).key).toBe('forest'));
  it('ancient at 91',  () => expect(getLevel(91).key).toBe('ancient'));
  it('ancient at 100', () => expect(getLevel(100).key).toBe('ancient'));

  it('clamps score below 0 to seed', () => expect(getLevel(-5).key).toBe('seed'));
  it('clamps score above 100 to ancient', () => expect(getLevel(110).key).toBe('ancient'));
});

describe('getLevelProgress', () => {
  it('0 progress at seed min', () => expect(getLevelProgress(0)).toBe(0));
  it('1 progress at seed max', () => expect(getLevelProgress(20)).toBe(1));
  it('0 progress at sprout min', () => expect(getLevelProgress(21)).toBeCloseTo(0, 1));
  it('1 progress at ancient max', () => expect(getLevelProgress(100)).toBe(1));
  it('never exceeds 1', () => expect(getLevelProgress(110)).toBeLessThanOrEqual(1));
  it('never below 0', () => expect(getLevelProgress(-10)).toBeGreaterThanOrEqual(0));
});
