# Mastery Habits — Cloud & Database Reference

> **⚠️ Divergence notice.** The schema described here is what the **local** repo declares. The deployed Supabase project has additional tables (`habit_subtask_templates`, `session_logs`, `session_items`, `milestone_celebrations`) and is **missing** `pomodoro_sessions`. See `AGENTS.md → Local vs remote schema` for the full picture.

## Supabase Project

- **Client:** `src/modules/core/lib/supabase.ts` (typed against `database.types.ts`)
- **Types file:** `src/shared/types/database.types.ts` — auto-generated, do not edit manually

**Environment variables** (required in `.env`):

| Variable | Value |
|----------|-------|
| `EXPO_PUBLIC_SUPABASE_URL` | Project URL (local: `http://localhost:54321`) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Anon/public key |

---

## Database Schema

### Tables

| Table | Key Columns |
|-------|-------------|
| `profiles` | `id` (uuid FK → `auth.users`), `display_name`, `created_at` |
| `habits` | `id`, `user_id` (FK), `name`, `frequency_days` (int[]), `category` (habit_category), `custom_label`, `custom_emoji`, `created_at` |
| `check_ins` | `id`, `habit_id` (FK), `user_id` (FK), `check_date`, `status` (checkin_status) |
| `mastery_scores` | `habit_id` (PK, FK), `user_id` (FK), `score` (numeric), `level`, `last_calculated_date`, `updated_at` |
| `tasks` | `id`, `user_id` (FK), `habit_id` (FK, ON DELETE SET NULL), `title`, `description`, `due_date`, `status` (task_status), `completed_at`, `created_at` |
| `task_subtasks` | `id`, `task_id` (FK), `user_id` (FK), `title`, `status` (task_status), `completed_at`, `order_index`, `created_at` |
| `pomodoro_sessions` | `id`, `user_id` (FK), `habit_id` OR `task_id` (XOR FK), `phase` (pomodoro_phase), `outcome` (pomodoro_outcome), `planned_duration_seconds`, `actual_duration_seconds`, `cycle_index`, `started_at`, `ended_at` |

### Custom Enum Types

| Type | Values |
|------|--------|
| `checkin_status` | `completed`, `skipped`, `missed` |
| `habit_category` | `health`, `mind`, `learning`, `productivity`, `nutrition`, `creativity`, `social`, `finance`, `custom` |
| `task_status` | `pending`, `completed` |
| `pomodoro_phase` | `work`, `short_break`, `long_break` |
| `pomodoro_outcome` | `completed`, `cancelled` |

---

## Migrations

All migrations live in `supabase/migrations/`.

| File | What it does |
|------|-------------|
| `0001_initial_schema.sql` | Tables: `profiles`, `habits`, `check_ins`, `mastery_scores` |
| `0002_rls_policies.sql` | RLS policies + auto-create `profiles` row on signup trigger |
| `0003_rpc_functions.sql` | RPCs: `register_check_in`, `calculate_mastery_level`, `has_used_weekly_skip` |
| `0004_habit_categories.sql` | `habit_category` enum + `custom_label`/`custom_emoji` columns on `habits` |
| `0008_tasks.sql` | Table `tasks` with `task_status` enum, `habit_id` FK ON DELETE SET NULL |
| `0009_pomodoro_sessions.sql` | Table `pomodoro_sessions` with `pomodoro_phase`/`outcome` enums, XOR `habit_id`/`task_id` FK |
| `0010_task_subtasks.sql` | Table `task_subtasks` linked to `tasks`, with `order_index` ordering |
| `0011_prevent_checkin_gaming.sql` | `register_check_in`: blocks `missed → completed/skipped` transitions (anti-gaming) |
| `0012_correct_backfill_score.sql` | `register_check_in`: looks up prev score from the most recent check-in **before** the target date |
| `0013_block_old_checkins.sql` | `register_check_in`: rejects check-ins older than 7 days or in the future |

> **Note:** migrations `0005`, `0006`, `0007` (about `session_logs`/`milestones`/`session_log_rpc`) exist in the deployed Supabase project but are **not** in this repo. Migration `0008` and beyond skip those numbers because the deployed project already had them under different names. The numbering is intentional, not an oversight.

---

## RPC Functions

| Function | Purpose |
|----------|---------|
| `register_check_in(p_habit_id uuid, p_check_date date, p_status checkin_status)` | Records check-in, runs Commitment Score formula, writes to `mastery_scores`. Validates window (7 days) and blocks `missed → completed` upgrades. |
| `calculate_mastery_level(p_score numeric)` → text | Returns level string (`seed`/`sprout`/`tree`/`forest`/`ancient`) for a numeric score |
| `has_used_weekly_skip(p_habit_id uuid, p_date date)` → bool | Returns true if a skip was already used in the current ISO week for the given habit |

The Commitment Score formula inside `register_check_in`:

```
Score_today = (Score_yesterday × 0.8) + (Compliance × 20)
Compliance = 1  →  planned day completed OR weekly skip used
Compliance = 0  →  planned day missed
Non-planned day →  score unchanged
Range: 0 – 100
```

`Score_yesterday` is the score persisted with the most recent `check_date` strictly before the target date. If no prior check-in exists, it defaults to 0.

TypeScript replica at `src/modules/commitment/utils/calculateScore.ts` (used in unit tests). The `pickPrevScore` helper mirrors the new SQL backfill lookup.

### SQL error codes (raised by `register_check_in`)

The app maps these to localized messages in `useCheckIn` via `CheckInError`:

- `unauthenticated` — no active session
- `habit_not_found` — habit does not exist or is archived
- `weekly_skip_already_used` — already used a skip this ISO week
- `cannot_recover_missed_day` — attempt to re-mark a `missed` day as `completed`/`skipped` (anti-gaming)
- `checkin_too_old` — `p_check_date` is more than 7 days in the past
- `checkin_in_future` — `p_check_date` is after `current_date`

---

## Row-Level Security

All tables enforce RLS. Pattern: every policy checks `user_id = auth.uid()`.

- `profiles` — users read/write their own row only
- `habits`, `check_ins`, `mastery_scores`, `tasks`, `task_subtasks`, `pomodoro_sessions` — all scoped to `user_id`
- `profiles` row auto-created on signup via trigger defined in migration `0002`

No cross-user data access is possible at the DB level.

---

## Email Authentication

`config.toml` has `enable_confirmations = true` for local. **The same must be set in the Supabase dashboard for production** (this is per-project, not per-config-file).

The app handles the `email_not_confirmed` error gracefully:
- Login screen shows a localized message and a "Resend verification email" button
- Signup screen shows a "Check your inbox" success message after account creation

---

## Local Development

Requires Docker.

```bash
npx supabase start       # start local Supabase stack (postgres + auth + studio)
npx supabase db reset    # apply all migrations from scratch
npx supabase stop        # stop local stack

# Regenerate TypeScript types after schema changes
npx supabase gen types typescript --local > src/shared/types/database.types.ts
```

After regenerating types, commit `database.types.ts` to keep it in sync with the schema.

> **Divergence caveat:** until the local ↔ remote schema is reconciled, do NOT regenerate `database.types.ts` against the remote. The current file is the **local code's** view of the schema (includes `pomodoro_sessions` and the corresponding enums). Regenerating from the remote would drop those types and break the `pomodoro/` module at build time.
