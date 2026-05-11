import React, { createContext, useContext, useMemo } from 'react';
import { useThemeStore } from './theme.store';
import { techNeonTheme } from './themes/techNeon.theme';
import { organicGrowthTheme } from './themes/organicGrowth.theme';
import { minimalLightTheme } from './themes/minimalLight.theme';
import { brutalistEditorialTheme } from './themes/brutalistEditorial.theme';
import { cyberpunkTheme } from './themes/cyberpunk.theme';
import { terminalPhosphorTheme } from './themes/terminalPhosphor.theme';
import type { ThemeId, ThemeTokens } from './types';

export const THEMES: Record<ThemeId, ThemeTokens> = {
  'tech-neon': techNeonTheme,
  'organic-growth': organicGrowthTheme,
  'minimal-light': minimalLightTheme,
  'brutalist-editorial': brutalistEditorialTheme,
  cyberpunk: cyberpunkTheme,
  'terminal-phosphor': terminalPhosphorTheme,
};

export const THEMES_BY_MODE: Record<'light' | 'dark', ThemeId[]> = {
  dark: (Object.entries(THEMES) as [ThemeId, ThemeTokens][])
    .filter(([, t]) => t.meta.mode === 'dark')
    .map(([id]) => id),
  light: (Object.entries(THEMES) as [ThemeId, ThemeTokens][])
    .filter(([, t]) => t.meta.mode === 'light')
    .map(([id]) => id),
};

export const ThemeContext = createContext<ThemeTokens>(minimalLightTheme);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // The theme registry stays in place for future theming, but v1 is intentionally
  // pinned to Stitch's Mastery Habits Light system. Persisted legacy dark themes
  // must not leak into the UI.
  useThemeStore((s) => s.themeId);
  const theme = useMemo(() => minimalLightTheme, []);
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeTokens => useContext(ThemeContext);

export const useCurrentMode = (): 'light' | 'dark' => {
  const theme = useContext(ThemeContext);
  return theme.meta.mode;
};
