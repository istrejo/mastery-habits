import { nextPhase } from '../utils/nextPhase';
import { DEFAULT_CONFIG } from '../utils/DEFAULT_CONFIG';

const cfg = DEFAULT_CONFIG;

describe('nextPhase', () => {
  describe('from work phase', () => {
    it('goes to short_break after cycles 1-3', () => {
      const result = nextPhase('work', 1, cfg);
      expect(result.phase).toBe('short_break');
      expect(result.plannedDurationSeconds).toBe(cfg.shortBreakSeconds);
    });

    it('goes to long_break after completing a full round (cycleIndex = cyclesPerRound)', () => {
      const result = nextPhase('work', cfg.cyclesPerRound, cfg);
      expect(result.phase).toBe('long_break');
      expect(result.plannedDurationSeconds).toBe(cfg.longBreakSeconds);
    });
  });

  describe('from short_break phase', () => {
    it('goes to work and increments cycleIndex', () => {
      const result = nextPhase('short_break', 2, cfg);
      expect(result.phase).toBe('work');
      expect(result.cycleIndex).toBe(3);
      expect(result.plannedDurationSeconds).toBe(cfg.workSeconds);
    });
  });

  describe('from long_break phase', () => {
    it('resets cycleIndex to 1 and returns to work', () => {
      const result = nextPhase('long_break', 4, cfg);
      expect(result.phase).toBe('work');
      expect(result.cycleIndex).toBe(1);
      expect(result.plannedDurationSeconds).toBe(cfg.workSeconds);
    });
  });
});
