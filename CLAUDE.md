# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start           # Expo dev server
npm run ios         # iOS simulator
npm run android     # Android emulator
npm run web         # Web browser
```

No test runner or lint config exists yet.

## Directory Structure

```
app/                          # Expo Router — presentation only, no business logic
  _layout.tsx                 # Root layout + AuthGuard
  index.tsx                   # Entry redirect
  (auth)/                     # Unauthenticated routes
    _layout.tsx
    login.tsx
    signup.tsx
    confirm.tsx
  (tabs)/                     # Main tab navigator
    _layout.tsx
    today.tsx
    habits.tsx
    pomodoro.tsx
    settings.tsx
  (dev)/
    ui-kit.tsx                # Component showcase (dev only)

src/
  core/
    api/supabase.ts           # Supabase client singleton
    constants/env.ts          # EXPO_PUBLIC_* env vars
    storage/mmkvAdapter.ts    # AsyncStorage wrapper (MMKV pending)
  features/
    auth/
      AuthProvider.tsx        # Session listener, bootstraps auth store
      useAuthStore.ts         # Zustand store: session, user, sign in/out
      components/             # (empty — not yet implemented)
      services/               # (empty — not yet implemented)
    habits/
      useHabitsStore.ts       # Zustand store: habit list, streak logic
      components/             # (empty — not yet implemented)
      services/               # (empty — not yet implemented)
    pomodoro/
      usePomodoroStore.ts     # Zustand store: timer state (ephemeral)
      components/             # (empty — not yet implemented)
      services/               # (empty — not yet implemented)
    settings/
      useSettingsStore.ts     # Zustand store: theme, pomodoro config
      components/             # (empty — not yet implemented)
      services/               # (empty — not yet implemented)
  shared/
    types/
      database.types.ts       # Auto-generated Supabase types (do not hand-edit)
    ui/
      Button.tsx
      Card.tsx
      Checkbox.tsx
      (no barrel — import directly from each file)
```

## Architecture

**Presentation layer** lives entirely in `app/` (Expo Router file-based routing). No business logic belongs here — only route files, layouts, and navigation guards.

**Feature modules** live in `src/features/{auth,habits,pomodoro,settings}/`. Each feature owns its Zustand store; `components/` and `services/` subdirectories are scaffolded but not yet implemented. Nothing crosses feature boundaries via direct import — shared primitives go in `src/shared/`.

**Auth guard** is in `app/_layout.tsx` as an `AuthGuard` component that watches the Zustand auth store and calls `router.replace()`. All auth state flows through `src/features/auth/useAuthStore`.

**State split**: Zustand + `persist` middleware handles local/optimistic state (stored via `mmkvAdapter`). TanStack Query handles server sync and cache invalidation. Never put server-fetched data only in Zustand — let Query own the truth, Zustand owns optimistic updates.

**Pomodoro timer is 100% local/ephemeral** — only config (durations) syncs to the `profiles` Supabase table. No session history is persisted to the DB.

**Shared UI** lives in `src/shared/ui/`. Import directly from each file (`src/shared/ui/Button`, `src/shared/ui/Card`, etc.) — there is no barrel. Do not add feature-specific logic to shared components.

## Data Layer

Supabase PostgreSQL (project ref `nvpkgrqfzrcwgigztymp`) with RLS on all 4 tables. Types are auto-generated into `src/shared/types/database.types.ts` — consume as `Database['public']['Tables']['habits']['Row']`, never hand-write entity types.

Tables: `profiles`, `habits`, `habit_logs`, `tasks`. All have `updated_at` + trigger `set_updated_at()` for last-write-wins sync. Enums in DB: `priority_level` (low/medium/high), `habit_frequency` (daily/weekly), `theme_preference` (light/dark/system).

`habit_logs.completed_date` uses `DATE` (not timestamp) to avoid timezone mismatches. The `(habit_id, completed_date)` pair has a unique constraint — marking a habit twice on the same day is an insert conflict, not an update.

Streak logic (`current_streak` on `habits`) is computed and written from the frontend after a successful log insert — there is no DB trigger for it.

FK indexes exist on all `user_id` columns and `tasks(user_id, due_date)` for the Today View filter. No index on `habit_logs(habit_id)` — covered by the UNIQUE leftmost prefix.

## Known Issues / Gotchas

- **`tsconfig.json` path aliases are broken**: They map `@core/*` → `src/modules/core/*` but the actual directory is `src/core/*`. All current imports use relative paths to work around this. Fix before adding new aliases.
- **MMKV is stubbed**: `src/core/storage/mmkvAdapter.ts` wraps AsyncStorage. The swap to MMKV is blocked pending Expo dev client / EAS Build setup. Do not assume synchronous storage access.
- **Feature `components/` and `services/` dirs are empty** — scaffolded with `.gitkeep`. Implementation not started; stores are the only feature-level code that exists.
