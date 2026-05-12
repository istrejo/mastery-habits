import type { ThemeTokens } from '../types';
import { SPACING, TYPE_SCALE } from '../tokens';

export const techNeonTheme: ThemeTokens = {
  bg: {
    base: '#131313',
    surface: '#161616',
    surfaceAlt: '#1c1b1b',
    elevated: '#2a2a2a',
  },
  border: {
    subtle: '#3b4b3d',
    default: '#262626',
    strong: '#849585',
  },
  text: {
    primary: '#e5e2e1',
    secondary: '#b9cbb9',
    tertiary: '#71717a',
    inverse: '#313030',
  },
  accent: {
    primary: '#00ff88',
    onPrimary: '#003919',
    muted: 'rgba(0, 255, 136, 0.12)',
  },
  score: {
    excellent: '#00ff88',
    good: '#60a5fa',
    warning: '#fbbf24',
    critical: '#ffb4ab',
  },
  level: {
    seed: { fg: '#b9cbb9', bg: '#1c1b1b', border: '#3b4b3d' },
    sprout: { fg: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: '#92400e' },
    tree: { fg: '#60a5fa', bg: 'rgba(96,165,250,0.12)', border: '#1e3a8a' },
    forest: { fg: '#00ff88', bg: 'rgba(0,255,136,0.12)', border: '#007139' },
    ancient: { fg: '#c084fc', bg: 'rgba(192,132,252,0.12)', border: '#6b21a8' },
  },
  status: {
    success: '#0ff',
    skip: '#f0f',
    danger: '#f00',
    info: '#00f',
  },
  activity: {
    none: '#0a0a0f',
    low: '#1a1a2e',
    medium: '#16213e',
    high: '#0f3460',
    veryHigh: '#0ff',
  },
  radius: { sm: 4, md: 8, lg: 12, pill: 9999 },
  borderWidth: { hairline: 0.5, default: 1, bold: 1 },
  spacing: SPACING,
  typography: {
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
    green: { fg: '#00ff88', bg: 'rgba(0, 255, 136, 0.12)', border: '#007139' },
    violet: {
      fg: '#c084fc',
      bg: 'rgba(192, 132, 252, 0.12)',
      border: '#6b21a8',
    },
    blue: { fg: '#60a5fa', bg: 'rgba(96, 165, 250, 0.12)', border: '#1e3a8a' },
    yellow: {
      fg: '#fbbf24',
      bg: 'rgba(251, 191, 36, 0.12)',
      border: '#92400e',
    },
    orange: {
      fg: '#fb923c',
      bg: 'rgba(251, 146, 60, 0.12)',
      border: '#9a3412',
    },
    pink: { fg: '#f472b6', bg: 'rgba(244, 114, 182, 0.12)', border: '#9f1239' },
    cyan: { fg: '#22d3ee', bg: 'rgba(34, 211, 238, 0.12)', border: '#155e75' },
    emerald: {
      fg: '#34d399',
      bg: 'rgba(52, 211, 153, 0.12)',
      border: '#065f46',
    },
    neutral: { fg: '#b9cbb9', bg: '#201f1f', border: '#3b4b3d' },
  },
  meta: { id: 'tech-neon', name: 'Tech Neon', mode: 'dark', tier: 'free' },
};
