# Plan: Stitch UI Migration — Fase Correctiva

## Context

Migración UI Stitch llegó hasta FASE 8 (Profile + Settings + ThemePicker). Las primeras 8 fases dejaron el 70% del app alineado al design system de Stitch, pero quedaron gaps en:

1. **2 pantallas sin migrar** (`habit/[id]`, `habit/new`) — usan `displayFontFamily`, `fontSize: 48`, headers viejos.
2. **Stats Dashboard con hero metric incorrecto** — mostramos avg score (que ya está en Today), Stitch pide CURRENT STREAK (días consecutivos).
3. **Componentes con fontSize hardcoded** — `CheckInButton`, `LevelProgress`, `MasteryBadge` no usan typography tokens.
4. **Power Grid mal ubicado** — es route push, debe ser 4to tab.
5. **Tab icons** — `checkmark-circle`/`bar-chart` no matchean Stitch (`bolt`/`leaderboard`/`grid_view`/`person`).
6. **HabitCard sin estado completed** — Stitch muestra overlay + checkmark + line-through cuando el hábito está marcado.
7. **ProgressBar flat** — Stitch usa pill.
8. **Power Grid cells** — usamos opacity-only, Stitch usa bg-color tiers + grayscale en emoji.
9. **Streak engine inexistente** — no hay lógica en commitment ni check-in para calcular días consecutivos.

**Decisiones acordadas:**
- Streak alineado a Stitch (implementar lógica)
- Power Grid como tab dedicado
- ProgressBar pill
- `@expo/vector-icons` con `MaterialIcons` para matchear Stitch material symbols exacto

---

# Reporte de Gaps (referencia)

## 1. Pantallas sin migrar

### `app/habit/[id].tsx` — Habit Detail
| Elemento | Estado actual | Debe ser |
|---|---|---|
| TopAppBar back button | `<Text onPress fontSize:15>` | `← BACK` accent Inter_600SemiBold |
| Score hero | `fontSize:48, fontFamily: theme.typography.displayFontFamily` | `displayXl (72px) Inter_900Black` |
| Section headers | `fontSize:11, letterSpacing:1` hardcoded | `labelCaps scale + Inter_600SemiBold uppercase` |
| Card padding | legacy `Card` component | `bg.surfaceAlt + border.subtle + marginMobile padding` |
| `CheckInGrid` cells | `width:20, height:20, radius:4` hardcoded | tokens `spacing.unit * X + border.subtle` |

### `app/habit/new.tsx` — New Habit
| Elemento | Estado actual | Debe ser |
|---|---|---|
| TopAppBar | `fontSize:15` back + `fontSize:20` title hardcoded | Standard TopAppBar pattern |
| Header section | sin separación visual | title-lg + stackMd gap |

## 2. Gaps en pantallas migradas

### Stats Dashboard
- ❌ Hero: avg score → debe ser CURRENT STREAK (displayXl + "DAYS" + "Best: X days")
- ✅ Top 3
- ⚠️ Activity grid (10×7 fijo vs 14 cols CSS — funcionalmente ok)

### Today Dashboard / HabitCard
- ❌ Estado "completed" inexistente (overlay + checkmark + line-through)
- ⚠️ Emoji del hábito: usa CategoryBadge — Stitch lo muestra inline en el title

### Power Grid
- ❌ Cell bg por tier (primary-container / primary-fixed-dim/X / surface-container-low)
- ❌ Emoji grayscale en celdas muertas
- ❌ Score% en celda (Stitch no lo muestra)
- ❌ Subtitle "Your habit energy — X active habits"
- ❌ Legend: gradient bar vs nuestros 4 dots
- ❌ Glow shadow en high cells

## 3. Componentes con tokens viejos

| Archivo | Líneas problema |
|---|---|
| `CheckInButton.tsx` | 45, 68, 89, 108, 123, 126 — fontSize hardcoded |
| `LevelProgress.tsx` | 29, 33, 55 — fontSize hardcoded |
| `MasteryBadge.tsx` | 34, 35 — fontSize hardcoded |
| `ProgressBar.tsx` | `borderRadius:0` hardcoded |

