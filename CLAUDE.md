# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install (always use --legacy-peer-deps — react-dom/react version conflict)
npm install --legacy-peer-deps

# Dev
npx expo start           # starts Expo dev server
npx expo start --ios     # iOS simulator
npx expo start --android # Android emulator

# Tests
npm test                          # all tests
npm test -- --testPathPattern=commitment  # single module

# Regenerate TypeScript types from Supabase
npx supabase gen types typescript --project-id <project-id> > src/shared/types/database.types.ts
# Note: command mixes stderr (version warnings) with stdout — pipe only stdout
```

## Architecture

**Screaming Architecture** — folders named after domain, not tech layer.

```
src/modules/
├── core/        → Design System, Supabase client, session store, theming
├── auth/        → Login, signup
├── habits/      → Habit CRUD
├── check-in/    → Mark day done/skip, weekly grace period
├── commitment/  → Commitment Score engine
└── progression/ → Mastery levels (Seed → Ancient)

src/shared/
├── constants/
└── types/       → database.types.ts (auto-generated, commit after changes)
```

**Module isolation rule:** modules never import directly from each other — only from `core/` or `shared/`. Each module's public API lives in its `index.ts` barrel.

**Consistent module pattern:**
```
<module>/
├── index.ts        ← public API (barrel)
├── components/
├── hooks/
├── services/       ← business logic (*.service.ts)
├── states/         ← Zustand stores (*.store.ts)
├── utils/
├── types/          ← local types (optional)
└── __tests__/
```

**Screens** live in `app/` (Expo Router file-based routing):
```
app/
├── _layout.tsx          ← root layout + auth gate
├── (auth)/login.tsx
├── (auth)/signup.tsx
├── (tabs)/index.tsx     ← dashboard
├── (tabs)/profile.tsx
├── habit/new.tsx
└── habit/[id].tsx       ← detail + check-in + 30-day history grid
```

## Path Aliases (tsconfig + jest.config)

| Alias | Maps to |
|-------|---------|
| `@core/*` | `src/modules/core/*` |
| `@auth/*` | `src/modules/auth/*` |
| `@habits/*` | `src/modules/habits/*` |
| `@checkin/*` | `src/modules/check-in/*` |
| `@commitment/*` | `src/modules/commitment/*` |
| `@progression/*` | `src/modules/progression/*` |
| `@shared/*` | `src/shared/*` |

## Core Business Logic

**Commitment Score formula:**
```
Score_today = (Score_yesterday × 0.8) + (Compliance × 20)
```
- `Compliance = 1` → planned day completed (or weekly skip used)
- `Compliance = 0` → planned day missed
- Non-planned day → score unchanged
- Range: 0–100

Score runs in two places: Supabase RPC `register_check_in` (production) and `src/modules/commitment/utils/calculateScore.ts` (TypeScript replica for tests).

**Mastery levels:** Seed (0–20), Sprout (21–45), Tree (46–70), Forest (71–90), Ancient (91–100).

**Grace period:** 1 skip per ISO week per habit. Skip counts as `Compliance = 1`.

## Testing

- Runner: Jest + ts-jest (strict mode)
- Environment: node (not jsdom — no React Native rendering)
- Coverage exists for `commitment/` and `progression/` modules only
- Tests use `@` aliases — configured in `jest.config.js`

## Database

5 SQL migrations in `supabase/migrations/`:
- `0001` → tables: `profiles`, `habits`, `check_ins`, `mastery_scores`
- `0002` → RLS policies + auto-create profile on signup trigger
- `0003` → RPCs: `register_check_in`, `calculate_mastery_level`, `has_used_weekly_skip`
- `0004` → habit_category enum + custom_label/custom_emoji columns
- `0005` → table `tasks` (task_status enum, habit_id FK on delete set null)
- `0006` → table `pomodoro_sessions` (pomodoro_phase/outcome enums, XOR habit_id/task_id)

RLS enforces row-level user isolation — no cross-user data access.

## Key Tech

- Expo SDK 54 + Expo Router v6 (typed routes, new architecture enabled)
- NativeWind v4 (Tailwind for React Native) — use className, not StyleSheet
- Zustand v5 — all stores in `states/*.store.ts`
- react-hook-form + zod — forms and validation
- date-fns — all date arithmetic
- `@supabase/supabase-js` v2 — client in `src/modules/core/lib/supabase.ts`
