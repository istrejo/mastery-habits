import { create } from 'zustand';

interface HabitScore {
  score: number;
  level: string;
}

interface ScoreState {
  scores: Record<string, HabitScore>;
  setScore: (habitId: string, score: number, level: string) => void;
  clearScores: () => void;
}

export const useScoreStore = create<ScoreState>((set) => ({
  scores: {},
  setScore: (habitId, score, level) =>
    set((state) => ({
      scores: { ...state.scores, [habitId]: { score, level } },
    })),
  clearScores: () => set({ scores: {} }),
}));
