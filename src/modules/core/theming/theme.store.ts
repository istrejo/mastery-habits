import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeId } from './types';
import {
  resolveThemeId,
  type EnabledThemeId,
} from './theme.config';
import {
  createThemeSelectionState,
  mergeThemeSelectionState,
} from './theme.state';

interface ThemeState {
  themeId: EnabledThemeId;
  setTheme: (id: ThemeId) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      ...createThemeSelectionState(),
      setTheme: (id) => set({ themeId: resolveThemeId(id) }),
    }),
    {
      name: 'mastery-habits-theme',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ themeId: state.themeId }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...mergeThemeSelectionState(
          persistedState as Partial<Pick<ThemeState, 'themeId'>> | undefined
        ),
      }),
    }
  )
);
