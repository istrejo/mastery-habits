# Today View — Specification

## Purpose

Day-centric dashboard for habits, tasks, schedule, and navigation. Establishes Query ↔ Supabase conventions.

## ADDED Requirements

### R1: Week-Day Strip

MUST render Mon–Fri strip; today selected by default. Tapping a day refetches all sections.

| # | GIVEN | WHEN | THEN |
|---|-------|------|------|
| 1 | Screen mounts | No interaction | Today selected; data loads for today |
| 2 | Day selected | Tap another day | All sections refetch for new date |

### R2: Schedule Section (Mock)

MUST render mock events (icon, title, time, subtitle). Collapsible. Placeholder pending Google Calendar.

| # | GIVEN | WHEN | THEN |
|---|-------|------|------|
| 1 | Mock events exist | Section renders | Events show icon, title, time, subtitle |
| 2 | Section expanded | Chevron tapped | Event list hides; header remains |

### R3: Habits Section

MUST list active habits as chips with completion state. Optimistic toggle with rollback. Insert/delete `habit_log` + recompute streak.

| # | GIVEN | WHEN | THEN |
|---|-------|------|------|
| 1 | Habit has log for date | Rendered | Chip checked |
| 2 | Chip unchecked | Tapped | Log inserted, streak recomputed, chip updates |
| 3 | Chip checked | Tapped | Log deleted, streak recomputed, chip updates |
| 4 | Mutation fails | Server error | Chip reverts to previous state |

### R4: Tasks Section

MUST list top-level tasks (`parent_id IS NULL`, `due_date = selectedDate`) by priority then creation. Optimistic toggle.

| # | GIVEN | WHEN | THEN |
|---|-------|------|------|
| 1 | `priority = 'high'` | Rendered | `High Priority` badge shows |
| 2 | Task has description | Rendered | Description below title |
| 3 | Checkbox tapped | Toggled | `is_completed` flips; `completed_at` set/cleared |

### R5: Sub-Tasks

Tasks MAY have sub-tasks (`parent_id = task.id`). Parent delete cascades via `ON DELETE CASCADE`.

| # | GIVEN | WHEN | THEN |
|---|-------|------|------|
| 1 | Task has sub-tasks | Expanded | Sub-task rows with checkboxes |
| 2 | `+ Add sub-task` tapped | Title confirmed | Sub-task created with parent `due_date` |
| 3 | Parent deleted | Delete commits | Sub-tasks removed via cascade |

### R6: Create Task Sheet

Opens via `@gorhom/bottom-sheet`. Fields: title (required), due_date (default selected day), frequency selector, optional sub-tasks. Zod + react-hook-form; Save disabled until valid.

**Frequency options:**
- **Daily** — repeats every day
- **Weekly** — repeats every week on the same day
- **Specific day** — one-time task on the selected due_date (no recurrence)
- **Custom days** — repeats on user-selected days of the week (e.g., Mon, Wed, Fri); multi-select chip group

| # | GIVEN | WHEN | THEN |
|---|-------|------|------|
| 1 | Valid input (title + date + frequency) | Save tapped | Task + sub-tasks inserted; sheet closes; list refetches |
| 2 | Insert fails | Save tapped | Error surfaced; sheet stays open |
| 3 | "Custom days" selected | User taps day chips | Selected days highlighted; Save respects selection |
| 4 | "Specific day" selected | Sheet renders | due_date field is the selected day; no recurrence |

### R7: Floating Pomodoro Pill

Displays pomodoro time from `usePomodoroStore` (default `25:00`). Tap navigates to Pomodoro tab.

| # | GIVEN | WHEN | THEN |
|---|-------|------|------|
| 1 | Pill visible | Tapped | Navigates to Pomodoro tab |

### R8: Theming and Accessibility

MUST use NativeWind semantic tokens — no hardcoded hex. Interactive elements MUST have `accessibilityRole`/`accessibilityLabel`. Checkboxes expose checked state. Respect safe-area.

| # | GIVEN | WHEN | THEN |
|---|-------|------|------|
| 1 | Component renders | Inspected | No hardcoded hex; semantic tokens only |
| 2 | Checkbox renders | Screen reader | Exposes role, label, checked state |

### R9: Bottom Tab Bar

Styled tab bar: icon + label per tab (Today, Habits, Pomodoro, Settings). Active tab visually distinct. Semantic tokens, bottom safe-area, `accessibilityLabel` + selected state.

| # | GIVEN | WHEN | THEN |
|---|-------|------|------|
| 1 | On Today tab | Bar renders | Today active; others muted |
| 2 | Tab tapped | Pressed | Route switches; active state moves |

## Out of Scope

- Google Calendar (Schedule stays mock)
- Priority selector on tasks (deferred)
- Pomodoro session history
- Habit creation / editing UI
- MMKV storage swap
