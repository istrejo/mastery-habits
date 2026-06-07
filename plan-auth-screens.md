# Plan: Auth Screens + Token-Based Theme System

## Context

Auth screens (Login, Sign Up, Verify Email, Forgot Password) are empty stubs with no forms, no Supabase calls, and no validation. The shared UI (`Button`, `Checkbox`) reference `primary-500` which is not defined in `tailwind.config.js` — a live styling bug. No theme token system exists. The user also wants support for a second theme, which requires a proper token layer before building screens.

## Critical Pre-Existing Gap

`primary-500` used in `src/shared/ui/Button.tsx` and `Checkbox.tsx` but NOT defined in `tailwind.config.js`. Phase 1 fixes this.

---

## Phase 1 — Token-Based Theme System

**Goal**: NativeWind v4 CSS-variable token system, two themes (light + dark).

### 1.1 — `tailwind.config.js`

Add semantic color tokens referencing CSS variables:

```js
colors: {
  brand: {
    DEFAULT: 'var(--color-brand)',
    light:   'var(--color-brand-light)',
    dark:    'var(--color-brand-dark)',
  },
  surface: {
    DEFAULT: 'var(--color-surface)',
    raised:  'var(--color-surface-raised)',
  },
  content: {
    primary:   'var(--color-content-primary)',
    secondary: 'var(--color-content-secondary)',
    inverse:   'var(--color-content-inverse)',
  },
  border: {
    DEFAULT: 'var(--color-border)',
    focus:   'var(--color-border-focus)',
  },
  danger: { DEFAULT: 'var(--color-danger)' },
},
```

Fix `primary-500` → `brand` in `Button.tsx` + `Checkbox.tsx`.

### 1.2 — `src/core/theme/tokens.ts` (new)

```ts
export const lightTheme = {
  '--color-brand':            '#6C5CE7',
  '--color-brand-light':      '#A29BFE',
  '--color-brand-dark':       '#4834D4',
  '--color-surface':          '#FFFFFF',
  '--color-surface-raised':   '#F7F6FE',
  '--color-content-primary':  '#1A1A2E',
  '--color-content-secondary':'#6B6B8A',
  '--color-content-inverse':  '#FFFFFF',
  '--color-border':           '#E5E4F0',
  '--color-border-focus':     '#6C5CE7',
  '--color-danger':           '#E17055',
};

export const darkTheme = {
  '--color-brand':            '#A29BFE',
  '--color-brand-light':      '#C7C2FF',
  '--color-brand-dark':       '#6C5CE7',
  '--color-surface':          '#13111C',
  '--color-surface-raised':   '#1E1B2E',
  '--color-content-primary':  '#F0EFFE',
  '--color-content-secondary':'#9B99B8',
  '--color-content-inverse':  '#13111C',
  '--color-border':           '#2D2A42',
  '--color-border-focus':     '#A29BFE',
  '--color-danger':           '#FF7675',
};
```

### 1.3 — `src/core/theme/ThemeProvider.tsx` (new)

Reads `colorScheme` from `useSettingsStore`. Resolves `'system'` via `useColorScheme()` from react-native. Wraps children in `<View style={[{ flex: 1 }, vars(activeTheme)]}>` using `vars` from `nativewind`.

### 1.4 — `app/_layout.tsx`

Wrap `<Stack />` inside `<ThemeProvider>` (inside `QueryClientProvider`).

**Files touched:** `tailwind.config.js`, `src/core/theme/tokens.ts`, `src/core/theme/ThemeProvider.tsx`, `src/shared/ui/Button.tsx`, `src/shared/ui/Checkbox.tsx`, `app/_layout.tsx`

---

## Phase 2 — Auth Service Layer

**Goal**: Supabase calls isolated from screens.

**`src/features/auth/services/authService.ts`** (new):

```ts
signIn(email, password)      → supabase.auth.signInWithPassword
signUp(email, password)      → supabase.auth.signUp
resendVerification(email)    → supabase.auth.resend({ type: 'signup', email })
sendPasswordReset(email)     → supabase.auth.resetPasswordForEmail
```

Returns `{ data, error }` from Supabase. No store interaction inside service.

**Files touched:** `src/features/auth/services/authService.ts`

---

## Phase 3 — Auth Screen Components

**Goal**: Reusable primitives for auth screens.

| Component | Location | Purpose |
|---|---|---|
| `AuthLayout` | `src/features/auth/components/AuthLayout.tsx` | Screen wrapper: logo + title + subtitle + children slot |
| `FormField` | `src/features/auth/components/FormField.tsx` | label + TextInput + error message; react-hook-form `Controller` compatible |
| `PasswordInput` | `src/features/auth/components/PasswordInput.tsx` | FormField + eye toggle via `@expo/vector-icons` (bundled in Expo SDK, zero install) |

**Files touched:** 3 new files in `src/features/auth/components/`

---

## Phase 4 — Auth Screens

**Goal**: 4 screens with react-hook-form + zod validation + Supabase calls.

> Note: `@hookform/resolvers` is NOT in package.json. Validation uses `schema.safeParse()` inside `handleSubmit`, then `form.setError()` on field failures.

### Login — `app/(auth)/login.tsx`
- Fields: email, password
- Zod: email format, password min 8
- Submit: `authService.signIn` → `setSession` → AuthGuard redirects to `/(tabs)/today`
- Links: "Forgot password?" → `/(auth)/forgot-password` | "Sign up" → `/(auth)/signup`

### Sign Up — `app/(auth)/signup.tsx`
- Fields: email, password, confirm password
- Zod: email, password min 8, passwords match
- Submit: `authService.signUp` → `router.replace('/(auth)/confirm')`

### Verify Email — `app/(auth)/confirm.tsx`
- Static copy: check inbox message
- "Resend email" → `authService.resendVerification`
- "Back to login" link

### Forgot Password — `app/(auth)/forgot-password.tsx` ← **new file**
- Field: email
- Zod: email format
- Submit: `authService.sendPasswordReset` → inline success state
- "Back to login" link

### `app/(auth)/_layout.tsx`
Add `<Stack.Screen name="forgot-password" />`.

**Files touched:** `login.tsx`, `signup.tsx`, `confirm.tsx`, `forgot-password.tsx` (new), `_layout.tsx`

---

## Verification

1. `npm run ios` — all 4 screens render without unstyled elements
2. Light/dark toggle in Settings → tokens switch across all screens and shared components
3. Login with valid Supabase credentials → redirects to `/(tabs)/today`
4. Sign up with new email → redirects to `/confirm`
5. Resend verification → no crash
6. Forgot password with valid email → success message shown inline
7. Zod validation errors appear under each field
8. AuthGuard still works correctly (no regressions)

---

## Execution Order

`Phase 1 → Phase 2 → Phase 3 → Phase 4`

Screens depend on tokens (Phase 1) + service (Phase 2) + components (Phase 3).
