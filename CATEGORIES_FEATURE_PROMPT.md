# Master Prompt — Feature: Habit Categories (Mastery Habits)

> **Instrucciones para Claude Code:** Lee este documento completo antes de empezar. Trabaja **en la carpeta actual** del proyecto Mastery Habits. Esta es una **feature post-MVP**, no un proyecto nuevo: respeta toda la arquitectura, convenciones y theming system ya establecidos. Ejecuta las fases en orden estricto. Al finalizar cada fase, commitea con Conventional Commits y **detente para validación humana**.

---

## 0. Contexto

El MVP actualmente permite crear hábitos sin clasificación. Esta feature introduce **categorías predefinidas** que enriquecen la UX y abren la puerta a análisis futuros (ej: "Score promedio por categoría", "Distribución del tiempo por área de vida").

**Principio rector:** las categorías son una capa **visual + semántica**, no una restricción. El usuario sigue creando hábitos libremente, pero ahora cada uno vive en una de 8 áreas de vida + un slot personalizable.

---

## 1. Diseño funcional

### 1.1. Catálogo de categorías

| ID             | Label         | Emoji | colorToken | Descripción                          |
| -------------- | ------------- | ----- | ---------- | ------------------------------------ |
| `health`       | Salud         | 💪    | `green`    | Ejercicio, sueño, movimiento         |
| `mind`         | Mente         | 🧘    | `violet`   | Meditación, journaling, terapia      |
| `learning`     | Aprendizaje   | 📚    | `blue`     | Lectura, cursos, idiomas             |
| `productivity` | Productividad | ⚡    | `yellow`   | Deep work, planificación, foco       |
| `nutrition`    | Nutrición     | 🥗    | `orange`   | Hidratación, alimentación consciente |
| `creativity`   | Creatividad   | 🎨    | `pink`     | Escribir, crear, side projects       |
| `social`       | Social        | 👥    | `cyan`     | Familia, amigos, networking          |
| `finance`      | Finanzas      | 💰    | `emerald`  | Ahorro, gastos, inversión            |
| `custom`       | Personalizado | ✨    | `neutral`  | Usuario define label + emoji         |

### 1.2. Comportamiento

- **Obligatoria al crear hábito.** No hay hábitos sin categoría.
- **Editable.** El usuario puede cambiar la categoría de un hábito existente sin perder histórico ni score.
- **Custom flexible.** Si elige `custom`, debe ingresar `customLabel` (texto libre, máx 30 chars) y `customEmoji` (1 emoji).
- **Migración de datos existentes.** Los hábitos creados antes de esta feature reciben categoría `custom` con label `Sin categorizar` y emoji `📌` por defecto, y el usuario es invitado a recategorizar al abrir su detalle.

---

## 2. Arquitectura — dónde vive cada cosa

Respeta la Screaming Architecture establecida. La feature toca **3 módulos existentes** y crea **0 módulos nuevos**:

```
src/modules/
├── core/
│   └── theming/
│       ├── types.ts                    # MODIFICAR — añadir CategoryColorToken y categoryColors
│       └── themes/
│           └── *.theme.ts              # MODIFICAR los 6 — añadir categoryColors
├── habits/
│   ├── constants/
│   │   └── categories.ts               # NUEVO — catálogo HABIT_CATEGORIES
│   ├── components/
│   │   ├── CategoryPicker.tsx          # NUEVO — grid 3×3 con preview
│   │   ├── CategoryBadge.tsx           # NUEVO — pill compacta
│   │   ├── CustomCategoryInput.tsx     # NUEVO — label + emoji picker
│   │   ├── HabitCard.tsx               # MODIFICAR — mostrar CategoryBadge
│   │   └── HabitForm.tsx               # MODIFICAR — incluir CategoryPicker
│   ├── types/
│   │   └── habit.types.ts              # MODIFICAR — extender Habit con category
│   ├── services/
│   │   └── habits.service.ts           # MODIFICAR — incluir category en CRUD
│   └── utils/
│       └── resolveCategory.ts          # NUEVO — resuelve display de category (custom o predefinida)
└── shared/
    └── types/
        └── database.types.ts           # REGENERAR con supabase gen types
```

