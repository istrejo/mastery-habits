# Design: Today View

## Technical Approach

Replace `today.tsx` placeholder with a day-centric dashboard. TanStack Query owns all server state; Zustand holds only optimistic toggle state. Week strip date drives all queries. Bottom sheet for task creation. Relies on existing NativeWind theme tokens, `src/shared/ui/` primitives, and Supabase RLS.

## Architecture Decisions

| Decision | Option | Tradeoff | Choice |
|----------|--------|----------|--------|
| Server state owner | TanStack Query | Requires query invalidation discipline; avoids stale Zustand caches | **TanStack Query** |
| Optimistic updates | Zustand Set<id> + `onMutate`/`onError` | Simpler than cache-level optimistic; clear separation of concerns | **Zustand Set per feature** |
| Habit type source | Generated `Database['public']...` | Auto-syncs with schema; drops hand-written fields | **DB types** (reconcile existing) |
| Query key convention | `[resource, userId, date]` array | Standard `@tanstack/query` pattern; enables granular invalidation | **Array keys** in `src/core/api/queryKeys.ts` |
| Streak algorithm | Client-side after mutation | No DB trigger; idempotent via unique constraint | **Client-side walk** |
| Tab bar styling | NativeWind + `--color-*` tokens | Works with theme system; no hex duplication; needs literal color for `tabBarActiveTintColor` | **Tokens + Ionicons** |
| Bottom sheet library | `@gorhom/bottom-sheet` v4 | Already in `package.json` via `react-native-gesture-handler` + `react-native-reanimated` | **pre-installed deps** |

## Data Flow

```
TodayScreen (container: selectedDate state + all hooks)
  │
  ├─ useHabitsQuery(userId, date) → habits[] + logs[]
  ├─ useTasksQuery(userId, date)   → tasks[] + sub-tasks[]
  ├─ useToggleHabit(optimistic)    → insert/delete habit_log → recompute streak → invalidate
  ├─ useToggleTask(optimistic)     → flip is_completed → invalidate
  ├─ useCreateTask()               → insert + sub-tasks → invalidate
  └─ usePomodoroStore()            → time display (read-only)
       │
       ▼
  Presentational components (props in, callbacks out)
```

## File Changes

### New Files

| File | Description |
|------|-------------|
| `src/core/utils/date.ts` | `toDateString`, `todayString`, `getWeekDays`, `isSameDay` |
| `src/core/api/queryKeys.ts` | Standardized `qk` object (tasks, subtasks, habits, habitLogs) |
| `src/features/tasks/useTasksStore.ts` | Optimistic toggle: `Set<string>` of task ids in flight |
| `src/features/tasks/services/tasksService.ts` | `fetchTasksByDate`, `insertTask`, `updateTask`, `deleteTask`, `insertSubTask` |
| `src/features/tasks/hooks/useTasksQuery.ts` | `useQuery` for tasks + sub-tasks by date |
| `src/features/tasks/hooks/useCreateTask.ts` | `useMutation`: insert task + sub-tasks, invalidate tasks list |
| `src/features/tasks/hooks/useToggleTask.ts` | `useMutation`: optimistic flip `is_completed`, invalidation on error |
| `src/features/tasks/components/TasksSection.tsx` | Collapsible task list header |
| `src/features/tasks/components/TaskRow.tsx` | Single task with checkbox, priority badge, description |
| `src/features/tasks/components/SubTaskRow.tsx` | Nested sub-task with checkbox |
| `src/features/tasks/components/CreateTaskSheet.tsx` | `BottomSheetModal` with react-hook-form + zod; frequency selector (Daily/Weekly/Specific/Custom days) |
| `src/features/habits/services/habitsService.ts` | `fetchActiveHabits`, `fetchLogsForDate`, `insertLog`, `deleteLog`, `recomputeStreak` |
| `src/features/habits/hooks/useHabitsQuery.ts` | `useQuery`: active habits + merged completion flag for date |
| `src/features/habits/hooks/useToggleHabit.ts` | `useMutation`: insert/delete log + recompute streak |
| `src/features/habits/components/HabitsSection.tsx` | Scrollable habit chips row |
| `src/features/habits/components/HabitChip.tsx` | Single habit chip with check state + color |
| `src/features/schedule/mockSchedule.ts` | `ScheduleEvent` interface + `getMockSchedule()` |

### Modified Files

| File | Action | Description |
|------|--------|-------------|
| `app/_layout.tsx` | Wrap tree | Add `GestureHandlerRootView` + `BottomSheetModalProvider`; configure QueryClient defaults (staleTime: 30000, retry: 1) |
| `app/(tabs)/_layout.tsx` | Style tabs | `tabBarIcon` (Ionicons `today`/`repeat`/`timer`/`settings`), tint colors from tokens, safe-area style |
| `app/(tabs)/today.tsx` | Replace | Full `TodayScreen` container: `selectedDate` state, all Query hooks, component tree |
| `src/features/habits/useHabitsStore.ts` | Reconcile | Replace `Habit` interface with `Database['public']['Tables']['habits']['Row']`; drop `habits[]` list → keep only `pendingToggles: Set<string>` |

