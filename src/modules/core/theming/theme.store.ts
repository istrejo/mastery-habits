import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeId } from './types';

interface ThemeState {
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeId: 'tech-neon',
      setTheme: (id) => set({ themeId: id }),
    }),
    {
      name: 'mastery-habits-theme',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
