# Today View — Implementation Plan (SDD-ready)

> **Execution note for the implementing model:** This document is self-contained.
> Run it via `/sdd-apply add-today-view`. STRICT TDD MODE is active for this project —
> write tests first where a test runner exists, otherwise follow the verification section.
> Read the linked project skills before coding (see §7).
> Change name: `add-today-view`.

---

## 0. Design references (Stitch)

- **Project:** Pendie Task & Habit Tracker — ID `2673083030812216083`
- **Today View** — screen ID `8bdc46bc45f347a380656baf820a3413`
- **Create Task Sheet Overlay** — screen ID `b94d7ebd3b2a418d8d1defd224d9b10b`

Re-fetch assets with the Stitch MCP `get_screen` tool (HTML + screenshot download URLs expire):

```
get_screen(name="projects/2673083030812216083/screens/8bdc46bc45f347a380656baf820a3413")
get_screen(name="projects/2673083030812216083/screens/b94d7ebd3b2a418d8d1defd224d9b10b")
```

### Today View layout (top → bottom)

1. **Header:** `Pendie` wordmark (centered), calendar icon (left), account avatar (right).
2. **Week-day strip:** horizontal Mon–Fri with date numbers; the selected day is highlighted (filled primary pill). Drives the data shown below.
3. **Schedule** (collapsible, chevron): mock calendar events — e.g. `Design Sync · 10:00 AM · Google Meet`, `Lunch w/ Sarah · 12:30 PM · Blue Bottle Cafe`. Icon per event (video / location).
4. **Habits** (collapsible, chevron): pill chips with a leading checkbox — e.g. `Drink Water` (checked), `Read 20 pages`, `Stretch`. Tapping toggles completion for the selected day.
5. **Tasks** (collapsible, chevron): rows with a checkbox, title, optional `High Priority` badge + label, optional description (`Review PR #402 → Check the new API endpoint implementation`), nested sub-task rows, and a `+ Add sub-task` link.
6. **Bottom tab bar:** Today · Habits · Pomodoro · Settings — styled with icons + labels and a green active indicator. Currently a bare default in `app/(tabs)/_layout.tsx` (no icons/style); built as part of this change (see §3.12 / R9).
7. **Floating pomodoro pill:** dark rounded pill showing `25:00`, bottom-right above the tab bar.

### Create Task sheet (overlay)

Drag handle → `New Task` title → task title text input → date selector (defaults to Today, reuses the week strip) → priority selector (`low` / `medium` / `high`) → `+ Add sub-task` (repeatable title rows) → primary `Save` button.

> The design also shows a **Frequency** control — **omitted in v1** (recurrence belongs to habits, not tasks).

---

## 1. Proposal

### Intent

Replace the placeholder `app/(tabs)/today.tsx` with a functional Today View that shows the
user's habits and tasks for a selected day, lets them toggle completion, and create new tasks
(with optional sub-tasks) from a bottom sheet. This is the **first** feature in the app to wire
TanStack Query to Supabase — it establishes the data-fetching conventions the rest of the app
will follow.

### Scope (design → v1 decision)

| Design element | v1 decision |
|---|---|
| Schedule events | **Mock data** (typed module), labeled future Google Calendar integration. No DB table. |
| Habits chips + toggle | **Real** — `habits` + `habit_logs` for selected day; toggle = insert/delete log + recompute `current_streak`. |
| Tasks + sub-tasks | **Real** — `tasks` with new `parent_id` self-reference. Top-level filtered by `due_date = selectedDate`; sub-tasks fetched by `parent_id`. |
| Create Task sheet | **Real** — `@gorhom/bottom-sheet` + react-hook-form + zod. Fields: title, due_date, priority, optional sub-tasks. |
| Week strip | **Real** — date selector; drives habits/tasks queries for selected date. |
| Floating pomodoro pill | **Real** — reads `usePomodoroStore`, navigates to the pomodoro tab. |
| Bottom tab bar | **Real** — custom styled tab bar (icons + labels + active indicator) for the whole app, built now to avoid reworking navigation later. |
| Frequency on tasks | **Out of scope** (recurrence = habits). |

