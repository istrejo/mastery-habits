# Tasks: Today View

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~800 (150 + 200 + 250 + 200) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Data) → PR 2 (Habits) → PR 3 (Tasks) → PR 4 (Screen) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Data layer, schema, date utils, tab bar | PR 1 | `feature/add-today-view` base; includes tests/docs |
| 2 | Habits feature (service, hooks, UI) | PR 2 | targets PR 1 branch; depends on PR 1 |
| 3 | Tasks feature (service, hooks, bottom sheet) | PR 3 | targets PR 2 branch; depends on PR 2 |
| 4 | Screen assembly, schedule mock, polish | PR 4 | targets PR 3 branch; depends on PR 3 |

---

## PR 1 — Data Layer & Schema (~150 lines)

### 1.1 Apply migration `add_tasks_parent_id`
- [x] Add `parent_id` uuid + `ON DELETE CASCADE` + index via Supabase MCP
- **Estimated**: 5 lines (SQL)
- **TDD checkpoint**: Verify migration applies cleanly in branch DB

### 1.2 Apply migration `add_tasks_frequency`
- [x] Create `task_frequency` enum + `custom_days` smallint[] + defaults via Supabase MCP
- **Estimated**: 8 lines (SQL)
- **TDD checkpoint**: Verify enum exists, test custom_days insertion

### 1.3 Regenerate `src/shared/types/database.types.ts`
- [x] Run `generate_typescript_types`; verify `parent_id`, `frequency`, `custom_days` columns exist
- **Estimated**: 20 lines (generated diff)
- **TDD checkpoint**: Type checks pass on `tasks` table

### 1.4 Add `src/core/utils/date.ts`
- [x] Implement `toDateString`, `todayString`, `getWeekDays`, `isSameDay`
- **Estimated**: 30 lines
- **TDD checkpoint**: `src/core/utils/date.test.ts` must exist BEFORE implementation

### 1.5 Create `src/core/api/queryKeys.ts`
- [x] Add `qk` object with `tasks`, `subtasks`, `habits`, `habitLogs` keys
- **Estimated**: 10 lines
- **TDD checkpoint**: None — pure config, no logic

### 1.6 Configure QueryClient defaults
- [x] Add `staleTime: 30000`, `retry: 1` to `app/_layout.tsx` QueryClient config
- **Estimated**: 5 lines
- **TDD checkpoint**: None — config change

### 1.7 Install `@gorhom/bottom-sheet`
- [x] `npm install @gorhom/bottom-sheet` + verify peer deps (gesture-handler, reanimated)
- **Estimated**: package-lock diff only
- **TDD checkpoint**: App boots without error

### 1.8 Add `GestureHandlerRootView` + `BottomSheetModalProvider`
- [x] Wrap tree in `app/_layout.tsx`
- **Estimated**: 10 lines
- **TDD checkpoint**: Manual test — bottom sheet renders on iOS/Android

### 1.9 Style tab bar in `app/(tabs)/_layout.tsx`
- [x] `screenOptions` with active/inactive tint from tokens, `tabBarStyle`, safe-area
- [x] Per-screen `tabBarIcon` with Material Icons (`today`, `cached`, `timer`, `settings`)
- **Estimated**: 30 lines
- **TDD checkpoint**: None — styling, verify visually

### 1.10 Verify tab navigation + accessibility
- [x] Each tab navigates to correct route; `accessibilityLabel` on all tabs
- **Estimated**: 10 lines
- **TDD checkpoint**: None — accessibility labels via inspector

---

## PR 2 — Habits Feature (~200 lines)

### 2.1 Reconcile `useHabitsStore.ts`
- [x] Replace hand-written `Habit` with `Database['public']['Tables']['habits']['Row']`
- [x] Keep only `pendingToggles: Set<string>` for optimistic state
- **Estimated**: 25 lines
- **TDD checkpoint**: None — type-only change
- **Depends on**: PR 1 (1.3 types)

### 2.2 Create `src/features/habits/services/habitsService.ts`
- [x] Implement `fetchActiveHabits`, `fetchLogsForDate`, `insertLog`, `deleteLog`, `writeStreak`
- **Estimated**: 50 lines
- **TDD checkpoint**: `src/features/habits/services/habitsService.test.ts` must exist BEFORE implementation
- **Depends on**: PR 1 (1.4 date utils, 1.5 query keys)

