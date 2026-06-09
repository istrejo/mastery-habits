# Proposal: add-today-view

## Intent

Replace the placeholder `today.tsx` with a functional Today View: habits, tasks, toggles, and a bottom-sheet task creator. Establishes TanStack Query ↔ Supabase conventions.

## Scope

### In Scope
- Week strip date selector driving habits/tasks queries
- Habits chips + toggle (`habits` + `habit_logs`; streak recompute)
- Tasks + sub-tasks (`tasks` with new `parent_id` self-reference)
- Create Task bottom sheet (`@gorhom/bottom-sheet`, react-hook-form, zod) — includes frequency selector (Daily, Weekly, Specific day, Custom days)
- Floating pomodoro pill (reads `usePomodoroStore`)
- Custom bottom tab bar
- Schedule events — mock data only
- DB migration: `add_tasks_parent_id` + `add_tasks_frequency`

### Out of Scope
- Priority selector on tasks (deferred per design review)
- Real Google Calendar integration
- Pomodoro session history persistence
- Habit creation/editing UI

## Capabilities

### New Capabilities
- `today-view`: Day-centric dashboard (habits, tasks, schedule events)
- `task-management`: CRUD for tasks and sub-tasks via bottom sheet
- `habit-tracking`: Toggle completion and recompute `current_streak`
- `bottom-sheet-ui`: Reusable `@gorhom/bottom-sheet` with root providers

### Modified Capabilities
- None

## Approach

TanStack Query owns all server-synced data. Week strip date is local state passed as query key. Streak recompute runs after successful log insert/delete. Bottom sheet uses react-hook-form + zod; root layout wraps `GestureHandlerRootView` and `BottomSheetModalProvider`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/(tabs)/today.tsx` | Modified | Full Today View implementation |
| `app/(tabs)/_layout.tsx` | Modified | Custom tab bar + bottom-sheet providers |
| `app/_layout.tsx` | Modified | Add `GestureHandlerRootView` + `BottomSheetModalProvider` |
| `src/features/habits/` | Modified | Reconcile `Habit` type; add streak logic |
| `src/features/tasks/` | New | Task store, components, services |
| `supabase/migrations/` | New | `add_tasks_parent_id` migration |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Habits store schema misalignment | Med | Reconcile `Habit` interface with DB before wiring UI |
| First Query/Supabase integration | Med | One hook per table; document pattern in comments |
| Streak recompute idempotency | Low | Treat `(habit_id, completed_date)` duplicate as no-op |
| Bottom sheet silently fails | Low | Verify root providers on iOS/Android during testing |

## Rollback Plan

1. Revert `today.tsx`, `app/(tabs)/_layout.tsx`, and `app/_layout.tsx` to pre-change state.
2. Remove `src/features/tasks/` directory.
3. Revert `useHabitsStore.ts` to pre-reconciliation state.
4. Roll back migration if deployed (or leave unused column).

## Dependencies

- Install `@gorhom/bottom-sheet`, `react-native-gesture-handler`, `react-native-reanimated`
- Run DB migrations: `add_tasks_parent_id`, `add_tasks_frequency`
- Reconcile `src/features/habits/useHabitsStore.ts` with DB types

## Success Criteria

- [ ] Today View renders habits and tasks for the selected date
- [ ] Toggling a habit updates `habit_logs` and `current_streak`
- [ ] Creating a task (with sub-tasks) from bottom sheet inserts and appears immediately
- [ ] Week strip changes day and refreshes data
- [ ] Pomodoro pill navigates to pomodoro tab
- [ ] Custom tab bar shows active state across all tabs