## 4. Tab bar
| Ícono | Stitch | Actual |
|---|---|---|
| Today | bolt | checkmark-circle |
| Power Grid | grid_view | (no tab) |
| Stats | leaderboard | bar-chart |
| Profile | person | person ✅ |

---

# Fases de Desarrollo

## FASE 9 — Streak Engine (Backend + Lógica)

**Objetivo:** Calcular días consecutivos sin fallar día planificado.

### Tareas
1. Crear `src/modules/commitment/utils/calculateStreak.ts`
   - Función `calculateStreak(checkIns: CheckIn[], habit: Habit): { current: number; best: number }`
   - Iterar `check_ins` ordenados desc por fecha
   - Current streak: contar días consecutivos planeados con `status='completed'` o `'skipped'`
   - Best streak: máximo histórico
   - Skip day no rompe streak (grace period)
   - Missed day rompe streak
2. Hook `src/modules/commitment/hooks/useGlobalStreak.ts`
   - Combina todos los hábitos del usuario
   - Retorna `{ current, best, loading }`
3. Tests en `src/modules/commitment/__tests__/calculateStreak.test.ts`
   - Cubrir: streak vacío, completed consecutive, skip preserva streak, missed rompe streak, best > current

### Archivos
- ✏️ NEW: `src/modules/commitment/utils/calculateStreak.ts`
- ✏️ NEW: `src/modules/commitment/hooks/useGlobalStreak.ts`
- ✏️ NEW: `src/modules/commitment/__tests__/calculateStreak.test.ts`
- ✏️ EDIT: `src/modules/commitment/index.ts` (export)

### Verificación
- `npm test -- --testPathPattern=calculateStreak`
- TS check sin errores

**⚠️ STOP — Aprobación antes de FASE 10**

---

## FASE 10 — Stats Dashboard: Streak Hero

**Objetivo:** Reemplazar avg score por current streak como hero metric.

### Tareas
1. `app/(tabs)/stats.tsx`:
   - Remover Score Card (queda en Today, donde corresponde)
   - Agregar Streak Card hero:
     - "CURRENT STREAK" labelCaps secondary
     - `current` en displayXl primary
     - "DAYS" en titleSm primary
     - "Best: X days" bodyMain secondary
   - Mantener Top 3 + Activity Grid
   - Remover Power Grid link (Power Grid pasa a ser tab dedicado en FASE 12)
2. Traducciones:
   - `stats.current_streak`, `stats.days`, `stats.best_streak`

### Archivos
- ✏️ EDIT: `app/(tabs)/stats.tsx`
- ✏️ EDIT: `src/modules/core/i18n/locales/en.ts`
- ✏️ EDIT: `src/modules/core/i18n/locales/es.ts`

### Verificación
- Abrir Stats tab → ver streak card en hero
- TS check

**⚠️ STOP**

---

## FASE 11 — HabitCard: Estado Completed

**Objetivo:** Visual state cuando hábito fue marcado hoy.

### Tareas
1. `src/modules/habits/components/HabitCard.tsx`:
   - Aceptar prop opcional `completed?: boolean`
   - Si `completed`:
     - `opacity: 0.5`
     - Overlay absolute con `bg: accent.primary + '1A'` (10% alpha)
     - Checkmark icon centrado (MaterialIcons `check` size 56 accent)
     - `textDecorationLine: 'line-through'` en habit name
2. `app/(tabs)/index.tsx`:
   - Pasar `completed={alreadyCheckedIn(habit, today)}` al HabitCard
   - Necesita hook util `isCheckedInToday(habit)` o similar — verificar si existe en check-in module

### Archivos
- ✏️ EDIT: `src/modules/habits/components/HabitCard.tsx`
- ✏️ EDIT: `app/(tabs)/index.tsx`
- 🔍 INVESTIGAR: utilidad existente en `src/modules/check-in/` para check status del día

### Verificación
- Marcar hábito como completado → ver overlay + checkmark
- Hábito sin marcar → estado normal

**⚠️ STOP**

---

## FASE 12 — Tab Bar Reestructura

**Objetivo:** 4 tabs alineados a Stitch + Power Grid como tab.

### Tareas
1. Mover `app/habit/grid.tsx` → `app/(tabs)/grid.tsx`
2. `app/(tabs)/_layout.tsx`:
   - Importar `MaterialIcons` de `@expo/vector-icons`
   - Cambiar tabs:
     - `index` → icon `bolt`
     - `grid` (nuevo) → icon `grid-view`
     - `stats` → icon `leaderboard`
     - `profile` → icon `person`
