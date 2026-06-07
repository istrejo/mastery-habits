import type { PowerGridDayCell } from './buildPowerGridMonth';

interface CellPalette {
  backgroundColor: string;
  borderColor: string;
  borderStyle: 'solid' | 'dashed';
  textColor: string;
  dayOpacity: number;
  opacity: number;
}

export function getPowerGridCellPalette(
  cell: PowerGridDayCell,
  theme: {
    accent: { primary: string; onPrimary: string };
    bg: { surface: string; surfaceAlt: string };
    border: { default: string };
    text: { secondary: string; tertiary: string };
  },
): CellPalette {
  const previousMonthOpacity = cell.isOutsideReferenceMonth ? 0.48 : 1;

  switch (cell.state) {
    case 'active':
      return {
        backgroundColor: theme.accent.primary,
        borderColor: theme.accent.primary,
        borderStyle: 'solid',
        textColor: theme.accent.onPrimary,
        dayOpacity: 0.72,
        opacity: previousMonthOpacity,
      };
    case 'missed':
      return {
        backgroundColor: theme.bg.surfaceAlt,
        borderColor: theme.border.default,
        borderStyle: 'solid',
        textColor: theme.text.secondary,
        dayOpacity: 0.6,
        opacity: 0.85 * previousMonthOpacity,
      };
    case 'today':
      return {
        backgroundColor: theme.bg.surface,
        borderColor: theme.accent.primary,
        borderStyle: 'solid',
        textColor: theme.accent.primary,
        dayOpacity: 1,
        opacity: previousMonthOpacity,
      };
    case 'future':
      return {
        backgroundColor: 'transparent',
        borderColor: theme.border.default,
        borderStyle: 'dashed',
        textColor: theme.text.tertiary,
        dayOpacity: 0.55,
        opacity: 0.6 * previousMonthOpacity,
      };
    case 'not_planned':
    default:
      return {
        backgroundColor: theme.bg.surface,
        borderColor: theme.border.default,
        borderStyle: 'solid',
        textColor: theme.text.tertiary,
        dayOpacity: 0.55,
        opacity: 0.8 * previousMonthOpacity,
      };
  }
}
