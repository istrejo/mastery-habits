export type CategoryColorToken =
  | 'green'
  | 'violet'
  | 'blue'
  | 'yellow'
  | 'orange'
  | 'pink'
  | 'cyan'
  | 'emerald'
  | 'neutral';

export type ThemeId =
  | 'tech-neon'
  | 'organic-growth'
  | 'minimal-light'
  | 'brutalist-editorial'
  | 'cyberpunk'
  | 'terminal-phosphor';

export type MasteryLevel = 'seed' | 'sprout' | 'tree' | 'forest' | 'ancient';

export interface CategoryColorPair {
  fg: string;
  bg: string;
  border: string;
}

export interface TypeScaleEntry {
  fontSize: number;
  fontWeight: string;
  lineHeight: number;
  letterSpacing: number;
}

export interface ThemeTokens {
  bg: {
    base: string;
    surface: string;
    surfaceAlt: string;
    elevated: string;
  };
  border: {
    subtle: string;
    default: string;
    strong: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  accent: {
    primary: string;
    onPrimary: string;
    muted: string;
  };
  score: {
    excellent: string;
    good: string;
    warning: string;
    critical: string;
  };
  level: Record<
    MasteryLevel,
    {
      fg: string;
      bg: string;
      border: string;
    }
  >;
  status: {
    success: string;
    skip: string;
    danger: string;
    info: string;
  };
  activity: {
    none: string;
    low: string;
    medium: string;
    high: string;
    veryHigh: string;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    pill: number;
  };
  borderWidth: {
    hairline: number;
    default: number;
    bold: number;
  };
  spacing: {
    unit: number;
    gutter: number;
    marginMobile: number;
    stackSm: number;
    stackMd: number;
    stackLg: number;
  };
  typography: {
    displayFontFamily?: string;
    bodyFontFamily?: string;
    numericFeatures: string;
    scale: {
      displayXl: TypeScaleEntry;
      displaySm: TypeScaleEntry;
      titleLg: TypeScaleEntry;
      titleSm: TypeScaleEntry;
      labelCaps: TypeScaleEntry;
      bodyMain: TypeScaleEntry;
      microBold: TypeScaleEntry;
    };
  };
  categoryColors: Record<CategoryColorToken, CategoryColorPair>;
  meta: {
    id: ThemeId;
    name: string;
    mode: 'light' | 'dark';
    tier: 'free' | 'premium';
  };
}
