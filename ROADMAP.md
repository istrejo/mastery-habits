# Roadmap de Desarrollo — Mastery Habits

> Plan de evolución de la app: de checklist básico a herramienta profesional
> donde cada hábito es un *journey*. Organizado por fases ejecutables.

---

## Contexto

Hoy la app es funcional pero básica: marcás/desmarcás días, se calcula un
Commitment Score (0–100) y un Mastery Level (Seed → Ancient). El problema es
que es un checklist más — el usuario no registra *qué* hizo, no mide tiempo,
no siente el progreso de forma visceral.

**Objetivo:** que cada hábito sea un journey con progresión visible y
satisfacción. Audiencia: profesionales y personas comunes que quieren ordenar
su vida. Proyecto de portfolio con potencial de monetización futura.

**Decisiones de producto ya tomadas:**
- Ángulo: progresión visible + satisfacción (no gamificación social, no accountability).
- Session Log se registra en un **modal tras el check-in**.
- Milestones se celebran **solo hacia adelante** (los ya pasados se marcan vistos en silencio).
- Nada se remueve de la app actual.

---

## Visión general de fases

| Fase | Nombre | Resultado | Estado |
|------|--------|-----------|--------|
| 0 | Base de datos | 3 migraciones + tipos regenerados | Pendiente |
| 1 | Timer | Cronómetro funcional para hábitos de duración | Pendiente |
| 2 | Session Log | Registro de sub-tareas + notas por sesión | Pendiente |
| 3 | Integración detalle | Modal de log tras check-in | Pendiente |
| 4 | Score chart | Gráfico de evolución del score | Pendiente |
| 5 | Historial de sesiones | Lista de sesiones pasadas en el detalle | Pendiente |
| 6 | Milestones | Celebraciones de racha (7/21/30/60/100 días) | Pendiente |
| — | Tier 2 | Roadmap futuro (templates, review, reminders) | Roadmap |
| — | Tier 3 | Monetización (premium, IA, export) | Roadmap |

**Camino crítico:** Fase 0 → 2 → 3 → 5.
Fases 1 (Timer), 4 (Chart) y 6 (Milestones) son ramas paralelas: una vez hecha
la Fase 0, se pueden construir en cualquier orden.

---

## FASE 0 — Base de datos

**Por qué primero:** todo el código nuevo depende de los tipos TypeScript
generados desde el esquema. Sin esto, no se puede tipar nada.

### Tareas

1. **`supabase/migrations/0005_session_logs.sql`** — 3 tablas nuevas:
   - `habit_subtask_templates` — plantilla reusable de sub-tareas por hábito
     (ej. la rutina del entrenador). Columnas: `id`, `habit_id`, `user_id`,
     `label`, `position`, `metric_kind` (`reps|sets|weight|duration|count`),
     `created_at`.
   - `session_logs` — un registro por check-in (relación 1:1). Columnas: `id`,
     `check_in_id` (UNIQUE, FK con `ON DELETE CASCADE`), `habit_id`, `user_id`,
     `note`, `duration_sec`, `count_value`, `created_at`, `updated_at`.
   - `session_items` — sub-tareas concretas de una sesión. Columnas: `id`,
     `session_log_id`, `user_id`, `label`, `position`, `done`, `reps`, `sets`,
     `weight` (todos nullable), `created_at`.
   - RLS: una policy `for all` por tabla, copiando el patrón de `0002`.

2. **`supabase/migrations/0006_milestones.sql`** — tabla `milestone_celebrations`
   (`id`, `habit_id`, `user_id`, `milestone`, `seen_at`, UNIQUE
   `(habit_id, milestone)`). Solo registra qué milestone ya se mostró.

3. **`supabase/migrations/0007_session_log_rpc.sql`** — RPC `upsert_session_log`
   que guarda el log + reemplaza sus items de forma atómica. **No se toca
   `register_check_in`** — el path de scoring se mantiene puro.

4. Correr `npx supabase db reset` y regenerar tipos:
   `npx supabase gen types typescript --local > src/shared/types/database.types.ts`

