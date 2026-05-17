import React, { createContext, useContext, useMemo } from 'react';
import { useThemeStore } from './theme.store';
import {
  DEFAULT_THEME_ID,
  getThemeById,
} from './theme.config';
import type { ThemeTokens } from './types';

export const ThemeContext = createContext<ThemeTokens>(getThemeById(DEFAULT_THEME_ID));

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const themeId = useThemeStore((s) => s.themeId);
  const theme = useMemo(() => getThemeById(themeId), [themeId]);
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeTokens => useContext(ThemeContext);

export const useCurrentMode = (): 'light' | 'dark' => {
  const theme = useContext(ThemeContext);
  return theme.meta.mode;
};