---

## 3. Modelo de datos — migración SQL

Genera una nueva migración `supabase/migrations/0004_habit_categories.sql`:

```sql
-- 0004_habit_categories.sql

-- 1. Crear enum de categorías
create type public.habit_category as enum (
  'health', 'mind', 'learning', 'productivity',
  'nutrition', 'creativity', 'social', 'finance', 'custom'
);

-- 2. Migrar columna existente: text → enum
-- Primero: limpiar datos previos (todos pasan a 'custom' con label por defecto)
alter table public.habits
  add column category_new public.habit_category,
  add column custom_label text,
  add column custom_emoji text;

update public.habits
  set category_new = 'custom',
      custom_label = 'Sin categorizar',
      custom_emoji = '📌'
  where category_new is null;

alter table public.habits
  alter column category_new set not null;

-- Eliminar columna antigua y renombrar
alter table public.habits drop column category;
alter table public.habits rename column category_new to category;

-- 3. Constraints de integridad
alter table public.habits add constraint custom_label_required
  check (
    (category = 'custom' and custom_label is not null and char_length(custom_label) between 1 and 30)
    or (category != 'custom' and custom_label is null)
  );

alter table public.habits add constraint custom_emoji_required
  check (
    (category = 'custom' and custom_emoji is not null and char_length(custom_emoji) between 1 and 8)
    or (category != 'custom' and custom_emoji is null)
  );

-- 4. Índice para queries de agrupación por categoría
create index idx_habits_user_category on public.habits(user_id, category)
  where archived_at is null;
```

**Tras aplicar la migración:**

```bash
npx supabase db reset       # solo en local
npx supabase gen types typescript --local > src/shared/types/database.types.ts
```

---

## 4. Constants del dominio

`src/modules/habits/constants/categories.ts`:

```ts
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
```

`src/modules/habits/utils/resolveCategory.ts`:

```ts
import type { Habit } from '../types/habit.types';
import {
  getCategoryDef,
  type CategoryColorToken,
} from '../constants/categories';

export interface ResolvedCategory {
  label: string;
  emoji: string;
  colorToken: CategoryColorToken;
}

/**
 * Resuelve el display de la categoría de un hábito.
 * Si es 'custom', usa los campos del usuario; si es predefinida, usa el catálogo.
 */
export const resolveCategory = (habit: Habit): ResolvedCategory => {
  const def = getCategoryDef(habit.category);
  if (habit.category === 'custom') {
    return {
      label: habit.customLabel ?? def.label,
      emoji: habit.customEmoji ?? def.emoji,
      colorToken: def.colorToken,
    };
  }
  return { label: def.label, emoji: def.emoji, colorToken: def.colorToken };
};
```

---

## 5. Extensión del Theming System

### 5.1. Tipos

En `src/modules/core/theming/types.ts`, extender `ThemeTokens`:

```ts
import type { CategoryColorToken } from '@habits/constants/categories';

export interface CategoryColorPair {
  fg: string; // Texto/icono sobre el fondo
  bg: string; // Fondo del badge/pill
  border: string;
}

export interface ThemeTokens {
  // ... tokens existentes ...
  categoryColors: Record<CategoryColorToken, CategoryColorPair>;
}
```

### 5.2. Valores por tema

Cada `*.theme.ts` añade su bloque `categoryColors`. Los valores deben respetar la luminosidad del tema (oscuros para temas oscuros, claros para claros). **Importante:** los colores deben ser distinguibles entre sí incluso en temas monocromáticos como `terminal-phosphor` (allí se usa una rampa de fósforo + el emoji aporta el color simbólico).

#### `techNeon.theme.ts`

```ts
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
```

#### `organicGrowth.theme.ts`

