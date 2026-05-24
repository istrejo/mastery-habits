import { usePomodoroStore } from '../states/pomodoro.store';
import type { TimerConfig } from '../types';

export const usePomodoroSettings = () => {
  const config = usePomodoroStore((s) => s.config);
  const updateConfig = usePomodoroStore((s) => s.updateConfig);

  return { config, updateConfig };
};
