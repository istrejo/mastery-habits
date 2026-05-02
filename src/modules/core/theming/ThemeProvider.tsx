import React, { createContext, useContext, useMemo } from 'react';
import { useThemeStore } from './theme.store';
import { techNeonTheme } from './themes/techNeon.theme';
import { organicGrowthTheme } from './themes/organicGrowth.theme';
import { minimalLightTheme } from './themes/minimalLight.theme';
import { brutalistEditorialTheme } from './themes/brutalistEditorial.theme';
import { cyberpunkTheme } from './themes/cyberpunk.theme';
import { terminalPhosphorTheme } from './themes/terminalPhosphor.theme';
import type { ThemeId, ThemeTokens } from './types';

const THEMES: Record<ThemeId, ThemeTokens> = {
  'tech-neon': techNeonTheme,
  'organic-growth': organicGrowthTheme,
  'minimal-light': minimalLightTheme,
  'brutalist-editorial': brutalistEditorialTheme,
  cyberpunk: cyberpunkTheme,
  'terminal-phosphor': terminalPhosphorTheme,
};

export const ThemeContext = createContext<ThemeTokens>(techNeonTheme);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const themeId = useThemeStore((s) => s.themeId);
  const theme = useMemo(() => THEMES[themeId], [themeId]);
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeTokens => useContext(ThemeContext);