### Risks

- **Habits store schema misalignment** (see §3.2). The local `Habit` interface diverges from the DB. Reconciling it is a prerequisite and may touch any future consumer — but today only `useHabitsStore` itself exists, so blast radius is small.
- **First Query/Supabase integration** — no pattern to copy. The conventions defined here become the project standard; keep them clean.
- **Streak recompute on the client** — must be idempotent against the `(habit_id, completed_date)` UNIQUE constraint.
- **Bottom sheet requires root providers** — forgetting `GestureHandlerRootView` / `BottomSheetModalProvider` yields a silently non-opening sheet.

---

## 2. Spec (requirements + scenarios)

Format: each requirement followed by Given/When/Then scenarios.

### R1 — Week-day strip drives the day context

- Shows a 5-day (Mon–Fri) strip around today; the selected day is visually highlighted.
- **Given** the screen opens, **When** it mounts, **Then** today is selected by default and habits/tasks load for today.
- **Given** a day is selected, **When** the user taps another day, **Then** the Schedule/Habits/Tasks sections refetch for that date.

### R2 — Schedule section (mock)

- Renders mocked events for the selected day with title, time, and location/source.
- **Given** mock events exist, **When** the section renders, **Then** each event shows its icon, title, time, and subtitle.
- **Given** the chevron is tapped, **When** collapsed, **Then** the event list hides and the header remains.
- The section MUST be visibly marked/commented as placeholder pending Google Calendar integration.

### R3 — Habits section (real)

- Lists the user's active habits (`is_active = true`) as chips, each showing completion state for the selected day.
- **Given** a habit has a `habit_log` for the selected date, **When** rendered, **Then** its chip is checked.
- **Given** a habit chip is tapped while unchecked, **When** toggled, **Then** a `habit_log` row is inserted for `(habit_id, selectedDate)` and `current_streak` is recomputed and written.
- **Given** a habit chip is tapped while checked, **When** toggled, **Then** the matching `habit_log` row is deleted and `current_streak` is recomputed.
- Toggle is **optimistic**: the chip updates immediately, rolls back on error.

### R4 — Tasks section (real)

- Lists top-level tasks (`parent_id IS NULL`) whose `due_date` equals the selected date, ordered by priority then creation.
- **Given** a task has `priority = 'high'`, **When** rendered, **Then** a `High Priority` badge shows.
- **Given** a task has a description, **When** rendered, **Then** the description shows beneath the title.
- **Given** a task checkbox is tapped, **When** toggled, **Then** `is_completed` flips and `completed_at` is set/cleared (optimistic).

### R5 — Sub-tasks (real)

- Each top-level task may have sub-tasks (`tasks` rows with `parent_id = task.id`).
- **Given** a task has sub-tasks, **When** expanded, **Then** sub-task rows render with their own checkboxes.
- **Given** the user taps `+ Add sub-task`, **When** a title is entered and confirmed, **Then** a sub-task is created with `parent_id` set and inherits the parent's `due_date`.
- **Given** a parent task is deleted, **When** the delete commits, **Then** sub-tasks are removed too (DB `ON DELETE CASCADE`).

### R6 — Create Task sheet (real)

- Opens from a `+` affordance; uses `@gorhom/bottom-sheet`.
- Fields: title (required), due_date (defaults to selected day), priority (low/medium/high, default medium), optional sub-task title rows.
- Validation via zod + react-hook-form; Save disabled until valid.
- **Given** valid input, **When** Save is tapped, **Then** the task (and any sub-tasks) is inserted, the sheet closes, and the Tasks list refetches/invalidates.
- **Given** an insert error, **When** Save fails, **Then** an error is surfaced and the sheet stays open.

### R7 — Floating pomodoro pill

- Shows the current pomodoro time from `usePomodoroStore` (defaults `25:00`).
- **Given** the pill is tapped, **When** pressed, **Then** the app navigates to the Pomodoro tab.

