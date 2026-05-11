import type { TypeScaleEntry } from './types';

export const SPACING = {
  unit: 4,
  gutter: 20,
  marginMobile: 20,
  stackSm: 8,
  stackMd: 24,
  stackLg: 48,
} as const;

// Stitch Light uses Anton for display/headlines and Lexend for body/interface.
// letterSpacing values are converted from em to px because React Native uses px.
// lineHeight values are absolute px (fontSize * ratio).
export const TYPE_SCALE = {
  displayXl: { fontSize: 64, fontWeight: '400', lineHeight: 70, letterSpacing: 1.28 },
  displaySm: { fontSize: 40, fontWeight: '400', lineHeight: 48, letterSpacing: 0.8 },
  titleLg:   { fontSize: 32, fontWeight: '400', lineHeight: 38, letterSpacing: 0.64 },
  titleSm:   { fontSize: 24, fontWeight: '400', lineHeight: 29, letterSpacing: 0.24 },
  labelCaps: { fontSize: 14, fontWeight: '600', lineHeight: 17, letterSpacing: 0.7 },
  bodyMain:  { fontSize: 16, fontWeight: '400', lineHeight: 24, letterSpacing: 0 },
  microBold: { fontSize: 12, fontWeight: '500', lineHeight: 14, letterSpacing: 0.24 },
} satisfies Record<string, TypeScaleEntry>;
