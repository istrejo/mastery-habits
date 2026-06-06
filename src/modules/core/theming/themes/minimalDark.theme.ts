import type { ThemeTokens } from '../types';
import { SPACING, TYPE_SCALE } from '../tokens';

const SURFACE = '#1C1C1C';
const BACKGROUND = '#111111';
const SURFACE_ALT = '#242424';
const BORDER = '#2A2A2A';
const PRIMARY = '#F0F0F0';
const SECONDARY = '#999999';
const TERTIARY = '#5C5C5C';
const ERROR = '#CF6679';

const neutralCategory = {
  fg: PRIMARY,
  bg: 'rgba(240, 240, 240, 0.08)',
  border: BORDER,
};

export const minimalDarkTheme: ThemeTokens = {
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
    inverse: BACKGROUND,
  },
  accent: {
    primary: PRIMARY,
    onPrimary: BACKGROUND,
    muted: 'rgba(240, 240, 240, 0.10)',
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
    ancient: { fg: BACKGROUND, bg: PRIMARY, border: PRIMARY },
  },
  status: {
    success: PRIMARY,
    skip: SECONDARY,
    danger: ERROR,
    info: SECONDARY,
  },
  activity: {
    none: SURFACE_ALT,
    low: '#383838',
    medium: '#555555',
    high: '#A0A0A0',
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
    id: 'minimal-dark',
    name: 'Mastery Habits Dark',
    mode: 'dark',
    tier: 'free',
  },
};
