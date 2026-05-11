import type { ThemeTokens } from '../types';
import { SPACING, TYPE_SCALE } from '../tokens';

export const minimalLightTheme: ThemeTokens = {
  bg: {
    base: '#fdf8f8',
    surface: '#fdf8f8',
    surfaceAlt: '#f7f3f2',
    elevated: '#ebe7e6',
  },
  border: {
    subtle: '#c4c7c7',
    default: '#c4c7c7',
    strong: '#747878',
  },
  text: {
    primary: '#1c1b1b',
    secondary: '#444748',
    tertiary: '#747878',
    inverse: '#ffffff',
  },
  accent: {
    primary: '#000000',
    onPrimary: '#ffffff',
    muted: '#e1dfdf',
  },
  score: {
    excellent: '#000000',
    good: '#444748',
    warning: '#a8a29e',
    critical: '#ba1a1a',
  },
  level: {
    seed:    { fg: '#747878', bg: '#f7f3f2', border: '#c4c7c7' },
    sprout:  { fg: '#57534e', bg: '#f7f3f2', border: '#d6d3d1' },
    tree:    { fg: '#44403c', bg: '#f7f3f2', border: '#a8a29e' },
    forest:  { fg: '#292524', bg: '#f7f3f2', border: '#747878' },
    ancient: { fg: '#ffffff', bg: '#1c1b1b', border: '#1c1b1b' },
  },
  status: {
    success: '#000000',
    skip: '#a8a29e',
    danger: '#ba1a1a',
    info: '#444748',
  },
  radius: { sm: 6, md: 8, lg: 12, pill: 999 },
  borderWidth: { hairline: 0.5, default: 1, bold: 1 },
  spacing: SPACING,
  typography: {
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
    green:   { fg: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
    violet:  { fg: '#6b21a8', bg: '#faf5ff', border: '#e9d5ff' },
    blue:    { fg: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
    yellow:  { fg: '#a16207', bg: '#fefce8', border: '#fef08a' },
    orange:  { fg: '#c2410c', bg: '#fff7ed', border: '#fed7aa' },
    pink:    { fg: '#be185d', bg: '#fdf2f8', border: '#fbcfe8' },
    cyan:    { fg: '#0e7490', bg: '#ecfeff', border: '#a5f3fc' },
    emerald: { fg: '#047857', bg: '#ecfdf5', border: '#a7f3d0' },
    neutral: { fg: '#444748', bg: '#f7f3f2', border: '#c4c7c7' },
  },
  meta: { id: 'minimal-light', name: 'Minimal Light', mode: 'light', tier: 'free' },
};