### 2.3 Create streak recompute helper
- [x] Idempotent algorithm; respects `frequency` (daily/weekly); `UNIQUE` constraint handles duplicates
- **Estimated**: 30 lines
- **TDD checkpoint**: `src/features/habits/services/streakHelper.test.ts` must exist BEFORE implementation
- **Depends on**: PR 2 (2.2)

### 2.4 Create hooks: `useHabitsQuery.ts` + `useToggleHabit.ts`
- [x] `useHabitsQuery`: `useQuery` for habits + merged completion flag
- [x] `useToggleHabit`: `useMutation` with optimistic `onMutate`/`onError` rollback
- **Estimated**: 40 lines
- **TDD checkpoint**: `src/features/habits/hooks/useHabitsQuery.test.ts` and `useToggleHabit.test.ts` must exist BEFORE implementation
- **Depends on**: PR 2 (2.2, 2.3)

### 2.5 Create presentational components: `HabitsSection.tsx` + `HabitChip.tsx`
- [x] `HabitsSection`: scrollable row of chips
- [x] `HabitChip`: single chip with check state + color
- **Estimated**: 35 lines
- **TDD checkpoint**: `src/features/habits/components/HabitsSection.test.tsx` and `HabitChip.test.tsx` must exist BEFORE implementation
- **Depends on**: PR 2 (2.4)

---

## PR 3 — Tasks Feature (~250 lines)

### 3.1 Create `src/features/tasks/useTasksStore.ts`
- [x] Optimistic toggle state: `Set<string>` of task ids in flight
- **Estimated**: 15 lines
- **TDD checkpoint**: None — trivial store
- **Depends on**: PR 1 (1.3 types)

### 3.2 Create `src/features/tasks/services/tasksService.ts`
- [x] `fetchTasksByDate`, `fetchSubTasks`, `insertTask` (with sub-tasks), `toggleTask`, `deleteTask`
- **Estimated**: 60 lines
- **TDD checkpoint**: `src/features/tasks/services/tasksService.test.ts` must exist BEFORE implementation
- **Depends on**: PR 1 (1.4 date utils, 1.5 query keys)

### 3.3 Create hooks: `useTasksQuery.ts`, `useCreateTask.ts`, `useToggleTask.ts`
- [x] `useTasksQuery`: `useQuery` for tasks + sub-tasks
- [x] `useCreateTask`: `useMutation` for insert + sub-tasks
- [x] `useToggleTask`: `useMutation` with optimistic `is_completed` flip
- **Estimated**: 50 lines
- **TDD checkpoint**: `src/features/tasks/hooks/useTasksQuery.test.ts`, `useCreateTask.test.ts`, `useToggleTask.test.ts` must exist BEFORE implementation
- **Depends on**: PR 3 (3.2)

### 3.4 Create presentational components: `TasksSection.tsx`, `TaskRow.tsx`, `SubTaskRow.tsx`
- [x] `TasksSection`: collapsible header + list
- [x] `TaskRow`: task with checkbox, priority badge, description
- [x] `SubTaskRow`: nested sub-task with checkbox
- **Estimated**: 55 lines
- **TDD checkpoint**: `src/features/tasks/components/TasksSection.test.tsx`, `TaskRow.test.tsx`, `SubTaskRow.test.tsx` must exist BEFORE implementation
- **Depends on**: PR 3 (3.3)

### 3.5 Create `CreateTaskSheet.tsx`
- [x] `@gorhom/bottom-sheet` + `react-hook-form` + `zod`
- [x] Fields: title (required), due_date (default selected), frequency selector, custom_days chip group, sub-tasks
- [x] `frequency` values: `'once' | 'daily' | 'weekly' | 'custom'`
- **Estimated**: 55 lines
- **TDD checkpoint**: `src/features/tasks/components/CreateTaskSheet.test.tsx` must exist BEFORE implementation (validate form, frequency selector, custom days)
- **Depends on**: PR 1 (1.7, 1.8 bottom-sheet), PR 3 (3.3)

---

## PR 4 — Screen Assembly & Polish (~200 lines)

### 4.1 Create `src/features/schedule/mockSchedule.ts` + `ScheduleSection.tsx`
- [ ] `getMockSchedule()` returns deterministic `ScheduleEvent[]` per date
- [ ] `ScheduleSection`: collapsible mock events (icon, title, time, subtitle)
- **Estimated**: 40 lines
- **TDD checkpoint**: `src/features/schedule/mockSchedule.test.ts` must exist BEFORE implementation
- **Depends on**: None (self-contained)