3. Traducciones: `tabs.power_grid`
4. Actualizar links en `app/(tabs)/stats.tsx` (si quedó alguno) y otros usos de `/habit/grid` → `/grid`

### Archivos
- 🚚 MOVE: `app/habit/grid.tsx` → `app/(tabs)/grid.tsx`
- ✏️ EDIT: `app/(tabs)/_layout.tsx`
- ✏️ EDIT: `src/modules/core/i18n/locales/{en,es}.ts`
- 🔍 GREP: usos de `/habit/grid` en el codebase

### Verificación
- 4 tabs visibles con MaterialIcons correctos
- Power Grid accesible desde tab bar
- TS check

**⚠️ STOP**

---

## FASE 13 — Power Grid Visual Polish

**Objetivo:** Cell bg-color por tier + emoji grayscale + glow + subtitle + gradient legend.

### Tareas
1. `app/(tabs)/grid.tsx`:
   - Función `cellStyle(score)` con tiers:
     - `≥71`: bg `accent.primary`, text `accent.onPrimary`, shadow (RN `shadowColor`/elevation)
     - `46-70`: bg `accent.primary + 'CC'` (80%)
     - `21-45`: bg `accent.primary + '66'` (40%), text primary
     - `<21`: bg `bg.surfaceAlt`, emoji `opacity: 0.3` + nombre `text.secondary`
   - Quitar score% del cell
   - Agregar subtitle bajo título: "Your habit energy — X active habits"
   - Legend: reemplazar 4 dots por View con linearGradient (usar `expo-linear-gradient` — verificar si está instalado)
2. Si `expo-linear-gradient` no está: instalar o usar fallback con 4 Views inline gradient simulado

### Archivos
- ✏️ EDIT: `app/(tabs)/grid.tsx`
- 🔍 CHECK: `package.json` para `expo-linear-gradient`
- ✏️ EDIT: i18n keys para subtitle

### Verificación
- Hábitos high score → glow neon
- Hábitos low → grayscale opacity
- Gradient bar en legend

**⚠️ STOP**

---

## FASE 14 — Habit Detail Screen Migration

**Objetivo:** Migrar `app/habit/[id].tsx` completo al design system.

### Tareas
1. TopAppBar pattern: `← BACK` accent + título del hábito en label-caps + (opcional) trash icon
2. Score hero: displayXl + Inter_900Black + scoreColor (igual que stats/today)
3. Section headers (Today, History, Frequency): labelCaps + Inter_600SemiBold uppercase + secondary
4. Cards: `bg.surfaceAlt + border.subtle + borderWidth.default + radius.lg + marginMobile padding`
5. CheckInGrid: cells `width/height: theme.spacing.gutter` (16px), `borderRadius: theme.radius.sm`
6. CategoryBadge ya migrado ✅
7. Migrar uso de `Card` legacy a inline View pattern (consistente con resto del app)

### Archivos
- ✏️ EDIT: `app/habit/[id].tsx`

### Verificación
- Abrir hábito → ver TopAppBar pattern + score hero displayXl
- Editar hábito → form funciona igual
- Check-in funciona
- Grid 30 días con colores correctos

**⚠️ STOP**

---

## FASE 15 — New Habit Screen Migration

**Objetivo:** Migrar `app/habit/new.tsx`.

### Tareas
1. TopAppBar: `← BACK` + "NEW HABIT" label-caps
2. Header section con title-lg + tagline
3. HabitForm (componente existente) — verificar typography internamente; si tiene gaps, migrar también

### Archivos
- ✏️ EDIT: `app/habit/new.tsx`
- 🔍 CHECK: `src/modules/habits/components/HabitForm.tsx` typography

### Verificación
- Crear hábito → flow funciona
- TS check

**⚠️ STOP**

---

## FASE 16 — Componentes con Tokens Viejos

**Objetivo:** Migrar `CheckInButton`, `LevelProgress`, `MasteryBadge`, `ProgressBar` a tokens.