### R9 — Bottom tab bar (shared navigation)

- The `(tabs)` navigator renders a styled tab bar with an icon + label per tab: Today, Habits, Pomodoro, Settings.
- The active tab is visually distinct (green active tint/indicator per design); inactive tabs are muted.
- **Given** the app is on the Today tab, **When** the bar renders, **Then** the Today item shows its active state and the others are inactive.
- **Given** any tab is tapped, **When** pressed, **Then** the navigator switches to that route and the active state moves.
- Tab bar uses semantic tokens (no hardcoded hex), respects bottom safe-area inset, and each tab exposes an `accessibilityLabel` + selected state.

### R8 — Theming & accessibility

- Uses NativeWind semantic tokens only (`bg-background`, `text-on-surface`, `text-on-surface-variant`, `bg-primary`, etc.). No hardcoded hex.
- All interactive elements have `accessibilityRole` / `accessibilityLabel`; checkboxes expose checked state.
- Respects safe-area insets (`react-native-safe-area-context`).

---

## 3. Design

### 3.1 Architecture overview

- **Presentation** stays in `app/(tabs)/today.tsx` (container) + presentational components under `src/features/*/components/`.
- **Server state = TanStack Query** is the source of truth. **Zustand = optimistic UI only** (per `CLAUDE.md`). Do NOT cache server lists in Zustand.
- Each feature owns its store, `services/` (raw Supabase calls), and Query hooks. No cross-feature imports — shared primitives via `src/shared/`.
- **Imports are relative** (`tsconfig` path aliases are broken — see `CLAUDE.md`).

### 3.2 Habits store reconciliation (prerequisite)

The current `Habit` interface in `src/features/habits/useHabitsStore.ts` does not match the DB.
Replace the hand-written entity with the generated DB type and keep the store for optimistic
state only:

```ts
import { Database } from "../../shared/types/database.types";

export type Habit = Database["public"]["Tables"]["habits"]["Row"];
export type HabitLog = Database["public"]["Tables"]["habit_logs"]["Row"];
```

Drop `name/description/targetDays/score/createdAt`. Real fields: `id`, `title`, `color`,
`frequency`, `is_active`, `current_streak`, `created_at`, `updated_at`, `user_id`. The store
keeps only optimistic toggle state (e.g. a `Set` of habit ids pending toggle); lists come from Query.

### 3.3 New `src/features/tasks/` module

```
src/features/tasks/
  useTasksStore.ts          # optimistic toggle state only (Set of task ids in flight)
  services/tasksService.ts  # raw supabase.from('tasks') calls
  hooks/
    useTasksQuery.ts        # list top-level tasks + sub-tasks for a date
    useCreateTask.ts        # mutation: insert task (+ sub-tasks)
    useToggleTask.ts        # mutation: flip is_completed (optimistic)
  components/
    TasksSection.tsx
    TaskRow.tsx
    SubTaskRow.tsx
    CreateTaskSheet.tsx
```

### 3.4 Habits service + hooks

```
src/features/habits/
  services/habitsService.ts   # fetch active habits, today's logs, insert/delete log, write streak
  hooks/
    useHabitsQuery.ts         # active habits + logs for selected date (merged completion flag)
    useToggleHabit.ts         # optimistic mutation: insert/delete log + recompute streak
  components/
    HabitsSection.tsx
    HabitChip.tsx
```

### 3.5 Query-key convention (NEW project standard)

```ts
const qk = {
  tasks: (userId: string, date: string) => ["tasks", userId, date] as const,
  subtasks: (parentId: string) => ["tasks", "sub", parentId] as const,
  habits: (userId: string) => ["habits", userId] as const,
  habitLogs: (userId: string, date: string) => ["habitLogs", userId, date] as const,
};
```

Mutations invalidate the matching keys on success. Configure a sensible default on the existing
`QueryClient` in `app/_layout.tsx` (e.g. `staleTime: 30_000`, `retry: 1`).

