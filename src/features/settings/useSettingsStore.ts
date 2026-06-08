import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { mmkvStorage } from "../../core/storage/mmkvAdapter";
import { Constants } from "../../shared/types/database.types";

type ColorScheme = typeof Constants.public.Enums.theme_preference[number];
type Language = "en" | "es";

interface SettingsState {
  colorScheme: ColorScheme;
  language: Language;
  notificationsEnabled: boolean;
  setColorScheme: (colorScheme: ColorScheme) => void;
  setLanguage: (language: Language) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      colorScheme: "system",
      language: "en",
      notificationsEnabled: true,
      setColorScheme: (colorScheme) => set({ colorScheme }),
      setLanguage: (language) => set({ language }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      reset: () => set({ colorScheme: "system", language: "en", notificationsEnabled: true }),
    }),
    {
      name: "settings-store",
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