### Tareas
1. `CheckInButton.tsx`:
   - fontSize 13 → `bodyMain`
   - fontSize 15 → `bodyMain` o titleSm
   - fontSize 16 → `bodyMain`
   - fontSize 18 → `titleSm`
   - Agregar `fontFamily: 'Inter_700Bold'` / `'Inter_600SemiBold'` según peso
2. `LevelProgress.tsx`:
   - fontSize 12 (líneas 29, 33) → `labelCaps`
   - fontSize 11 (línea 55) → `microBold`
   - height 8 → `theme.spacing.unit * 2` o mantener si es intencional
3. `MasteryBadge.tsx`:
   - fontSize 12 → `labelCaps`
   - fontSize 11 → `microBold`
4. `ProgressBar.tsx`:
   - `borderRadius: 0` → `theme.radius.pill`

### Archivos
- ✏️ EDIT: `src/modules/check-in/components/CheckInButton.tsx`
- ✏️ EDIT: `src/modules/progression/components/LevelProgress.tsx`
- ✏️ EDIT: `src/modules/progression/components/MasteryBadge.tsx`
- ✏️ EDIT: `src/modules/core/components/ProgressBar.tsx`

### Verificación
- TS check
- Todos los componentes se ven correctos en Today/Stats/Habit Detail

**⚠️ STOP**

---

## FASE FINAL — QA + PR

### Tareas
1. `npx tsc --noEmit` — limpio
2. `npm test` — todos pasan (esp. nuevo `calculateStreak.test.ts`)
3. Linter (si configurado)
4. QA manual en simulador iOS:
   - Login → Today → Marcar hábito → Ver overlay completed
   - Cambiar a Stats tab → Ver streak hero
   - Power Grid tab → Ver glow + grayscale
   - Profile → Settings → Theme picker
   - Habit Detail → Edit → Save
5. Crear PR `feat/stitch-ui-migration` → `dev` con cuerpo describiendo FASES 1-FINAL

---

## Archivos críticos (resumen)

### Nuevos
- `src/modules/commitment/utils/calculateStreak.ts`
- `src/modules/commitment/hooks/useGlobalStreak.ts`
- `src/modules/commitment/__tests__/calculateStreak.test.ts`
- `app/(tabs)/grid.tsx` (moved from `app/habit/grid.tsx`)

### Modificados
- `app/(tabs)/_layout.tsx`
- `app/(tabs)/index.tsx`
- `app/(tabs)/stats.tsx`
- `app/habit/[id].tsx`
- `app/habit/new.tsx`
- `src/modules/habits/components/HabitCard.tsx`
- `src/modules/check-in/components/CheckInButton.tsx`
- `src/modules/progression/components/LevelProgress.tsx`
- `src/modules/progression/components/MasteryBadge.tsx`
- `src/modules/core/components/ProgressBar.tsx`
- `src/modules/commitment/index.ts`
- `src/modules/core/i18n/locales/en.ts`
- `src/modules/core/i18n/locales/es.ts`

### Reutilizar (no crear nuevo)
- `useTheme()` from `@core/theming`
- `Screen`, `Card`, `Skeleton`, `Button` from `@core/components`
- `SPACING`, `TYPE_SCALE` constants from `@core/theming/tokens`
- `useCheckIn` hook from `@checkin/index` (para estado completed)
- `useHabits` from `@habits/index`
- `MaterialIcons` from `@expo/vector-icons`

---

## Verification End-to-End

```bash
# Type check
npx tsc --noEmit

# Tests
npm test
npm test -- --testPathPattern=calculateStreak

# Run app
npx expo start --ios
```

QA checklist:
- [ ] 4 tabs con MaterialIcons (bolt, grid-view, leaderboard, person)
- [ ] Today Dashboard: hábito marcado muestra overlay + checkmark + line-through
- [ ] Stats: streak card hero con displayXl + "DAYS" + "Best: X days"
- [ ] Power Grid: cells con bg-color tiers + grayscale en muertas + gradient legend
- [ ] Habit Detail: TopAppBar pattern + score displayXl + cards inline
- [ ] New Habit: TopAppBar pattern + form
- [ ] CheckInButton/LevelProgress/MasteryBadge sin fontSize hardcoded
- [ ] ProgressBar con borderRadius pill
- [ ] Tests: `calculateStreak` passing
