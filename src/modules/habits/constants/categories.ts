import type { CategoryColorToken } from '@core/theming';

export type HabitCategoryId =
  | 'health'
  | 'mind'
  | 'learning'
  | 'productivity'
  | 'nutrition'
  | 'creativity'
  | 'social'
  | 'finance'
  | 'custom';

export interface HabitCategoryDef {
  id: HabitCategoryId;
  label: string;
  emoji: string;
  colorToken: CategoryColorToken;
  description: string;
}

export const HABIT_CATEGORIES: readonly HabitCategoryDef[] = [
  {
    id: 'health',
    label: 'Salud',
    emoji: '💪',
    colorToken: 'green',
    description: 'Ejercicio, sueño, movimiento',
  },
  {
    id: 'mind',
    label: 'Mente',
    emoji: '🧘',
    colorToken: 'violet',
    description: 'Meditación, journaling, terapia',
  },
  {
    id: 'learning',
    label: 'Aprendizaje',
    emoji: '📚',
    colorToken: 'blue',
    description: 'Lectura, cursos, idiomas',
  },
  {
    id: 'productivity',
    label: 'Productividad',
    emoji: '⚡',
    colorToken: 'yellow',
    description: 'Deep work, planificación, foco',
  },
  {
    id: 'nutrition',
    label: 'Nutrición',
    emoji: '🥗',
    colorToken: 'orange',
    description: 'Hidratación, alimentación consciente',
  },
  {
    id: 'creativity',
    label: 'Creatividad',
    emoji: '🎨',
    colorToken: 'pink',
    description: 'Escribir, crear, side projects',
  },
  {
    id: 'social',
    label: 'Social',
    emoji: '👥',
    colorToken: 'cyan',
    description: 'Familia, amigos, networking',
  },
  {
    id: 'finance',
    label: 'Finanzas',
    emoji: '💰',
    colorToken: 'emerald',
    description: 'Ahorro, gastos, inversión',
  },
  {
    id: 'custom',
    label: 'Personalizado',
    emoji: '✨',
    colorToken: 'neutral',
    description: 'Define el tuyo',
  },
] as const;

export const getCategoryDef = (id: HabitCategoryId): HabitCategoryDef =>
  HABIT_CATEGORIES.find((c) => c.id === id)!;
