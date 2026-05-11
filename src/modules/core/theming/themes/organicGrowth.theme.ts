import type { ThemeTokens } from '../types';
import { SPACING, TYPE_SCALE } from '../tokens';

export const organicGrowthTheme: ThemeTokens = {
  bg: {
    base: '#1a2418',
    surface: '#243023',
    surfaceAlt: '#2a3528',
    elevated: '#2f3b2d',
  },
  border: {
    subtle: 'rgba(61, 74, 58, 0.5)',
    default: '#3d4a3a',
    strong: '#556b52',
  },
  text: {
    primary: '#e8e2d5',
    secondary: '#c5d0bd',
    tertiary: '#8a9583',
    inverse: '#1a2418',
  },
  accent: {
    primary: '#87a96b',
    onPrimary: '#1a2418',
    muted: 'rgba(135, 169, 107, 0.2)',
  },
  score: {
    excellent: '#87a96b',
    good: '#a3b18a',
    warning: '#d4a373',
    critical: '#bc6c25',
  },
  level: {
    seed: { fg: '#c5d0bd', bg: '#2a3528', border: '#3d4a3a' },
    sprout: { fg: '#d4a373', bg: 'rgba(212,163,115,0.15)', border: '#a07956' },
    tree: { fg: '#a3b18a', bg: 'rgba(163,177,138,0.15)', border: '#6b7d56' },
    forest: { fg: '#87a96b', bg: 'rgba(135,169,107,0.18)', border: '#5a7a42' },
    ancient: { fg: '#e9c46a', bg: 'rgba(233,196,106,0.15)', border: '#b8954f' },
  },
  status: {
    success: '#10b981',
    skip: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
  },
  activity: {
    none: '#f0fdf4',
    low: '#bbf7d0',
    medium: '#86efac',
    high: '#4ade80',
    veryHigh: '#10b981',
  },
  radius: { sm: 8, md: 12, lg: 16, pill: 9999 },
  borderWidth: { hairline: 0.5, default: 1, bold: 1 },
  spacing: SPACING,
  typography: {
    displayFontFamily: 'Georgia',
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
    green: { fg: '#87a96b', bg: 'rgba(135,169,107,0.18)', border: '#5a7a42' },
    violet: { fg: '#b08bbb', bg: 'rgba(176,139,187,0.18)', border: '#6b5078' },
    blue: { fg: '#8aa6b8', bg: 'rgba(138,166,184,0.18)', border: '#4a6a7d' },
    yellow: { fg: '#e9c46a', bg: 'rgba(233,196,106,0.18)', border: '#b8954f' },
    orange: { fg: '#d4a373', bg: 'rgba(212,163,115,0.18)', border: '#a07956' },
    pink: { fg: '#d4a5a5', bg: 'rgba(212,165,165,0.18)', border: '#a07474' },
    cyan: { fg: '#a3b8b8', bg: 'rgba(163,184,184,0.18)', border: '#6a8585' },
    emerald: { fg: '#a3b18a', bg: 'rgba(163,177,138,0.18)', border: '#6b7d56' },
    neutral: { fg: '#c5d0bd', bg: '#2a3528', border: '#3d4a3a' },
  },
  meta: {
    id: 'organic-growth',
    name: 'Organic Growth',
    mode: 'dark',
    tier: 'premium',
  },
};
