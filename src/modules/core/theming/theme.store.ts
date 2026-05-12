import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeId } from './types';

interface ThemeState {
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
}

export const FORCED_THEME_ID: ThemeId = 'minimal-light';

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeId: FORCED_THEME_ID,
      setTheme: () => set({ themeId: FORCED_THEME_ID }),
    }),
    {
      name: 'mastery-habits-theme',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: () => ({ themeId: FORCED_THEME_ID }),
    }
  )
);