### Entregable
Las 7 migraciones aplican sin error. `database.types.ts` incluye las 4 tablas
nuevas y el RPC.

---

## FASE 1 — Timer

**Qué resuelve:** hábitos de duración (meditar, leer, entrenar). El tiempo es
progreso medible, no un sí/no.

**Decisión técnica:** sin librería de timer. Se usa `setInterval` + Zustand +
matemática de timestamps. Se guarda `startedAt` (epoch ms) y `pausedElapsedMs`;
el elapsed siempre se recalcula — mandar la app a background no pierde tiempo.
El store se persiste con `persist` middleware + AsyncStorage para sobrevivir un
cierre forzado de la app.

**Única dependencia nueva:** `expo-keep-awake` (oficial, mínima) para que la
pantalla no se duerma durante una sesión.

### Tareas
- Skeleton del módulo `src/modules/session-log/` (alias `@session-log` en
  `tsconfig.json` y `jest.config.js`, `types/index.ts`, barrel `index.ts`).
- `utils/timerMath.ts` — función pura `computeElapsed()` + test.
- `utils/formatDuration.ts` — segundos → `"12:30"` / `"1h 05m"` + test.
- `states/timer.store.ts` — store Zustand con persist.
- `hooks/useTimer.ts` — selector hook.
- `components/TimerControl.tsx` — start/pause/reset, monta `useKeepAwake()`.

### Entregable
Cronómetro que cuenta, pausa, reanuda y sobrevive backgrounding. Tests verdes.

---

## FASE 2 — Session Log

**Qué resuelve:** el usuario registra *qué hizo* cada día. Ejemplo guía: un
hábito de entrenamiento donde ya tenés cargada la rutina del entrenador como
template, y cada día anotás reps/sets/peso por ejercicio + una nota.

**Decisión de arquitectura:** módulo nuevo `session-log`, NO se extiende
`check-in`. `check-in` es delgado a propósito (responde "¿pasó el día?" y
alimenta el score; 4 módulos dependen de él). Session Log responde otra
pregunta — "¿qué hiciste?" — con su propio ciclo de vida. El link es por dato
(`check_ins.id` FK), no por código.

### Tareas
- `services/session-log.service.ts` — get/upsert del log + items (vía RPC).
- `services/subtask-template.service.ts` — CRUD de la plantilla del hábito.
- `hooks/useSessionLog.ts` — cargar/guardar el log de un check-in.
- `hooks/useSubtaskTemplate.ts` — cargar/guardar la plantilla.
- `utils/templateToItems.ts` — plantilla → items en blanco + test.
- Componentes: `SessionItemRow`, `SessionItemList`, `SessionLogModal`,
  `TemplateManager`.

### Entregable
Se puede definir la plantilla de un hábito y guardar un log completo de sesión.

---

## FASE 3 — Integración en el detalle

**Qué resuelve:** conectar el flujo. Al marcar un hábito como hecho, se abre el
modal para registrar la sesión.

### Tareas
- En `app/habit/[id].tsx`: tras `markCompleted`/`markSkipped` exitoso, abrir
  `SessionLogModal` con el `check_in_id` del día.
- Si el hábito tiene plantilla, el modal pre-carga las sub-tareas.
- Cablear `TimerControl` dentro del modal — el tiempo medido entra al log.
- Entrada al `TemplateManager` desde el detalle.

> **Sin cambios** en el RPC `register_check_in` ni en `checkin.service`.

### Entregable
Loop completo: marcar hecho → modal → cargar sesión con timer → guardar.

---

## FASE 4 — Score chart

**Qué resuelve:** hacer visible la evolución. El usuario ve la curva de su
Commitment Score en el tiempo — la historia de su journey.

**Decisión técnica:** SVG custom con `react-native-svg` (ya instalado). Una
librería de charts (victory-native, ~300KB+, requiere reanimated + skia) es
desproporcionada para un solo gráfico.

### Tareas
- `commitment/utils/buildScoreSeries.ts` — recorre el historial aplicando el
  `calculateScore` **existente** y produce `{date, score}` por día planeado.
  Es el mismo loop que ya vive en `checkin.service.undo` — se extrae para que
  `undo` lo reuse (DRY). + test.
