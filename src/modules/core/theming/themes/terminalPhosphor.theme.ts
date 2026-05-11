import type { ThemeTokens } from '../types';

export const terminalPhosphorTheme: ThemeTokens = {
  bg: {
    base: '#001100',
    surface: '#002200',
    surfaceAlt: '#001a00',
    elevated: '#003300',
  },
  border: {
    subtle: '#00aa2a',
    default: '#00ff41',
    strong: '#00ff41',
  },
  text: {
    primary: '#00ff41',
    secondary: '#00cc33',
    tertiary: '#008822',
    inverse: '#001100',
  },
  accent: {
    primary: '#00ff41',
    onPrimary: '#001100',
    muted: 'rgba(0, 255, 65, 0.2)',
  },
  score: {
    excellent: '#00ff41',
    good: '#00cc33',
    warning: '#88aa00',
    critical: '#aa0000',
  },
  level: {
    seed: { fg: '#008822', bg: '#001a00', border: '#00aa2a' },
    sprout: { fg: '#00aa2a', bg: '#001a00', border: '#00cc33' },
    tree: { fg: '#00cc33', bg: '#001a00', border: '#00ff41' },
    forest: { fg: '#00ff41', bg: '#002200', border: '#00ff41' },
    ancient: { fg: '#001100', bg: '#00ff41', border: '#00ff41' },
  },
  status: {
    success: '#00ff41',
    skip: '#88aa00',
    danger: '#aa0000',
    info: '#00cc33',
  },
  radius: { sm: 0, md: 0, lg: 0, pill: 0 },
  borderWidth: { hairline: 1, default: 1, bold: 1 },
  typography: {
    displayFontFamily: 'Courier New',
    bodyFontFamily: 'Courier New',
    numericFeatures: 'tnum',
  },
  categoryColors: {
    green:   { fg: '#00ff41', bg: '#001a00', border: '#00ff41' },
    violet:  { fg: '#88ff66', bg: '#001a00', border: '#00cc33' },
    blue:    { fg: '#66ffaa', bg: '#001a00', border: '#00cc33' },
    yellow:  { fg: '#aaff00', bg: '#001a00', border: '#00cc33' },
    orange:  { fg: '#ccff00', bg: '#001a00', border: '#00cc33' },
    pink:    { fg: '#00ff88', bg: '#001a00', border: '#00cc33' },
    cyan:    { fg: '#00ffcc', bg: '#001a00', border: '#00cc33' },
    emerald: { fg: '#33ff77', bg: '#001a00', border: '#00cc33' },
    neutral: { fg: '#008822', bg: '#001a00', border: '#00aa2a' },
  },
  meta: { id: 'terminal-phosphor', name: 'Terminal Phosphor', mode: 'dark', tier: 'premium' },
};
