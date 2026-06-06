import { calculateScore, calculateMasteryLevel, pickPrevScore } from '../utils/calculateScore';

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

describe('pickPrevScore', () => {
  it('returns 0 for empty history', () => {
    expect(pickPrevScore([], '2026-06-06')).toBe(0);
  });

  it('returns 0 when no snapshot is strictly before the target date', () => {
    const history = [{ last_calculated_date: '2026-06-06', score: 80 }];
    expect(pickPrevScore(history, '2026-06-06')).toBe(0);
  });

  it('returns the score of the most recent snapshot before the target', () => {
    const history = [
      { last_calculated_date: '2026-06-01', score: 20 },
      { last_calculated_date: '2026-06-04', score: 60 },
      { last_calculated_date: '2026-06-05', score: 80 },
    ];
    expect(pickPrevScore(history, '2026-06-06')).toBe(80);
  });

  it('ignores null last_calculated_date', () => {
    const history = [
      { last_calculated_date: null, score: 999 },
      { last_calculated_date: '2026-06-04', score: 60 },
    ];
    expect(pickPrevScore(history, '2026-06-06')).toBe(60);
  });

  it('is order-independent (sorts internally)', () => {
    const history = [
      { last_calculated_date: '2026-06-05', score: 80 },
      { last_calculated_date: '2026-06-01', score: 20 },
      { last_calculated_date: '2026-06-04', score: 60 },
    ];
    expect(pickPrevScore(history, '2026-06-06')).toBe(80);
  });
});

describe('backfill parity with SQL register_check_in', () => {
  it('uses the score from the day before, not the latest persisted score', () => {
    const history = [
      { last_calculated_date: '2026-06-01', score: 20 },
      { last_calculated_date: '2026-06-04', score: 60 },
    ];
    const targetDate = '2026-06-05';
    const prev = pickPrevScore(history, targetDate);
    const { score } = calculateScore(prev, 'completed', true);
    expect(score).toBe(68);
  });

  it('parity: replaying a backfill day uses the prior day score', () => {
    const history: { last_calculated_date: string; score: number }[] = [];
    const dates = ['2026-06-01', '2026-06-02', '2026-06-03'];

    for (const date of dates) {
      const prev = pickPrevScore(history, date);
      const { score } = calculateScore(prev, 'completed', true);
      history.push({ last_calculated_date: date, score });
    }

    expect(history[0]?.score).toBe(20);
    expect(history[1]?.score).toBe(36);
    expect(history[2]?.score).toBe(48.8);
  });
});
