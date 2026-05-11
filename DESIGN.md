# Mastery Habits — Design Document

## App Overview

Mastery Habits is a habit tracker focused on **consistency over streaks**. Instead of breaking a streak, users build a **Commitment Score** (0–100) that decays when planned days are missed and grows when habits are completed. Each habit has a **Mastery Level** that reflects long-term consistency.

**Target platform:** iOS & Android (React Native + Expo)  
**Primary audience:** Adults building long-term habits  
**Core metaphor:** Plant growth — from Seed 🌱 to Ancient Tree 🌲

---

## Design Tokens

### Color System

Theming is per-user. Six themes available; listed below are the shared semantic tokens (theme-agnostic names):

| Token | Role |
|-------|------|
| `bg.base` | App background |
| `bg.surface` | Card / panel background |
| `bg.surfaceAlt` | Alternate section background |
| `bg.elevated` | Modal / sheet background |
| `text.primary` | Main readable text |
| `text.secondary` | Labels, captions |
| `text.tertiary` | Placeholder, disabled |
| `accent.primary` | CTA buttons, active states |
| `accent.onPrimary` | Text on accent background |
| `accent.muted` | Subdued accent (badges, chips) |
| `score.excellent` | Score ≥ 80 |
| `score.good` | Score 50–79 |
| `score.warning` | Score 20–49 |
| `score.critical` | Score < 20 |
| `status.success` | Completed check-in |
| `status.skip` | Skipped (grace period) |
| `status.danger` | Missed day |
| `status.info` | Informational |
| `border.subtle` | Hairline dividers |
| `border.default` | Card borders |
| `border.strong` | Emphasis borders |

### Border Radius

| Token | Value |
|-------|-------|
| `radius.sm` | 8px |
| `radius.md` | 14px |
| `radius.lg` | 18px |
| `radius.pill` | 999px |

### Typography

- **Body**: System default (SF Pro / Roboto)
- **Display** (Brutalist theme only): Georgia serif
- Numeric figures use `tnum` feature for aligned score displays

### Category Colors (9 presets)

Each category has `fg` (text), `bg` (chip background), `border` tokens:

| Key | Semantic Use |
|-----|-------------|
| `green` | General / health |
| `violet` | Mindfulness / meditation |
| `blue` | Learning / study |
| `yellow` | Nutrition / food |
| `orange` | Energy / exercise |
| `pink` | Social / relationships |
| `cyan` | Creativity / art |
| `emerald` | Nature / outdoor |
| `neutral` | Uncategorized / custom |

### Mastery Level Colors

| Level | Score Range | Emoji |
|-------|------------|-------|
| Seed | 0–20 | 🌱 |
| Sprout | 21–45 | 🌿 |
| Tree | 46–70 | 🌲 |
| Forest | 71–90 | 🌳 |
| Ancient | 91–100 | 🌲 (gold) |

---

## Available Themes

| ID | Name | Mode | Tier |
|----|------|------|------|
| `tech-neon` | Tech Neon | Dark | Free |
| `organic-growth` | Organic Growth | Dark | Free |
| `minimal-light` | Minimal Light | Light | Free |
| `brutalist-editorial` | Brutalist Editorial | Dark | Free |
| `cyberpunk` | Cyberpunk | Dark | Free |
| `terminal-phosphor` | Terminal Phosphor | Dark | Free |

---

## Core Mechanics (for UI representation)

### Commitment Score

```
Score_today = (Score_yesterday × 0.8) + (Compliance × 20)
```

- Planned day completed → Compliance = 1 → score grows
- Planned day missed → Compliance = 0 → score decays
- Non-planned day → score unchanged
- Range: 0–100

### Grace Period (Weekly Skip)

Each habit allows **1 skip per ISO week**. Using a skip counts as Compliance = 1 (no penalty). Skips don't accumulate.

### Frequency

Habits are planned for specific days of the week (e.g., Mon/Wed/Fri). Only planned days affect the score.

---

## Screens

