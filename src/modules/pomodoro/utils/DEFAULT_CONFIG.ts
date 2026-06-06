export const DEFAULT_CONFIG = {
  workSeconds: 25 * 60,       // 1500
  shortBreakSeconds: 5 * 60,  // 300
  longBreakSeconds: 15 * 60,  // 900
  cyclesPerRound: 4,
} as const;

export type TimerConfig = {
  workSeconds: number;
  shortBreakSeconds: number;
  longBreakSeconds: number;
  cyclesPerRound: number;
};
