import type { Database } from '@shared/types/database.types';
import type { TimerConfig } from '../utils/DEFAULT_CONFIG';

export type PomodoroPhase = Database['public']['Enums']['pomodoro_phase'];
export type PomodoroOutcome = Database['public']['Enums']['pomodoro_outcome'];
export type PomodoroSession = Database['public']['Tables']['pomodoro_sessions']['Row'];
export type PomodoroSessionInsert = Database['public']['Tables']['pomodoro_sessions']['Insert'];

export type TimerStatus = 'idle' | 'running' | 'paused' | 'finished';

export interface RunningTimer {
  status: TimerStatus;
  phase: PomodoroPhase;
  cycleIndex: number;
  remainingSeconds: number;
}

export type { TimerConfig };
