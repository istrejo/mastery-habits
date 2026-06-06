import type { PomodoroPhase } from '../types';
import type { TimerConfig } from './DEFAULT_CONFIG';

interface PhaseTransition {
  phase: PomodoroPhase;
  cycleIndex: number;
  plannedDurationSeconds: number;
}

export const nextPhase = (
  currentPhase: PomodoroPhase,
  cycleIndex: number,
  config: TimerConfig,
): PhaseTransition => {
  if (currentPhase === 'work') {
    const worksDone = cycleIndex;
    if (worksDone % config.cyclesPerRound === 0) {
      return {
        phase: 'long_break',
        cycleIndex,
        plannedDurationSeconds: config.longBreakSeconds,
      };
    }
    return {
      phase: 'short_break',
      cycleIndex,
      plannedDurationSeconds: config.shortBreakSeconds,
    };
  }

  const newCycleIndex = currentPhase === 'long_break' ? 1 : cycleIndex + 1;
  return {
    phase: 'work',
    cycleIndex: newCycleIndex,
    plannedDurationSeconds: config.workSeconds,
  };
};