### 3.6 Streak recompute algorithm (client-side, after a log insert)

Per `CLAUDE.md`, there is no DB trigger. After a successful log insert/delete:

1. Fetch the habit's `habit_logs.completed_date` ordered descending.
2. Walk consecutive days backward from today (respecting `frequency`: daily = every day; weekly = covered if a log exists in the current ISO week).
3. Write the resulting count to `habits.current_streak`.

Keep this idempotent — the `(habit_id, completed_date)` UNIQUE constraint means a double-insert
is a conflict, so use upsert with `onConflict: 'habit_id,completed_date'` + `ignoreDuplicates`, or
catch the conflict.

### 3.7 Component tree

```
TodayScreen (container — owns selectedDate state, all hooks)
├── Header
├── WeekStrip            (selectedDate, onSelectDate)         [presentational]
├── ScheduleSection      (events: mock)                        [presentational]
├── HabitsSection        (habits[], onToggle)                  [presentational]
│   └── HabitChip        (habit, checked, onToggle)
├── TasksSection         (tasks[], onToggleTask, onAddSubtask) [presentational]
│   └── TaskRow          (task, subtasks[], ...)
│       └── SubTaskRow   (subtask, onToggle)
├── CreateTaskSheet      (ref, defaultDate, onSubmit)          [@gorhom/bottom-sheet]
└── PomodoroPill         (time, onPress)
```

Presentational components are dumb (props in, callbacks out). All data/mutation wiring lives in
the `TodayScreen` container via the hooks above.

### 3.8 Mock schedule module

```ts
// src/features/schedule/mockSchedule.ts
// TODO: replace with Google Calendar integration (separate feature). Mock only.
export interface ScheduleEvent {
  id: string;
  title: string;
  time: string;        // display string e.g. "10:00 AM"
  subtitle: string;    // "Google Meet" | "Blue Bottle Cafe"
  kind: "video" | "location";
}
export const getMockSchedule = (date: string): ScheduleEvent[] => [ /* ... */ ];
```

### 3.9 Date utilities (no new dependency)

```ts
// src/core/utils/date.ts
export const toDateString = (d: Date): string => d.toISOString().slice(0, 10); // YYYY-MM-DD
export const todayString = (): string => toDateString(new Date());
export const getWeekDays = (around: Date): Date[] => { /* Mon–Fri around `around` */ };
export const isSameDay = (a: string, b: string): boolean => a === b;
```

> `habit_logs.completed_date` and `tasks.due_date` are DATE strings (`YYYY-MM-DD`) — compare as strings, never construct timestamps (avoids the timezone mismatch called out in `CLAUDE.md`).

### 3.10 Bottom-sheet setup

In `app/_layout.tsx`, wrap the tree:

```tsx
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

<GestureHandlerRootView style={{ flex: 1 }}>
  <QueryClientProvider client={queryClient}>
    <BottomSheetModalProvider>
      <ThemeProvider>{/* Stack + AuthGuard */}</ThemeProvider>
    </BottomSheetModalProvider>
  </QueryClientProvider>
</GestureHandlerRootView>
```

`CreateTaskSheet` uses `BottomSheetModal` with snap points (e.g. `['60%']`) and `BottomSheetTextInput` for fields.

### 3.12 Tab bar (shared navigation)

The current `app/(tabs)/_layout.tsx` is the bare default (no icons, no styling):

```tsx
<Tabs screenOptions={{ headerShown: false }}>
  <Tabs.Screen name="today" options={{ title: "Today" }} />
  <Tabs.Screen name="habits" options={{ title: "Habits" }} />
  <Tabs.Screen name="pomodoro" options={{ title: "Pomodoro" }} />
  <Tabs.Screen name="settings" options={{ title: "Settings" }} />
</Tabs>
```

**Approach:** keep `expo-router` `Tabs` and drive the look through `screenOptions` +
per-screen `tabBarIcon`. Use `@expo/vector-icons` (Ionicons, already used in the app). Pull
colors from theme tokens via NativeWind's resolved CSS vars — do NOT hardcode hex.

```tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// active = green per design (secondary token #006c49); inactive = on-surface-variant (#434655)
<Tabs
  screenOptions={{
    headerShown: false,
    tabBarActiveTintColor: "#006c49",      // --color-secondary
    tabBarInactiveTintColor: "#434655",    // --color-on-surface-variant
    tabBarStyle: { /* surface bg, top border via --color-outline-variant, safe-area aware */ },
  }}
>
  <Tabs.Screen name="today"    options={{ title: "Today",    tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "today" : "today-outline"} size={24} color={color} /> }} />
  <Tabs.Screen name="habits"   options={{ title: "Habits",   tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "repeat" : "repeat-outline"} size={24} color={color} /> }} />
  <Tabs.Screen name="pomodoro" options={{ title: "Pomodoro", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "timer" : "timer-outline"} size={24} color={color} /> }} />
  <Tabs.Screen name="settings" options={{ title: "Settings", tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "settings" : "settings-outline"} size={24} color={color} /> }} />
</Tabs>
```

Icon mapping (Ionicons): Today `today`, Habits `repeat`, Pomodoro `timer`, Settings `settings`
(use the `-outline` variant when not focused).

**Design fidelity option:** if the green rounded active *background pill* behind the icon (as in
the Stitch design) is required and `tabBarItemStyle`/`tabBarActiveBackgroundColor` can't reproduce
it cleanly, implement a custom bar via the `tabBar={(props) => <CustomTabBar {...props} />}` prop
and place `CustomTabBar` in `src/shared/ui/` (shared navigation primitive, token-driven). Prefer
the `screenOptions` approach first; escalate to a custom component only if the pill indicator is a
hard requirement.

> Token note: `tabBar*TintColor` props need literal color values (not Tailwind classes). Source
> them from `src/core/theme/tokens.ts` so they stay in sync; when `darkTheme` is fleshed out,
> read the resolved values from the theme rather than duplicating hex here.

### 3.11 DB migration

```sql
-- migration: add_tasks_parent_id
ALTER TABLE public.tasks
  ADD COLUMN parent_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE;

CREATE INDEX idx_tasks_parent_id ON public.tasks(parent_id);
```

- Existing RLS (`user_id = auth.uid()`) is unaffected and recursion-safe with a self-FK.
- Apply via Supabase MCP `apply_migration` (project ref `nvpkgrqfzrcwgigztymp`).
- After applying, **regenerate types**: `generate_typescript_types` → overwrite `src/shared/types/database.types.ts` (do not hand-edit).

---

## 4. Tasks (ordered, dependency-aware)

> Sized for chained PRs if the diff exceeds ~400 lines. Suggested split marked with `── PR boundary ──`.

**PR 1 — Data layer & schema**
- [ ] 1.1 Apply migration `add_tasks_parent_id` (`parent_id` + index) via Supabase MCP.
- [ ] 1.2 Regenerate `src/shared/types/database.types.ts`; verify `tasks.Row.parent_id` exists.
- [ ] 1.3 Add `src/core/utils/date.ts` (date string helpers + week strip).
- [ ] 1.4 Configure `QueryClient` defaults in `app/_layout.tsx`.
- [ ] 1.5 Add `GestureHandlerRootView` + `BottomSheetModalProvider` to `app/_layout.tsx`.
- [ ] 1.6 Install `@gorhom/bottom-sheet` (`npm i @gorhom/bottom-sheet`).
- [ ] 1.7 Style the tab bar in `app/(tabs)/_layout.tsx` — `screenOptions` (active/inactive tint from tokens, `tabBarStyle`, safe-area) + per-screen `tabBarIcon` (Ionicons mapping per §3.12).
- [ ] 1.8 (Only if the green active *pill* indicator is required) add `CustomTabBar` to `src/shared/ui/` and wire it via the `tabBar` prop.
- [ ] 1.9 Verify each tab navigates and shows correct active state; check accessibility labels.

`── PR boundary ──`

