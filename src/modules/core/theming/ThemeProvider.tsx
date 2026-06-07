import React, { createContext, use, useMemo } from 'react';
import { useThemeStore } from './theme.store';
import {
  DEFAULT_THEME_ID,
  getThemeById,
} from './theme.config';
import type { ThemeTokens } from './types';

const ThemeContext = createContext<ThemeTokens>(getThemeById(DEFAULT_THEME_ID));

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const themeId = useThemeStore((s) => s.themeId);
  const theme = useMemo(() => getThemeById(themeId), [themeId]);
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeTokens => use(ThemeContext);

export const useCurrentMode = (): 'light' | 'dark' => {
  const theme = use(ThemeContext);
  return theme.meta.mode;
};
