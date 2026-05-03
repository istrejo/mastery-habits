import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LocaleId } from './types';

interface LocaleState {
  locale: LocaleId | null;
  setLocale: (id: LocaleId) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: null,
      setLocale: (id) => set({ locale: id }),
    }),
    {
      name: 'mastery-habits-locale',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
