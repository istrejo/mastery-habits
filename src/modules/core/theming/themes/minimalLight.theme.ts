import type { ThemeTokens } from '../types';

export const minimalLightTheme: ThemeTokens = {
  bg: {
    base: '#fafaf9',
    surface: '#ffffff',
    surfaceAlt: '#f5f5f4',
    elevated: '#ffffff',
  },
  border: {
    subtle: '#e7e5e4',
    default: '#e7e5e4',
    strong: '#d6d3d1',
  },
  text: {
    primary: '#1c1917',
    secondary: '#57534e',
    tertiary: '#a8a29e',
    inverse: '#ffffff',
  },
  accent: {
    primary: '#1c1917',
    onPrimary: '#ffffff',
    muted: '#f5f5f4',
  },
  score: {
    excellent: '#1c1917',
    good: '#57534e',
    warning: '#a8a29e',
    critical: '#dc2626',
  },
  level: {
    seed: { fg: '#78716c', bg: '#f5f5f4', border: '#e7e5e4' },
    sprout: { fg: '#57534e', bg: '#f5f5f4', border: '#d6d3d1' },
    tree: { fg: '#44403c', bg: '#f5f5f4', border: '#a8a29e' },
    forest: { fg: '#292524', bg: '#f5f5f4', border: '#78716c' },
    ancient: { fg: '#1c1917', bg: '#1c1917', border: '#1c1917' },
  },
  status: {
    success: '#1c1917',
    skip: '#a8a29e',
    danger: '#dc2626',
    info: '#57534e',
  },
  radius: { sm: 6, md: 10, lg: 14, pill: 999 },
  borderWidth: { hairline: 0.5, default: 1, bold: 1 },
  typography: { numericFeatures: 'tnum' },
  meta: { id: 'minimal-light', name: 'Minimal Light', mode: 'light', tier: 'free' },
};
