# AGENTS.md

This file provides guidance to AI coding agents (Codex, Cursor, etc.) when working with code in this repository.

## Stack

| Layer | Tech |
|-------|------|
| Routing | Expo Router v6 (file-based) |
| UI | React Native + NativeWind v4 (Tailwind) |
| State | Zustand v5 |
| Backend | Supabase (PostgreSQL + RLS + RPCs) |
| Forms | react-hook-form + zod |
| i18n | i18next (ES / EN) |
| Tests | Jest + ts-jest (node env) |

---

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

# Supabase (requires Docker)
npx supabase start       # start local DB
npx supabase db reset    # apply all migrations from scratch

# Regenerate TypeScript types from local DB
npx supabase gen types typescript --local > src/shared/types/database.types.ts
# Note: command mixes stderr (version warnings) with stdout — pipe only stdout
```

---

## Data Flow

```
app/ (screens)
    │
    ▼
Hooks  ──────────────────┐
    │                    │
    ▼                    ▼
Services            Zustand Stores
    │                    │
    ▼                    ▼
supabase.ts ────► Supabase DB (RLS)
                       │
                  RPC Functions
```

---

## Architecture

**Screaming Architecture** — folders named after domain, not tech layer.

```
mastery-habits/
├── app/                          Expo Router file-based routes
│   ├── _layout.tsx               Root layout — auth gate, ThemeProvider, LocaleProvider
│   ├── index.tsx                 Splash redirect (auth → tabs, no-auth → login)
│   ├── settings.tsx              Settings screen: theme picker, language selector, logout
│   ├── (auth)/
│   │   ├── _layout.tsx           Auth group layout (no tab bar)
│   │   ├── login.tsx             Login screen (email + password)
│   │   └── signup.tsx            Signup screen (email + password + confirm)
│   ├── (tabs)/
│   │   ├── _layout.tsx           Tab bar layout — Habits + Profile tabs
│   │   ├── index.tsx             Dashboard: habit list, average score, empty state
│   │   └── profile.tsx           Profile: avatar initials, global score, level distribution
│   └── habit/
│       ├── new.tsx               Create new habit (HabitForm)
│       └── [id].tsx              Habit detail: check-in button, 30-day grid, LevelProgress, MasteryBadge
│
├── src/
│   ├── modules/                  Feature modules — Screaming Architecture
│   │   │
│   │   ├── core/                 Shared infrastructure — imported by all modules
│   │   │   ├── components/       Design system primitives
│   │   │   │   ├── Button.tsx        Primary/secondary/ghost variants
│   │   │   │   ├── Card.tsx          Surface container with theme-aware styling
│   │   │   │   ├── Input.tsx         Text input with label + error state
│   │   │   │   ├── Modal.tsx         Bottom sheet modal wrapper
│   │   │   │   ├── Screen.tsx        ScrollView wrapper with safe area
│   │   │   │   ├── Skeleton.tsx      Pulse-animated loading placeholder
│   │   │   │   ├── ProgressBar.tsx   Horizontal bar (0–100 range)
│   │   │   │   ├── ThemePicker.tsx   Grid of theme swatches
│   │   │   │   └── index.ts          Public barrel export
│   │   │   ├── theming/
│   │   │   │   ├── themes/           6 pre-built themes
│   │   │   │   │   ├── brutalistEditorial.theme.ts
│   │   │   │   │   ├── cyberpunk.theme.ts
│   │   │   │   │   ├── minimalLight.theme.ts
│   │   │   │   │   ├── organicGrowth.theme.ts
│   │   │   │   │   ├── techNeon.theme.ts
│   │   │   │   │   └── terminalPhosphor.theme.ts
│   │   │   │   ├── theme.store.ts    Zustand store — persists selected theme
│   │   │   │   ├── ThemeProvider.tsx  Injects theme into React context
│   │   │   │   ├── useTheme.ts       Hook to consume current theme
│   │   │   │   ├── types.ts          Theme shape type definitions
│   │   │   │   └── index.ts
│   │   │   ├── i18n/
│   │   │   │   ├── locales/
│   │   │   │   │   ├── en.ts         English translation strings
│   │   │   │   │   └── es.ts         Spanish translation strings
│   │   │   │   ├── i18n.ts           i18next init — language detection + resources
│   │   │   │   ├── i18next.d.ts      TypeScript augmentation for typed t()
│   │   │   │   ├── locale.store.ts   Zustand store — persists selected locale
│   │   │   │   ├── LocaleProvider.tsx  Syncs locale store → i18next on mount
│   │   │   │   ├── useDateLocale.ts  Hook returning date-fns locale for current lang
│   │   │   │   └── index.ts
│   │   │   ├── lib/
│   │   │   │   └── supabase.ts       Typed Supabase client (uses database.types.ts)
│   │   │   └── states/
│   │   │       └── session.store.ts  Zustand store — Supabase auth session + user
│   │   │
│   │   ├── auth/                 Authentication flows
│   │   │   ├── services/
│   │   │   │   └── auth.service.ts   signIn / signUp / signOut via Supabase Auth
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts        Wraps auth.service + updates session.store
│   │   │   └── index.ts
│   │   │
│   │   ├── habits/               Habit CRUD
│   │   │   ├── components/
│   │   │   │   ├── HabitCard.tsx       List item — name, frequency, current score
│   │   │   │   ├── HabitForm.tsx       Create / edit form (react-hook-form + zod)
│   │   │   │   └── FrequencySelector.tsx  Day-of-week multi-picker
│   │   │   ├── hooks/
│   │   │   │   ├── useHabits.ts        Fetch + subscribe to all habits for user
│   │   │   │   └── useHabit.ts         Fetch single habit by id
│   │   │   ├── services/
│   │   │   │   └── habits.service.ts   CRUD operations against Supabase habits table
│   │   │   ├── states/
│   │   │   │   └── habits.store.ts     Zustand store — habit list cache
│   │   │   └── index.ts
│   │   │
│   │   ├── check-in/             Daily habit tracking
│   │   │   ├── components/
│   │   │   │   └── CheckInButton.tsx   Done / Skip button with skip-confirm modal
│   │   │   ├── hooks/
│   │   │   │   └── useCheckIn.ts       Orchestrates check-in + skip + validation
│   │   │   ├── services/
│   │   │   │   └── checkin.service.ts  Calls RPC register_check_in, reads check_ins table
│   │   │   ├── utils/
│   │   │   │   ├── isPlannedDay.ts     Returns true if today is in habit's frequency array
│   │   │   │   └── hasUsedSkipThisWeek.ts  Checks if skip already used in current ISO week
│   │   │   └── index.ts
│   │   │
│   │   ├── commitment/           Commitment Score engine
│   │   │   ├── utils/
│   │   │   │   └── calculateScore.ts   Pure TS replica of register_check_in RPC formula
│   │   │   ├── services/
│   │   │   │   └── score.service.ts    Fetches latest score from mastery_scores table
│   │   │   ├── states/
│   │   │   │   └── score.store.ts      Zustand store — score cache per habit
│   │   │   ├── hooks/
│   │   │   │   └── useCommitmentScore.ts  Exposes score for a habit, triggers refresh
│   │   │   ├── __tests__/
│   │   │   │   └── calculateScore.test.ts  20 unit tests — formula edge cases
│   │   │   └── index.ts
│   │   │
│   │   └── progression/          Mastery level system
│   │       ├── utils/
│   │       │   ├── LEVELS.ts           Seed/Sprout/Tree/Forest/Ancient definitions
│   │       │   └── getLevel.ts         Pure fn: score → Level + progress %
│   │       ├── hooks/
│   │       │   └── useMasteryLevel.ts  Derives level from commitment score
│   │       ├── components/
│   │       │   ├── MasteryBadge.tsx    Icon + label for current level
│   │       │   └── LevelProgress.tsx   ProgressBar showing distance to next level
│   │       ├── __tests__/
│   │       │   └── getLevel.test.ts    18 unit tests — boundary conditions
│   │       └── index.ts
│   │
│   └── shared/                   Cross-module shared resources
│       ├── types/
│       │   └── database.types.ts   Auto-generated Supabase types (do not edit manually)
│       └── constants/
│
├── supabase/
│   ├── migrations/               SQL migration files (source of truth for DB schema)
│   └── config.toml               Supabase local dev config
│
├── stitch-specs/                 Stitch MCP design specs (active — used for UI generation)
│   └── dark-theme.md             Dark theme color/typography tokens for Stitch
│
├── app.json                      Expo app config (name, slug, scheme)
├── metro.config.js               Bundler config (NativeWind support)
├── tailwind.config.js            Tailwind config (NativeWind content paths)
├── tsconfig.json                 TypeScript strict mode + path aliases
└── jest.config.js                Jest config (ts-jest, node env, path aliases)
```

**Module isolation rule:** modules never import directly from each other — only from `core/` or `shared/`.

```
❌  habits/  →  check-in/     direct cross-module import
✅  habits/  →  core/          shared infrastructure only
✅  habits/  →  shared/types/  shared types only
```

Each module exposes its public API exclusively via its `index.ts` barrel.

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

---

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

---

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

---

## Testing

- Runner: Jest + ts-jest (strict mode)
- Environment: node (not jsdom — no React Native rendering)
- Coverage exists for `commitment/` and `progression/` modules only
- Tests use `@` aliases — configured in `jest.config.js`

---

## i18n

Two locales: `en` and `es`. Language detected from device on first launch, overridable via Settings screen. Selected locale persists via `locale.store.ts`. All user-facing strings accessed via `useTranslation()` hook — no hardcoded copy in screens or components.

---

## Database

See `cloud.md` for full schema, RPCs, and RLS details.

6 SQL migrations in `supabase/migrations/`:

- `0001` → tables: `profiles`, `habits`, `check_ins`, `mastery_scores`
- `0002` → RLS policies + auto-create profile on signup trigger
- `0003` → RPCs: `register_check_in`, `calculate_mastery_level`, `has_used_weekly_skip`
- `0004` → `habit_category` enum + `custom_label`/`custom_emoji` columns on `habits`
- `0005` → table `tasks` (`task_status` enum, `habit_id` FK ON DELETE SET NULL)
- `0006` → table `pomodoro_sessions` (`pomodoro_phase`/`outcome` enums, XOR `habit_id`/`task_id` FK)

RLS enforces row-level user isolation — no cross-user data access.

---

## Environment Variables

Required in `.env`:

- `EXPO_PUBLIC_SUPABASE_URL` — Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key

---

## Key Tech

- Expo SDK 54 + Expo Router v6 (typed routes, new architecture enabled)
- NativeWind v4 (Tailwind for React Native) — use `className`, not `StyleSheet`
- Zustand v5 — all stores in `states/*.store.ts`
- react-hook-form + zod — forms and validation
- date-fns — all date arithmetic
- `@supabase/supabase-js` v2 — client in `src/modules/core/lib/supabase.ts`