```ts
categoryColors: {
  green:   { fg: '#87a96b', bg: 'rgba(135, 169, 107, 0.18)', border: '#5a7a42' },
  violet:  { fg: '#b08bbb', bg: 'rgba(176, 139, 187, 0.18)', border: '#6b5078' },
  blue:    { fg: '#8aa6b8', bg: 'rgba(138, 166, 184, 0.18)', border: '#4a6a7d' },
  yellow:  { fg: '#e9c46a', bg: 'rgba(233, 196, 106, 0.18)', border: '#b8954f' },
  orange:  { fg: '#d4a373', bg: 'rgba(212, 163, 115, 0.18)', border: '#a07956' },
  pink:    { fg: '#d4a5a5', bg: 'rgba(212, 165, 165, 0.18)', border: '#a07474' },
  cyan:    { fg: '#a3b8b8', bg: 'rgba(163, 184, 184, 0.18)', border: '#6a8585' },
  emerald: { fg: '#a3b18a', bg: 'rgba(163, 177, 138, 0.18)', border: '#6b7d56' },
  neutral: { fg: '#c5d0bd', bg: '#2a3528',                   border: '#3d4a3a' },
},
```

#### `minimalLight.theme.ts`

```ts
categoryColors: {
  green:   { fg: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
  violet:  { fg: '#6b21a8', bg: '#faf5ff', border: '#e9d5ff' },
  blue:    { fg: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
  yellow:  { fg: '#a16207', bg: '#fefce8', border: '#fef08a' },
  orange:  { fg: '#c2410c', bg: '#fff7ed', border: '#fed7aa' },
  pink:    { fg: '#be185d', bg: '#fdf2f8', border: '#fbcfe8' },
  cyan:    { fg: '#0e7490', bg: '#ecfeff', border: '#a5f3fc' },
  emerald: { fg: '#047857', bg: '#ecfdf5', border: '#a7f3d0' },
  neutral: { fg: '#57534e', bg: '#f5f5f4', border: '#e7e5e4' },
},
```

#### `brutalistEditorial.theme.ts`

```ts
categoryColors: {
  green:   { fg: '#000', bg: '#86efac', border: '#000' },
  violet:  { fg: '#000', bg: '#d8b4fe', border: '#000' },
  blue:    { fg: '#000', bg: '#93c5fd', border: '#000' },
  yellow:  { fg: '#000', bg: '#fde047', border: '#000' },
  orange:  { fg: '#000', bg: '#fb923c', border: '#000' },
  pink:    { fg: '#000', bg: '#f9a8d4', border: '#000' },
  cyan:    { fg: '#000', bg: '#67e8f9', border: '#000' },
  emerald: { fg: '#000', bg: '#6ee7b7', border: '#000' },
  neutral: { fg: '#000', bg: '#ebe6da', border: '#000' },
},
```

#### `cyberpunk.theme.ts`

```ts
categoryColors: {
  green:   { fg: '#00ff9f', bg: 'rgba(0, 255, 159, 0.12)',   border: '#00ff9f' },
  violet:  { fg: '#d600ff', bg: 'rgba(214, 0, 255, 0.12)',   border: '#d600ff' },
  blue:    { fg: '#00b8ff', bg: 'rgba(0, 184, 255, 0.12)',   border: '#00b8ff' },
  yellow:  { fg: '#ffd60a', bg: 'rgba(255, 214, 10, 0.12)',  border: '#ffd60a' },
  orange:  { fg: '#ff9e00', bg: 'rgba(255, 158, 0, 0.12)',   border: '#ff9e00' },
  pink:    { fg: '#ff2a6d', bg: 'rgba(255, 42, 109, 0.12)',  border: '#ff2a6d' },
  cyan:    { fg: '#05d9e8', bg: 'rgba(5, 217, 232, 0.12)',   border: '#05d9e8' },
  emerald: { fg: '#39ff14', bg: 'rgba(57, 255, 20, 0.12)',   border: '#39ff14' },
  neutral: { fg: '#9b87c8', bg: '#1a0635',                   border: '#2d1b4e' },
},
```

