import type { ThemeTokens } from '../types';

export const cyberpunkTheme: ThemeTokens = {
  bg: {
    base: '#0d0221',
    surface: '#1a0635',
    surfaceAlt: '#2d1b4e',
    elevated: '#22094a',
  },
  border: {
    subtle: '#2d1b4e',
    default: '#ff2a6d',
    strong: '#ff2a6d',
  },
  text: {
    primary: '#f4f4f5',
    secondary: '#05d9e8',
    tertiary: '#9b87c8',
    inverse: '#0d0221',
  },
  accent: {
    primary: '#05d9e8',
    onPrimary: '#0d0221',
    muted: 'rgba(5, 217, 232, 0.2)',
  },
  score: {
    excellent: '#05d9e8',
    good: '#d600ff',
    warning: '#ff9e00',
    critical: '#ff2a6d',
  },
  level: {
    seed: { fg: '#9b87c8', bg: '#1a0635', border: '#2d1b4e' },
    sprout: { fg: '#ff9e00', bg: 'rgba(255, 158, 0, 0.15)', border: '#ff9e00' },
    tree: { fg: '#d600ff', bg: 'rgba(214, 0, 255, 0.15)', border: '#d600ff' },
    forest: { fg: '#05d9e8', bg: 'rgba(5, 217, 232, 0.15)', border: '#05d9e8' },
    ancient: { fg: '#ff2a6d', bg: 'rgba(255, 42, 109, 0.15)', border: '#ff2a6d' },
  },
  status: {
    success: '#05d9e8',
    skip: '#ff9e00',
    danger: '#ff2a6d',
    info: '#d600ff',
  },
  radius: { sm: 2, md: 4, lg: 8, pill: 999 },
  borderWidth: { hairline: 1, default: 1, bold: 1 },
  typography: { numericFeatures: 'tnum' },
  meta: { id: 'cyberpunk', name: 'Cyberpunk', mode: 'dark', tier: 'premium' },
};
