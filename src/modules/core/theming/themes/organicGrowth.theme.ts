import type { ThemeTokens } from '../types';

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
    sprout: { fg: '#d4a373', bg: 'rgba(212, 163, 115, 0.15)', border: '#a07956' },
    tree: { fg: '#a3b18a', bg: 'rgba(163, 177, 138, 0.15)', border: '#6b7d56' },
    forest: { fg: '#87a96b', bg: 'rgba(135, 169, 107, 0.18)', border: '#5a7a42' },
    ancient: { fg: '#e9c46a', bg: 'rgba(233, 196, 106, 0.15)', border: '#b8954f' },
  },
  status: {
    success: '#87a96b',
    skip: '#d4a373',
    danger: '#bc6c25',
    info: '#a3b18a',
  },
  radius: { sm: 8, md: 14, lg: 18, pill: 999 },
  borderWidth: { hairline: 0.5, default: 1, bold: 1 },
  typography: { displayFontFamily: 'Georgia', numericFeatures: 'tnum' },
  meta: { id: 'organic-growth', name: 'Organic Growth', mode: 'dark', tier: 'premium' },
};
