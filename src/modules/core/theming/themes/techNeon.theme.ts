import type { ThemeTokens } from '../types';

export const techNeonTheme: ThemeTokens = {
  bg: {
    base: '#0a0a0a',
    surface: '#18181b',
    surfaceAlt: '#27272a',
    elevated: '#1f1f23',
  },
  border: {
    subtle: 'rgba(39, 39, 42, 0.6)',
    default: '#27272a',
    strong: '#3f3f46',
  },
  text: {
    primary: '#f4f4f5',
    secondary: '#a1a1aa',
    tertiary: '#71717a',
    inverse: '#0a0a0a',
  },
  accent: {
    primary: '#4ade80',
    onPrimary: '#0a0a0a',
    muted: '#052e16',
  },
  score: {
    excellent: '#4ade80',
    good: '#60a5fa',
    warning: '#fbbf24',
    critical: '#ef4444',
  },
  level: {
    seed: { fg: '#a3a3a3', bg: '#1f1f23', border: '#3f3f46' },
    sprout: { fg: '#fbbf24', bg: '#422006', border: '#92400e' },
    tree: { fg: '#60a5fa', bg: '#172554', border: '#1e3a8a' },
    forest: { fg: '#4ade80', bg: '#052e16', border: '#166534' },
    ancient: { fg: '#c084fc', bg: '#2e1065', border: '#6b21a8' },
  },
  status: {
    success: '#4ade80',
    skip: '#fbbf24',
    danger: '#ef4444',
    info: '#60a5fa',
  },
  radius: { sm: 6, md: 10, lg: 12, pill: 999 },
  borderWidth: { hairline: 0.5, default: 1, bold: 1 },
  typography: { numericFeatures: 'tnum' },
  categoryColors: {
    green:   { fg: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)',  border: '#166534' },
    violet:  { fg: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)', border: '#6b21a8' },
    blue:    { fg: '#60a5fa', bg: 'rgba(96, 165, 250, 0.15)',  border: '#1e3a8a' },
    yellow:  { fg: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)',  border: '#92400e' },
    orange:  { fg: '#fb923c', bg: 'rgba(251, 146, 60, 0.15)',  border: '#9a3412' },
    pink:    { fg: '#f472b6', bg: 'rgba(244, 114, 182, 0.15)', border: '#9f1239' },
    cyan:    { fg: '#22d3ee', bg: 'rgba(34, 211, 238, 0.15)',  border: '#155e75' },
    emerald: { fg: '#34d399', bg: 'rgba(52, 211, 153, 0.15)',  border: '#065f46' },
    neutral: { fg: '#a1a1aa', bg: '#27272a',                   border: '#3f3f46' },
  },
  meta: { id: 'tech-neon', name: 'Tech Neon', mode: 'dark', tier: 'free' },
};
