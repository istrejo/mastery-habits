import type { TypeScaleEntry } from './types';

export const SPACING = {
  unit: 4,
  gutter: 16,
  marginMobile: 20,
  stackSm: 8,
  stackMd: 24,
  stackLg: 48,
} as const;

// letterSpacing values converted from em to px (React Native uses px)
// lineHeight values are absolute px (fontSize * ratio)
export const TYPE_SCALE = {
  displayXl: { fontSize: 72, fontWeight: '900', lineHeight: 72,  letterSpacing: -2.88 },
  displaySm: { fontSize: 56, fontWeight: '900', lineHeight: 56,  letterSpacing: -2.24 },
  titleLg:   { fontSize: 28, fontWeight: '700', lineHeight: 34,  letterSpacing: -0.56 },
  titleSm:   { fontSize: 22, fontWeight: '700', lineHeight: 26,  letterSpacing: -0.44 },
  labelCaps: { fontSize: 12, fontWeight: '600', lineHeight: 12,  letterSpacing: 0.96  },
  bodyMain:  { fontSize: 16, fontWeight: '400', lineHeight: 24,  letterSpacing: 0     },
  microBold: { fontSize: 11, fontWeight: '500', lineHeight: 16,  letterSpacing: 0.11  },
} satisfies Record<string, TypeScaleEntry>;
