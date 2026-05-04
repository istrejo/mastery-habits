# Mastery Habits — Architecture

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

## Directory Structure

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
│   │   │   │   ├── LanguagePicker.tsx  Inline language toggle
│   │   │   │   ├── LanguageSelector.tsx  Full language selector UI
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
│   │   │   │   ├── types.ts          Locale type definitions
│   │   │   │   └── index.ts
│   │   │   ├── lib/
│   │   │   │   └── supabase.ts       Typed Supabase client (uses database.types.ts)
│   │   │   ├── states/
│   │   │   │   └── session.store.ts  Zustand store — Supabase auth session + user
│   │   │   └── utils/                (empty — reserved)
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
│   │   │   ├── types/
│   │   │   │   └── index.ts            Habit domain types (extends database.types.ts)
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
│   │       ├── types/
│   │       │   └── index.ts            Level type definitions
│   │       ├── __tests__/
│   │       │   └── getLevel.test.ts    18 unit tests — boundary conditions
│   │       └── index.ts
│   │
│   └── shared/                   Cross-module shared resources
│       ├── types/
│       │   └── database.types.ts   Auto-generated Supabase types (do not edit manually)
│       └── constants/              (empty — reserved)
│
├── supabase/
│   ├── migrations/
│   │   ├── 0001_initial_schema.sql   Tables: profiles, habits, check_ins, mastery_scores
│   │   ├── 0002_rls_policies.sql     RLS: row-level user isolation + auto-create profile trigger
│   │   └── 0003_rpc_functions.sql    RPCs: register_check_in, calculate_mastery_level, has_used_weekly_skip
│   └── config.toml                   Supabase local dev config
│
├── assets/                       App icons and splash images
├── app.json                      Expo app config (name, slug, scheme)
├── index.ts                      Entry point (registers root component)
├── metro.config.js               Bundler config (NativeWind support)
├── tailwind.config.js            Tailwind config (NativeWind content paths)
├── global.css                    Global Tailwind directives
├── tsconfig.json                 TypeScript strict mode + path aliases
├── jest.config.js                Jest config (ts-jest, node env, path aliases)
├── package.json                  Dependencies and scripts
└── .env                          SUPABASE_URL + SUPABASE_ANON_KEY
```

---

## Module Isolation Rule

```
❌  habits/  →  check-in/     direct cross-module import
✅  habits/  →  core/          shared infrastructure only
✅  habits/  →  shared/types/  shared types only
```

Every module exposes its public API exclusively via its `index.ts` barrel.

---

## Path Aliases (tsconfig + jest)

| Alias | Resolves to |
|-------|-------------|
| `@core/*` | `src/modules/core/*` |
| `@auth/*` | `src/modules/auth/*` |
| `@habits/*` | `src/modules/habits/*` |
| `@checkin/*` | `src/modules/check-in/*` |
| `@commitment/*` | `src/modules/commitment/*` |
| `@progression/*` | `src/modules/progression/*` |
| `@shared/*` | `src/shared/*` |

---

## Database Schema

```
profiles          id (uuid FK auth.users), display_name, created_at
habits            id, user_id (FK), name, frequency (int[]), created_at
check_ins         id, habit_id (FK), user_id (FK), date, skipped (bool)
mastery_scores    id, habit_id (FK), user_id (FK), score (numeric), recorded_at
```

### RPC Functions

| Function | Purpose |
|----------|---------|
| `register_check_in` | Records check-in, runs scoring formula, writes to mastery_scores |
| `calculate_mastery_level` | Returns current level string for a given score |
| `has_used_weekly_skip` | Returns true if a skip was used in the current ISO week |

---

## Commitment Score Formula

```
Score_today = (Score_yesterday × 0.8) + (Compliance × 20)

Compliance = 1  →  planned day completed, OR weekly skip used
Compliance = 0  →  planned day missed
Non-planned day →  score unchanged
Range: 0 – 100
```

Runs in two places: RPC `register_check_in` (production) + `calculateScore.ts` (TS replica for unit tests).

---

## Mastery Levels

| Level | Score Range |
|-------|-------------|
| Seed | 0 – 20 |
| Sprout | 21 – 45 |
| Tree | 46 – 70 |
| Forest | 71 – 90 |
| Ancient | 91 – 100 |

---

## Theming

6 pre-built themes. Each theme defines semantic color tokens (background, surface, primary, text, border, etc.) consumed via `useTheme()`. No hardcoded hex values in components — all colors come from the theme object.

Selected theme persists via `theme.store.ts` (Zustand + AsyncStorage).

---

## i18n

Two locales: `en` and `es`. Language detected from device on first launch, overridable via Settings screen. Selected locale persists via `locale.store.ts`. All user-facing strings accessed via `useTranslation()` hook — no hardcoded copy in screens or components.