### DB Migration

```sql
-- apply_migration: add_tasks_parent_id
ALTER TABLE public.tasks ADD COLUMN parent_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE;
CREATE INDEX idx_tasks_parent_id ON public.tasks(parent_id);

-- apply_migration: add_tasks_frequency
CREATE TYPE task_frequency AS ENUM ('once', 'daily', 'weekly', 'custom');
ALTER TABLE public.tasks ADD COLUMN frequency task_frequency NOT NULL DEFAULT 'once';
ALTER TABLE public.tasks ADD COLUMN custom_days smallint[] DEFAULT '{}';
-- custom_days stores day numbers 1-7 (1=Mon, 7=Sun) when frequency = 'custom'
```

After migration: run `generate_typescript_types` → overwrite `src/shared/types/database.types.ts`.

## Component Contracts

```ts
// Presentational — no hooks, no Supabase imports
interface WeekStripProps { selectedDate: string; onSelectDate: (date: string) => void; }
interface HabitsSectionProps { habits: HabitWithCompletion[]; onToggle: (habitId: string) => void; }
interface HabitChipProps { habit: HabitWithCompletion; onToggle: () => void; }
interface TasksSectionProps { tasks: TaskWithSubTasks[]; onToggleTask: (id: string) => void; onAddSubtask: (parentId: string) => void; }
interface TaskRowProps { task: TaskWithSubTasks; onToggle: () => void; onAddSubtask: () => void; }
interface SubTaskRowProps { subtask: Task; onToggle: () => void; }
interface CreateTaskSheetProps {
  sheetRef: React.RefObject<BottomSheetModal>;
  defaultDate: string;
  onSubmit: (data: CreateTaskInput) => void;
}

interface CreateTaskInput {
  title: string;
  due_date: string;
  frequency: 'once' | 'daily' | 'weekly' | 'custom';
  custom_days?: number[]; // 1-7, only when frequency = 'custom'
  subtasks: { title: string }[];
}

interface PomodoroPillProps { time: string; onPress: () => void; }

// Derived types (from DB Row + query augmentation)
type HabitWithCompletion = Database['public']['Tables']['habits']['Row'] & { completed: boolean };
type TaskWithSubTasks = Database['public']['Tables']['tasks']['Row'] & { subtasks: Database['public']['Tables']['tasks']['Row'][] };
```

## Streak Algorithm (pseudocode)

```
function recomputeStreak(habitId, frequency):
  logs = SELECT completed_date FROM habit_logs WHERE habit_id = habitId ORDER BY completed_date DESC
  if logs is empty: return 0
  streak = 0
  current = todayString()
  for each log in logs (by descending completed_date):
    if frequency == "daily" and log.completed_date == current:
      streak += 1; current = yesterday(current)
    elif frequency == "weekly" and isWithinCurrentWeek(log.completed_date):
      streak = getWeeksBack(log.completed_date)
      break
    else: break
  UPDATE habits SET current_streak = streak WHERE id = habitId
```

Idempotent: UNIQUE(habit_id, completed_date) prevents duplicate logs.

## State Management

| What | Where | Why |
|------|-------|-----|
| Habit list + completion | TanStack Query `useQuery` | Server truth; cache per userId |
| Task list + sub-tasks | TanStack Query `useQuery` | Server truth; cache per userId+date |
| Optimistic toggle flag | Zustand `useTasksStore` / `useHabitsStore` | Prevents UI flicker during mutation |
| selectedDate | Component state (`useState` in TodayScreen) | Local UI concern; not persisted |
| Pomodoro time | Zustand `usePomodoroStore` | Already exists; read-only in Today View |
| Theme / settings | Zustand `useSettingsStore` | Already exists |

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | `date.ts` utilities | Pure functions; snapshot test week generation |
| Unit | `mockSchedule.ts` | Deterministic output per date |
| Unit | Presentational components | Jest + `@testing-library/react`; render with mock props |
| Integration | Query hooks | Mock `supabase.from()` chain; test data transforms and invalidation |
| Integration | `CreateTaskSheet` | `@testing-library/react` + react-hook-form validation |

TDD: write failing test → implement → refactor. Use `npm test` (`jest --watch`).

## Open Questions

- Dark theme tab bar tint: when dark theme is implemented, read resolved color from ThemeProvider context instead of hardcoded hex. Current stub (`darkTheme = lightTheme`) is adequate for now.
- `@gorhom/bottom-sheet` and `react-native-reanimated` are listed in `package.json` but may need `npx expo install` verification. Verify on first test run.