#### `terminalPhosphor.theme.ts`

```ts
// En este tema, el COLOR es uniforme (fósforo); el EMOJI aporta la diferenciación visual.
// Usamos rampa de luminosidad para subtletly diferenciar.
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
```

---

## 6. Componentes nuevos

### 6.1. `CategoryBadge.tsx`

Pill compacta con emoji + label. Consume tokens del tema activo. Tres tamaños: `sm` (lista), `md` (detalle), `lg` (formulario).

Props:

```ts
interface CategoryBadgeProps {
  habit: Pick<Habit, 'category' | 'customLabel' | 'customEmoji'>;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean; // default true
}
```

Internamente usa `resolveCategory(habit)` y `useTheme().categoryColors[colorToken]`.

### 6.2. `CategoryPicker.tsx`

Grid 3×3 (9 items) con cards seleccionables. Cada card muestra emoji grande + label + descripción. Estado seleccionado destacado con borde + check.

Props:

```ts
interface CategoryPickerProps {
  value: HabitCategoryId;
  onChange: (id: HabitCategoryId) => void;
  customLabel?: string;
  customEmoji?: string;
  onCustomChange?: (data: { label: string; emoji: string }) => void;
}
```

Cuando el usuario selecciona `custom`, despliega `CustomCategoryInput` justo debajo del grid (no en modal — el flujo es continuo).

### 6.3. `CustomCategoryInput.tsx`

Dos inputs apilados:

- Emoji picker simple: input que acepta 1 emoji + sugerencias rápidas (8 emojis frecuentes: ⭐ 🎯 🔥 💎 🚀 🌟 💡 ⚙️).
- Label: input de texto, máx 30 chars, contador visible.

Validación con `zod`:

```ts
const customCategorySchema = z.object({
  emoji: z.string().min(1).max(8),
  label: z.string().min(1).max(30),
});
```

---

## 7. Componentes a modificar

### 7.1. `HabitCard.tsx`

Añadir `<CategoryBadge habit={habit} size="sm" showLabel={false} />` a la izquierda del nombre del hábito. El icono cuadrado decorativo actual se reemplaza por el badge real de categoría.

### 7.2. `HabitForm.tsx`

Insertar `<CategoryPicker />` **antes** del `FrequencySelector`. Actualizar el schema de `react-hook-form`:

```ts
const habitFormSchema = z
  .object({
    name: z.string().min(1).max(80),
    description: z.string().optional(),
    category: z.enum([
      'health',
      'mind',
      'learning',
      'productivity',
      'nutrition',
      'creativity',
      'social',
      'finance',
      'custom',
    ]),
    customLabel: z.string().min(1).max(30).optional(),
    customEmoji: z.string().min(1).max(8).optional(),
    frequencyDays: z.array(z.number().int().min(1).max(7)).min(1),
  })
  .refine(
    (data) =>
      data.category !== 'custom' || (data.customLabel && data.customEmoji),
    { message: 'Custom requiere label y emoji', path: ['customLabel'] }
  );
```

### 7.3. `habits.service.ts`

Extender `createHabit` y `updateHabit` para incluir `category`, `customLabel`, `customEmoji` en el payload de Supabase. Tipos derivados de `Database['public']['Tables']['habits']['Insert']`.

### 7.4. `habit/[id].tsx` (pantalla detalle)

En el header, debajo del nombre del hábito, añadir `<CategoryBadge habit={habit} size="md" showLabel />`.

Si la categoría es `custom` con label `Sin categorizar` (datos migrados), mostrar un banner amarillo no intrusivo:

> 💡 Este hábito no tiene categoría asignada. Editarlo para clasificarlo.

---

## 8. Fases de ejecución

> Cada fase termina con commit + pausa para validación.

### Fase 1 — Migración SQL