### 1. Login Screen (`/(auth)/login`)

**Purpose:** Authenticate existing users  
**Layout:** Single-column, centered vertically

**Elements:**
- App name / logo (top)
- Email field (`Input`)
- Password field (`Input`, secure)
- "Sign In" primary button (`Button`, full-width)
- "Don't have an account? Sign up" link (bottom)

**States:**
- Default
- Loading (button shows spinner)
- Error (inline error below form)

---

### 2. Sign Up Screen (`/(auth)/signup`)

**Purpose:** Create new account  
**Layout:** Single-column, centered vertically

**Elements:**
- Email field
- Display name field
- Password field
- Confirm password field
- "Create Account" primary button
- "Already have an account? Log in" link
- Password match validation (inline error)

---

### 3. Dashboard (`/(tabs)/index`)

**Purpose:** Overview of all habits + global performance  
**Layout:** Scrollable, full-screen

**Elements:**

**Header section:**
- Average Commitment Score — large numeric display
- Score state badge (Excellent / Good / Warning / Critical) colored by `score.*` tokens
- "Habits planned today" count (e.g., "3 of 5 habits planned today")

**Habit list:**
- `FlatList` of `HabitCard` components
- Each card shows:
  - Habit name (bold)
  - Category badge (`CategoryBadge` — pill chip with category color)
  - Mastery level emoji + label (`MasteryBadge`)
  - Commitment score (numeric, color-coded)
  - Progress bar toward next level (`LevelProgress`)
- Empty state: illustration + "No habits yet. Start your journey." + CTA button

**FAB / Action button:**
- "+" floating button (bottom-right) → navigates to `/habit/new`

**Navigation:**
- Tab bar (bottom): Habits icon (active) | Profile icon

---

### 4. Profile Screen (`/(tabs)/profile`)

**Purpose:** User identity + global mastery stats  
**Layout:** Scrollable, sections

**Elements:**

**Identity card:**
- Avatar (initials, color from accent)
- Display name
- Email address
- Global Commitment Score (average across all habits)
- Overall Mastery Level badge

**Stats section:**
- Habits distribution by level (e.g., "2 Seeds, 1 Sprout, 0 Trees...")
- Bar or list breakdown per level with count

**Header action:**
- Gear icon (⚙️) top-right → navigates to `/settings`

---

### 5. Settings Screen (`/settings`)

**Purpose:** App preferences  
**Layout:** List-style, sections

**Sections:**

**Appearance:**
- Theme picker (`ThemePicker`) — shows 6 theme options with preview swatch + name

**Language:**
- Language picker (`LanguagePicker`) — EN / ES toggle

**Account:**
- "Log Out" destructive button

---

### 6. New Habit Screen (`/habit/new`)

**Purpose:** Create a new habit  
**Layout:** Single-column form, scrollable

**Elements (via `HabitForm`):**
- Habit name field (required)
- Description field (optional, multiline)
- Category picker (`CategoryPicker`):
  - Shows 9 preset categories as color-coded chips
  - "Custom" option opens `CustomCategoryInput` (text + optional emoji)
- Frequency selector (`FrequencySelector`):
  - 7-day pill selector (Mon → Sun)
  - Toggle individual days on/off
  - At least 1 day required
- "Save Habit" primary button (full-width, bottom)
- "Cancel" / back navigation (top-left)

---

### 7. Habit Detail Screen (`/habit/[id]`)

**Purpose:** View + edit habit, check in for today, review history  
**Layout:** Scrollable sections

**Sections:**

**Header:**
- Habit name (large)
- Category badge
- Edit button (top-right) → toggles form inline

**Mastery section:**
- `MasteryBadge` (level emoji + label)
- Commitment score (large numeric)
- `LevelProgress` bar (% toward next level)

**Check-in section (only if today is a planned day):**
- `CheckInButton`:
  - Default: "Mark as Done" (success) | "Skip" (if skip available)
  - If skip available: shows "1 skip remaining this week"
  - If already checked in: shows status (done ✓ / skipped ↩ / missed ✗)
  - Skip triggers modal confirmation before using