**PR 2 — Habits feature**
- [ ] 2.1 Reconcile `useHabitsStore.ts` to DB types (optimistic-only state).
- [ ] 2.2 `habitsService.ts` — fetch active habits, fetch logs for date, insert/delete log, write streak.
- [ ] 2.3 Streak recompute helper (idempotent; respects `frequency`).
- [ ] 2.4 `useHabitsQuery` + `useToggleHabit` (optimistic).
- [ ] 2.5 `HabitsSection` + `HabitChip` (presentational).

`── PR boundary ──`

**PR 3 — Tasks feature**
- [ ] 3.1 `useTasksStore.ts` (optimistic toggle state).
- [ ] 3.2 `tasksService.ts` — list top-level by date, list sub-tasks, insert (+ sub-tasks), toggle.
- [ ] 3.3 `useTasksQuery` + `useToggleTask` + `useCreateTask`.
- [ ] 3.4 `TasksSection` + `TaskRow` + `SubTaskRow` (presentational).
- [ ] 3.5 `CreateTaskSheet` (`@gorhom/bottom-sheet` + react-hook-form + zod).

`── PR boundary ──`

**PR 4 — Screen assembly & polish**
- [ ] 4.1 `src/features/schedule/mockSchedule.ts` + `ScheduleSection`.
- [ ] 4.2 `WeekStrip` (presentational, date selector).
- [ ] 4.3 `PomodoroPill` (reads `usePomodoroStore`, navigates to pomodoro tab).
- [ ] 4.4 Build `app/(tabs)/today.tsx` container — wire `selectedDate`, all hooks, sheet ref, sections.
- [ ] 4.5 Collapsible section behavior + accessibility labels + safe-area.
- [ ] 4.6 Run `react-doctor` (`/doctor`) and fix findings.

---

## 5. Verification (end-to-end)

**Run:** `npm run ios` (or `npm start` then open a simulator).

**Manual checks:**
1. Today is selected on open; habits and tasks for today load.
2. Tap another weekday → sections refetch for that date.
3. Toggle a habit chip → chip flips immediately; confirm a `habit_logs` row appears/disappears and `habits.current_streak` updates (verify via Supabase MCP `execute_sql`).
4. Toggle a task → `is_completed` / `completed_at` update; persists across refetch.
5. Open Create Task sheet → add title + a sub-task + priority high → Save → task appears with `High Priority` badge; sub-task nested under it; both in DB with correct `parent_id`.
6. Delete a parent task → sub-tasks gone (cascade) — verify via SQL.
7. Tap pomodoro pill → navigates to Pomodoro tab.
8. Toggle theme (Settings) → Today View tokens respond (no hardcoded colors).
9. Tab bar shows icons + labels; active tab is green/highlighted; tapping each tab navigates and moves the active state.

**DB checks (Supabase MCP):**
```sql
select id, title, parent_id, due_date, is_completed from tasks where user_id = auth.uid() order by created_at desc limit 20;
select habit_id, completed_date from habit_logs where user_id = auth.uid() order by completed_date desc limit 20;
```

**Cache checks:** after each mutation, confirm the relevant query key is invalidated and the UI reflects server truth (no stale Zustand data).

---

## 6. Out of scope (future)

- **Google Calendar integration** — real Schedule data (replaces the mock module).
- Habits CRUD screen, Pomodoro internals, Settings beyond theme.
- Task **recurrence/frequency**.
- MMKV swap (storage stays AsyncStorage-backed pending EAS Build).

---

## 7. Skills / standards for the executor

Read before coding:
- `react-doctor` — run before committing React/RN code.
- `supabase-postgres-best-practices` — for the migration and queries.
- `work-unit-commits` + `chained-pr` — keep each PR a reviewable unit under ~400 lines.

**Project gotchas (from `CLAUDE.md`):** relative imports only (broken tsconfig aliases);
storage is async (MMKV stubbed); never hand-edit `database.types.ts`; `completed_date`/`due_date`
are DATE strings — compare as strings.
