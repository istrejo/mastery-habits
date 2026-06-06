# Mastery Habits — Cloud & Database Reference

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
| `habits` | `id`, `user_id` (FK), `name`, `frequency` (int[]), `category` (habit_category), `custom_label`, `custom_emoji`, `created_at` |
| `check_ins` | `id`, `habit_id` (FK), `user_id` (FK), `date`, `skipped` (bool) |
| `mastery_scores` | `id`, `habit_id` (FK), `user_id` (FK), `score` (numeric), `recorded_at` |
| `tasks` | `id`, `user_id` (FK), `habit_id` (FK, ON DELETE SET NULL), `title`, `status` (task_status), `created_at` |
| `pomodoro_sessions` | `id`, `user_id` (FK), `habit_id` OR `task_id` (XOR FK), `phase` (pomodoro_phase), `outcome`, `duration_seconds`, `created_at` |

### Custom Enum Types

| Type | Values |
|------|--------|
| `habit_category` | `health`, `mindfulness`, `learning`, `nutrition`, `energy`, `social`, `creativity`, `nature`, `custom` |
| `task_status` | `pending`, `in_progress`, `done`, `cancelled` |
| `pomodoro_phase` | `work`, `short_break`, `long_break` |

---

## Migrations

All migrations live in `supabase/migrations/`. Run `npx supabase db reset` to apply all from scratch.

| File | What it does |
|------|-------------|
| `0001_initial_schema.sql` | Tables: `profiles`, `habits`, `check_ins`, `mastery_scores` |
| `0002_rls_policies.sql` | RLS policies + auto-create `profiles` row on signup trigger |
| `0003_rpc_functions.sql` | RPCs: `register_check_in`, `calculate_mastery_level`, `has_used_weekly_skip` |
| `0004_habit_categories.sql` | `habit_category` enum + `custom_label`/`custom_emoji` columns on `habits` |
| `0005_tasks.sql` | Table `tasks` with `task_status` enum, `habit_id` FK ON DELETE SET NULL |
| `0006_pomodoro_sessions.sql` | Table `pomodoro_sessions` with `pomodoro_phase`/`outcome` enums, XOR `habit_id`/`task_id` FK |

---

## RPC Functions

| Function | Purpose |
|----------|---------|
| `register_check_in(habit_id, user_id, date, skipped)` | Records check-in, runs Commitment Score formula, writes to `mastery_scores` |
| `calculate_mastery_level(score)` → text | Returns level string (`seed`/`sprout`/`tree`/`forest`/`ancient`) for a numeric score |
| `has_used_weekly_skip(habit_id, user_id, week_start)` → bool | Returns true if a skip was already used in the current ISO week |

The Commitment Score formula inside `register_check_in`:

```
Score_today = (Score_yesterday × 0.8) + (Compliance × 20)
Compliance = 1  →  planned day completed OR weekly skip used
Compliance = 0  →  planned day missed
Non-planned day →  score unchanged
Range: 0 – 100
```

TypeScript replica at `src/modules/commitment/utils/calculateScore.ts` (used in unit tests).

---

## Row-Level Security

All tables enforce RLS. Pattern: every policy checks `user_id = auth.uid()`.

- `profiles` — users read/write their own row only
- `habits`, `check_ins`, `mastery_scores`, `tasks`, `pomodoro_sessions` — all scoped to `user_id`
- `profiles` row auto-created on signup via trigger defined in migration `0002`

No cross-user data access is possible at the DB level.

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