1. Crea `supabase/migrations/0004_habit_categories.sql` con el contenido de la sección 3.
2. Ejecuta `npx supabase db reset`.
3. Regenera tipos: `npx supabase gen types typescript --local > src/shared/types/database.types.ts`.
4. Verifica que los tipos generados incluyen `habit_category` enum.
5. **Commit:** `db: add habit categories with custom slot`.

### Fase 2 — Constants + utils + types

1. Crea `src/modules/habits/constants/categories.ts`.
2. Crea `src/modules/habits/utils/resolveCategory.ts`.
3. Actualiza `src/modules/habits/types/habit.types.ts` para reflejar los nuevos campos.
4. **Commit:** `feat(habits): category catalog and resolver`.

### Fase 3 — Theming extension

1. En `src/modules/core/theming/types.ts`, añade `CategoryColorPair` y `categoryColors` a `ThemeTokens`.
2. Actualiza los **6 archivos** `*.theme.ts` añadiendo el bloque `categoryColors` correspondiente (sección 5.2).
3. Verifica que TypeScript no se queja: `npx tsc --noEmit`.
4. **Commit:** `feat(core): extend theming with category colors`.

### Fase 4 — Componentes nuevos

1. Crea `CategoryBadge.tsx` (con tres tamaños).
2. Crea `CustomCategoryInput.tsx` con validación zod.
3. Crea `CategoryPicker.tsx` integrando `CustomCategoryInput`.
4. **Commit:** `feat(habits): category badge, picker and custom input`.

### Fase 5 — Integración en flujos existentes

1. Modifica `HabitForm.tsx` para incluir `CategoryPicker` y actualiza el schema zod.
2. Modifica `HabitCard.tsx` reemplazando el icono decorativo por `CategoryBadge`.
3. Modifica `habits.service.ts` para incluir los nuevos campos en CRUD.
4. Modifica `app/habit/[id].tsx` para mostrar `CategoryBadge md` y banner si `custom = Sin categorizar`.
5. **Validación manual:** crear un hábito de cada categoría predefinida + uno custom, verificar que se renderiza correctamente en los 6 temas.
6. **Commit:** `feat(habits): integrate categories into habit creation and detail flows`.

### Fase 6 — Cierre

1. Actualiza `README.md` documentando la feature.
2. **Commit:** `docs: document habit categories feature`.

---

## 9. Reglas de calidad

- **Cero hex hardcodeado** en componentes nuevos. Todo viene de `useTheme().categoryColors[colorToken]`.
- **Cero strings literales** de IDs de categoría en componentes — siempre desde `HABIT_CATEGORIES` o tipo `HabitCategoryId`.
- **Tests opcionales** pero recomendados para `resolveCategory.ts` (función pura, fácil de testear).
- **No romper retrocompatibilidad** del modelo: la migración debe poder ejecutarse sobre datos reales sin pérdida.
- **TypeScript estricto** se mantiene. Nada de `any` ni asserts no justificados.

---

## 10. Definition of Done

- [ ] `npx tsc --noEmit` pasa.
- [ ] `npx supabase db reset` se ejecuta sin errores.
- [ ] Los 6 temas renderizan los 9 colores de categoría sin colisionar visualmente.
- [ ] Crear un hábito requiere seleccionar categoría (no se puede saltar).
- [ ] Seleccionar `custom` exige label + emoji antes de guardar.
- [ ] Los hábitos pre-existentes aparecen con badge "Sin categorizar 📌" + banner de invitación a editar.
- [ ] Editar la categoría de un hábito existente NO modifica su score, racha ni histórico de check-ins.
- [ ] El check constraint SQL impide guardar `category != 'custom'` con `customLabel` o `customEmoji` no nulos (verificable con un INSERT manual).
- [ ] `grep -rE "#[0-9a-fA-F]{3,8}" src/modules/habits/components/Category*.tsx` devuelve 0 resultados.

---

**Empieza por la Fase 1 ahora. Confirma cada fase antes de pasar a la siguiente.**
