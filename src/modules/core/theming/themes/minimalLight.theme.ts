import type { ThemeTokens } from '../types';
import { SPACING, TYPE_SCALE } from '../tokens';

const SURFACE = '#FFFFFF';
const BACKGROUND = '#FAFAFA';
const SURFACE_ALT = '#F4F4F4';
const BORDER = '#E5E5E5';
const PRIMARY = '#111111';
const SECONDARY = '#666666';
const TERTIARY = '#A3A3A3';
const ERROR = '#BA1A1A';
const GRAY_LIGHT = '#D8D8D8';
const GRAY_MID = '#9A9A9A';
const GRAY_DARK = '#555555';
const GRAY_DARKER = '#2A2A2A';

const neutralCategory = {
  fg: PRIMARY,
  bg: 'rgba(17, 17, 17, 0.06)',
  border: BORDER,
};

export const minimalLightTheme: ThemeTokens = {
  bg: {
    base: BACKGROUND,
    surface: SURFACE,
    surfaceAlt: SURFACE_ALT,
    elevated: SURFACE,
  },
  border: {
    subtle: BORDER,
    default: BORDER,
    strong: PRIMARY,
  },
  text: {
    primary: PRIMARY,
    secondary: SECONDARY,
    tertiary: TERTIARY,
    inverse: SURFACE,
  },
  accent: {
    primary: PRIMARY,
    onPrimary: SURFACE,
    muted: 'rgba(17, 17, 17, 0.10)',
  },
  score: {
    excellent: PRIMARY,
    good: PRIMARY,
    warning: SECONDARY,
    critical: ERROR,
  },
  level: {
    seed: { fg: SECONDARY, bg: SURFACE_ALT, border: BORDER },
    sprout: { fg: PRIMARY, bg: SURFACE_ALT, border: BORDER },
    tree: { fg: PRIMARY, bg: SURFACE_ALT, border: BORDER },
    forest: { fg: PRIMARY, bg: SURFACE_ALT, border: PRIMARY },
    ancient: { fg: SURFACE, bg: PRIMARY, border: PRIMARY },
  },
  status: {
    success: PRIMARY,
    skip: SECONDARY,
    danger: ERROR,
    info: SECONDARY,
  },
  activity: {
    none: SURFACE_ALT,
    low: GRAY_LIGHT,
    medium: GRAY_MID,
    high: GRAY_DARK,
    veryHigh: PRIMARY,
  },
  radius: { sm: 4, md: 8, lg: 12, pill: 9999 },
  borderWidth: { hairline: 1, default: 1, bold: 2 },
  spacing: SPACING,
  typography: {
    displayFontFamily: 'Anton_400Regular',
    bodyFontFamily: 'Lexend_400Regular',
    numericFeatures: 'tnum',
    scale: {
      displayXl: TYPE_SCALE.displayXl,
      displaySm: TYPE_SCALE.displaySm,
      titleLg: TYPE_SCALE.titleLg,
      titleSm: TYPE_SCALE.titleSm,
      labelCaps: TYPE_SCALE.labelCaps,
      bodyMain: TYPE_SCALE.bodyMain,
      microBold: TYPE_SCALE.microBold,
    },
  },
  categoryColors: {
    green: neutralCategory,
    violet: neutralCategory,
    blue: neutralCategory,
    yellow: neutralCategory,
    orange: neutralCategory,
    pink: neutralCategory,
    cyan: neutralCategory,
    emerald: neutralCategory,
    neutral: neutralCategory,
  },
  meta: {
    id: 'minimal-light',
    name: 'Mastery Habits Light',
    mode: 'light',
    tier: 'free',
  },
};
