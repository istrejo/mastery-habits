import { techNeonTheme } from './themes/techNeon.theme';
import { organicGrowthTheme } from './themes/organicGrowth.theme';
import { minimalLightTheme } from './themes/minimalLight.theme';
import { minimalDarkTheme } from './themes/minimalDark.theme';
import { brutalistEditorialTheme } from './themes/brutalistEditorial.theme';
import { cyberpunkTheme } from './themes/cyberpunk.theme';
import { terminalPhosphorTheme } from './themes/terminalPhosphor.theme';
import type { ThemeId, ThemeTokens } from './types';

export const THEMES: Record<ThemeId, ThemeTokens> = {
  'tech-neon': techNeonTheme,
  'organic-growth': organicGrowthTheme,
  'minimal-light': minimalLightTheme,
  'minimal-dark': minimalDarkTheme,
  'brutalist-editorial': brutalistEditorialTheme,
  cyberpunk: cyberpunkTheme,
  'terminal-phosphor': terminalPhosphorTheme,
};

export const ENABLED_THEME_IDS = ['minimal-light', 'minimal-dark'] as const;

export type EnabledThemeId = (typeof ENABLED_THEME_IDS)[number];

export const DEFAULT_THEME_ID: EnabledThemeId = 'minimal-light';

const isEnabledThemeId = (value: unknown): value is EnabledThemeId =>
  typeof value === 'string' &&
  (ENABLED_THEME_IDS as readonly string[]).includes(value);

export const resolveThemeId = (value: unknown): EnabledThemeId =>
  isEnabledThemeId(value) ? value : DEFAULT_THEME_ID;

export const getThemeById = (value: unknown): ThemeTokens =>
  THEMES[resolveThemeId(value)];

export const THEMES_BY_MODE: Record<'light' | 'dark', EnabledThemeId[]> = {
  dark: ENABLED_THEME_IDS.filter((id) => THEMES[id].meta.mode === 'dark'),
  light: ENABLED_THEME_IDS.filter((id) => THEMES[id].meta.mode === 'light'),
};