**30-day history grid:**
- 5×6 grid of day cells (most recent 30 days)
- Cell colors:
  - Completed → `status.success`
  - Skipped → `status.skip`
  - Missed → `status.danger`
  - Not planned → `bg.surfaceAlt` (neutral)
  - Future → empty / faded
- Day number label inside each cell

**Edit form (inline toggle):**
- Same fields as `HabitForm`
- "Save Changes" + "Delete Habit" (destructive, confirmation required)

---

## Navigation Flow

```
App Launch
    │
    ├─ No session ──────────────────────────────────────────────────────┐
    │                                                                    │
    │   ┌─── Login Screen ──────────────────────────────────────────┐   │
    │   │  [Sign In] → Dashboard                                    │   │
    │   │  [Sign Up] → Signup Screen → Dashboard                    │   │
    │   └───────────────────────────────────────────────────────────┘   │
    │                                                                    │
    └─ Has session ─────────────────────────────────────────────────────┘
            │
            ▼
    ┌─── Tab Bar ───────────────────────────────────────────────────┐
    │                                                               │
    │   [Habits Tab] ─ Dashboard                                    │
    │       └─ Tap "+" ────────────────────────── New Habit         │
    │       └─ Tap HabitCard ──────────────────── Habit Detail      │
    │               └─ Check In ─────────────────── (inline)       │
    │               └─ Edit ──────────────────────── (inline form)  │
    │               └─ Delete ───────────────────── (confirm modal) │
    │                                                               │
    │   [Profile Tab] ─ Profile Screen                              │
    │       └─ Tap ⚙️ ─────────────────────────── Settings         │
    │               └─ Theme Picker ────────────── (inline)         │
    │               └─ Language Picker ─────────── (inline)         │
    │               └─ Log Out ──────────────────── Login Screen    │
    └───────────────────────────────────────────────────────────────┘
```

---

## Component Inventory

### Design System (`@core/components`)

| Component | Description |
|-----------|-------------|
| `Button` | Primary CTA, full-width or compact, loading state |
| `Card` | Surface container with border, radius, padding |
| `Input` | Labeled text field with inline error display |
| `Screen` | Safe-area wrapper, optional scroll, standard padding |
| `Modal` | Overlay sheet, dimmed background, dismissible |
| `ProgressBar` | Horizontal linear progress (0–100%) |
| `Skeleton` | Animated pulse placeholder for async loading |
| `ThemePicker` | Theme selection UI (swatches + names) |
| `LanguagePicker` | Language toggle (EN / ES) |

### Habits (`@habits/components`)

| Component | Description |
|-----------|-------------|
| `HabitCard` | List item: name, category, score, level, progress |
| `HabitForm` | Create/edit form: name, description, category, frequency |
| `CategoryBadge` | Pill chip showing category color + label |
| `CategoryPicker` | Grid of preset category chips + custom input |
| `CustomCategoryInput` | Free-text + emoji for user-defined categories |
| `FrequencySelector` | 7-day pill row, toggleable |

### Check-In (`@checkin/components`)

| Component | Description |
|-----------|-------------|
| `CheckInButton` | Contextual action: complete / skip / already done |

### Progression (`@progression/components`)

| Component | Description |
|-----------|-------------|
| `MasteryBadge` | Emoji + level label chip |
| `LevelProgress` | Progress bar with current score vs next threshold |

---

## State Architecture (for context)

| Store | State held |
|-------|-----------|
| `session.store` | Supabase user session |
| `theme.store` | Active theme ID |
| `locale.store` | Active language (en/es) |
| `habits.store` | Habits list cache |
| `score.store` | Commitment scores cache per habit |

---

## Data Model (simplified)

```
User
  └─ Habit (name, description, category, frequency_days[])
        └─ CheckIn (date, status: completed|skipped|missed)
        └─ MasteryScore (score: 0–100, level: seed|sprout|tree|forest|ancient)
```
