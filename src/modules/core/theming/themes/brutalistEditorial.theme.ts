import type { ThemeTokens } from '../types';
import { SPACING, TYPE_SCALE } from '../tokens';

export const brutalistEditorialTheme: ThemeTokens = {
  bg: {
    base: '#f4f0e8',
    surface: '#f4f0e8',
    surfaceAlt: '#ebe6da',
    elevated: '#ffffff',
  },
  border: {
    subtle: '#000000',
    default: '#000000',
    strong: '#000000',
  },
  text: {
    primary: '#000000',
    secondary: '#1c1917',
    tertiary: '#44403c',
    inverse: '#f4f0e8',
  },
  accent: {
    primary: '#ff5722',
    onPrimary: '#ffffff',
    muted: '#ffd0c2',
  },
  score: {
    excellent: '#ff5722',
    good: '#fbbf24',
    warning: '#fb923c',
    critical: '#dc2626',
  },
  level: {
    seed:    { fg: '#000', bg: '#ebe6da', border: '#000' },
    sprout:  { fg: '#000', bg: '#fbbf24', border: '#000' },
    tree:    { fg: '#000', bg: '#fb923c', border: '#000' },
    forest:  { fg: '#fff', bg: '#ff5722', border: '#000' },
    ancient: { fg: '#fff', bg: '#000',    border: '#000' },
  },
  status: {
    success: '#ff5722',
    skip: '#fbbf24',
    danger: '#dc2626',
    info: '#0066cc',
  },
  radius: { sm: 0, md: 0, lg: 0, pill: 0 },
  borderWidth: { hairline: 1.5, default: 1.5, bold: 2 },
  spacing: SPACING,
  typography: {
    displayFontFamily: 'Georgia',
    numericFeatures: 'tnum',
    scale: {
      displayXl: TYPE_SCALE.displayXl,
      displaySm: TYPE_SCALE.displaySm,
      titleLg:   TYPE_SCALE.titleLg,
      titleSm:   TYPE_SCALE.titleSm,
      labelCaps: TYPE_SCALE.labelCaps,
      bodyMain:  TYPE_SCALE.bodyMain,
      microBold: TYPE_SCALE.microBold,
    },
  },
  categoryColors: {
    green:   { fg: '#000', bg: '#86efac', border: '#000' },
    violet:  { fg: '#000', bg: '#d8b4fe', border: '#000' },
    blue:    { fg: '#000', bg: '#93c5fd', border: '#000' },
    yellow:  { fg: '#000', bg: '#fde047', border: '#000' },
    orange:  { fg: '#000', bg: '#fb923c', border: '#000' },
    pink:    { fg: '#000', bg: '#f9a8d4', border: '#000' },
    cyan:    { fg: '#000', bg: '#67e8f9', border: '#000' },
    emerald: { fg: '#000', bg: '#6ee7b7', border: '#000' },
    neutral: { fg: '#000', bg: '#ebe6da', border: '#000' },
  },
  meta: { id: 'brutalist-editorial', name: 'Brutalist Editorial', mode: 'light', tier: 'premium' },
};