- `commitment/components/ScoreChart.tsx` — gráfico SVG con eje 0–100 y las 5
  bandas de mastery como guías. Ventana default: últimos 90 días.
- Integrar en `app/habit/[id].tsx`.

### Entregable
Gráfico de evolución del score en la pantalla de detalle.

---

## FASE 5 — Historial de sesiones

**Qué resuelve:** el usuario revisa sus sesiones pasadas — qué hizo, cuánto
tiempo, qué notó.

### Tareas
- `hooks/useSessionHistory.ts` — lista de logs de un hábito.
- `components/SessionLogCard.tsx` — resumen read-only de un log.
- Integrar como `Card` nuevo en `app/habit/[id].tsx`.

### Entregable
Lista de sesiones pasadas en el detalle del hábito.

---

## FASE 6 — Milestones

**Qué resuelve:** momentos de satisfacción. Cruzar 7/21/30/60/100 días de racha
dispara una celebración.

**Decisión de arquitectura:** se extiende el módulo `progression` (los
milestones son un concern de progresión). Los milestones se **computan** del
historial vía el `calculateStreak` existente — solo se persiste qué milestone
ya se mostró. `progression` NO importa `commitment`: la pantalla computa el
streak y se lo pasa al hook.

### Tareas
- `progression/constants/MILESTONES.ts` — definición de los hitos.
- `progression/utils/detectMilestone.ts` — detecta el hito recién cruzado + test.
- `progression/services/milestone.service.ts` — registra hitos vistos.
- `progression/hooks/useMilestones.ts`.
- `progression/components/MilestoneCelebration.tsx` — overlay con gradiente.
- Hook en `app/habit/[id].tsx` y el dashboard `app/(tabs)/index.tsx`.

### Entregable
Al cruzar un hito, aparece la celebración — una sola vez.

---

## TIER 2 — Roadmap futuro (no detallado aún)

- **Habit templates (hábitos pre-armados)** — biblioteca de hábitos listos con
  sub-tareas (ej. rutina de gym de un coach). Migración `0008` + módulo
  `templates/`. Reduce fricción de onboarding.
- **Weekly review** — pantalla `app/(tabs)/review.tsx` con el resumen semanal.
  Sin tabla nueva (agrega datos existentes).
- **Reminders / scheduling** — notificaciones (`expo-notifications`) + tabla
  `habit_reminders` + módulo `reminders/`.
- **Stats globales mejoradas** — minutos/sesiones totales, score chart global
  en `app/(tabs)/stats.tsx`.

## TIER 3 — Monetización futura

- **Premium templates** — plantillas de expertos detrás de un paywall.
- **AI insights** — análisis de patrones sobre las sesiones (Edge Function).
- **PDF export** — reporte de progreso mensual exportable.

---

## Cambio de UX no estructural

La fórmula del Commitment Score (`score × 0.8 + compliance × 20`) es demasiado
técnica para mostrarla al usuario. Se mantiene interna; en UI se muestra solo el
número + un label de momentum ("Tu momentum está creciendo"). Es un cambio de
copy, no de lógica.

---

## Riesgos a tener en cuenta

| # | Riesgo | Mitigación |
|---|--------|------------|
| R1 | Deshacer un check-in borra el session log (cascade) | Diálogo de confirmación cuando existe un log |
| R2 | Timer pierde estado si se mata la app | `persist` middleware + AsyncStorage |
| R3 | Usuario con racha vieja vería celebraciones spam | Solo hacia adelante: los hitos pasados se marcan vistos en silencio |
| R4 | El chart reproduce todo el historial | Ventana default de 90 días |
| R5 | Editar la plantilla cambiaría logs viejos | Los logs son hecho histórico — no se retro-modifican |
| R6 | El RPC confía en el JSON del cliente | Validación Zod client-side + constraints de columna |
| R7 | Strings nuevos sin traducir muestran la key cruda | Cada string en TODOS los locales (`en.ts`, `es.ts`) |