### 4.2 Create `WeekStrip.tsx`
- [ ] Mon–Fri strip; today selected by default; `onSelectDate` callback
- **Estimated**: 35 lines
- **TDD checkpoint**: `src/features/schedule/WeekStrip.test.tsx` must exist BEFORE implementation
- **Depends on**: PR 1 (1.4 date utils)

### 4.3 Create `PomodoroPill.tsx`
- [ ] Floating pill reading `usePomodoroStore` (default `25:00`); tap navigates to Pomodoro tab
- **Estimated**: 20 lines
- **TDD checkpoint**: `src/features/pomodoro/PomodoroPill.test.tsx` must exist BEFORE implementation
- **Depends on**: None (reads existing store)

### 4.4 Build `app/(tabs)/today.tsx` container
- [ ] `selectedDate` state; wire all Query hooks; mount full component tree (WeekStrip, HabitsSection, TasksSection, ScheduleSection, CreateTaskSheet, PomodoroPill)
- **Estimated**: 60 lines
- **TDD checkpoint**: None — integration screen, manual test
- **Depends on**: PR 2 (2.5), PR 3 (3.4, 3.5), PR 4 (4.1, 4.2, 4.3)

### 4.5 Implement collapsible section behavior + accessibility + safe-area
- [ ] Chevron toggle on all sections; `accessibilityRole` + `accessibilityLabel` on all interactive elements; checkboxes expose checked state; safe-area padding
- **Estimated**: 25 lines
- **TDD checkpoint**: None — accessibility via inspector
- **Depends on**: PR 4 (4.4)

### 4.6 Run `react-doctor` and fix findings
- [ ] `npm run doctor` → fix all warnings/errors
- **Estimated**: 15 lines
- **TDD checkpoint**: None — tooling pass

---

## TDD Checkpoints Summary

| PR | Unit | Test File Must Exist Before Implementation |
|----|------|-------------------------------------------|
| 1 | date utilities | `src/core/utils/date.test.ts` |
| 2 | habitsService | `src/features/habits/services/habitsService.test.ts` |
| 2 | streak helper | `src/features/habits/services/streakHelper.test.ts` |
| 2 | habits hooks | `src/features/habits/hooks/useHabitsQuery.test.ts`, `useToggleHabit.test.ts` |
| 2 | habits UI | `src/features/habits/components/HabitsSection.test.tsx`, `HabitChip.test.tsx` |
| 3 | tasksService | `src/features/tasks/services/tasksService.test.ts` |
| 3 | tasks hooks | `src/features/tasks/hooks/useTasksQuery.test.ts`, `useCreateTask.test.ts`, `useToggleTask.test.ts` |
| 3 | tasks UI | `src/features/tasks/components/TasksSection.test.tsx`, `TaskRow.test.tsx`, `SubTaskRow.test.tsx` |
| 3 | CreateTaskSheet | `src/features/tasks/components/CreateTaskSheet.test.tsx` |
| 4 | mockSchedule | `src/features/schedule/mockSchedule.test.ts` |
| 4 | WeekStrip | `src/features/schedule/WeekStrip.test.tsx` |
| 4 | PomodoroPill | `src/features/pomodoro/PomodoroPill.test.tsx` |

## Dependency Graph

```
PR 1 ──┬── PR 2 ──┬── PR 4
       │          │
       └── PR 3 ──┘
```

- PR 1 is base (schema, types, date utils, tab bar, bottom-sheet infra)
- PR 2 (Habits) and PR 3 (Tasks) are parallel after PR 1; both required for PR 4
- PR 4 (Screen assembly) requires PR 2 and PR 3

## Risks

| Risk | Mitigation |
|------|-----------|
| `tsconfig` aliases broken | All imports use relative paths; verified in task descriptions |
| Bottom-sheet + reanimated peer deps mismatch | Install via `npm install` + verify on first run; app boots in 1.8 |
| Streak recompute idempotency | `UNIQUE(habit_id, completed_date)` prevents duplicate logs; covered in 2.3 tests |
| Tab bar Material Icons vs Ionicons | Design uses Material Icons; tasks use `@expo/vector-icons/MaterialIcons` |
| 800-line total exceeds 400-line budget | Split into 4 chained PRs; decision needed before apply |
| Query key invalidation discipline | Documented in 1.5; each mutation invalidates its own key |
