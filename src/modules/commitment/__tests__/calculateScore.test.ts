import { calculateScore, calculateMasteryLevel } from '../utils/calculateScore';

describe('calculateScore', () => {
  describe('planned day — completed', () => {
    it('increases score from 0', () => {
      const { score } = calculateScore(0, 'completed', true);
      expect(score).toBe(20);
    });

    it('increases score from existing value', () => {
      const { score } = calculateScore(50, 'completed', true);
      // (50 * 0.8) + 20 = 60
      expect(score).toBe(60);
    });
  });

  describe('planned day — missed', () => {
    it('decreases score from existing value', () => {
      const { score } = calculateScore(50, 'missed', true);
      // (50 * 0.8) + 0 = 40
      expect(score).toBe(40);
    });

    it('stays at 0 when already 0', () => {
      const { score } = calculateScore(0, 'missed', true);
      expect(score).toBe(0);
    });
  });

  describe('planned day — skipped (grace period)', () => {
    it('counts as compliance 1', () => {
      const { score } = calculateScore(50, 'skipped', true);
      // same as completed
      expect(score).toBe(60);
    });
  });

  describe('non-planned day', () => {
    it('score unchanged regardless of status', () => {
      expect(calculateScore(50, 'completed', false).score).toBe(50);
      expect(calculateScore(50, 'missed', false).score).toBe(50);
      expect(calculateScore(50, 'skipped', false).score).toBe(50);
    });

    it('score unchanged when 0', () => {
      expect(calculateScore(0, 'missed', false).score).toBe(0);
    });
  });

  describe('decay after 7 consecutive missed planned days', () => {
    it('score approaches 0', () => {
      let score = 100;
      for (let i = 0; i < 7; i++) {
        score = calculateScore(score, 'missed', true).score;
      }
      // 100 * 0.8^7 ≈ 20.97
      expect(score).toBeLessThan(25);
    });
  });

  describe('score boundaries', () => {
    it('never exceeds 100', () => {
      const { score } = calculateScore(100, 'completed', true);
      // (100 * 0.8) + 20 = 100
      expect(score).toBeLessThanOrEqual(100);
    });

    it('never goes below 0', () => {
      const { score } = calculateScore(0, 'missed', true);
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('calculateMasteryLevel', () => {
  it('seed at 0', () => expect(calculateMasteryLevel(0)).toBe('seed'));
  it('seed at 20', () => expect(calculateMasteryLevel(20)).toBe('seed'));
  it('sprout at 21', () => expect(calculateMasteryLevel(21)).toBe('sprout'));
  it('sprout at 45', () => expect(calculateMasteryLevel(45)).toBe('sprout'));
  it('tree at 46', () => expect(calculateMasteryLevel(46)).toBe('tree'));
  it('tree at 70', () => expect(calculateMasteryLevel(70)).toBe('tree'));
  it('forest at 71', () => expect(calculateMasteryLevel(71)).toBe('forest'));
  it('forest at 90', () => expect(calculateMasteryLevel(90)).toBe('forest'));
  it('ancient at 91', () => expect(calculateMasteryLevel(91)).toBe('ancient'));
  it('ancient at 100', () => expect(calculateMasteryLevel(100)).toBe('ancient'));
});
