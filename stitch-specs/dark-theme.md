---
name: Mastery Habits Dark
colors:
  # --- Backgrounds ---
  background: '#111111'
  surface: '#111111'
  surface-dim: '#0D0D0D'
  surface-bright: '#242424'
  surface-container-lowest: '#0D0D0D'
  surface-container-low: '#1A1A1A'
  surface-container: '#1C1C1C'
  surface-container-high: '#242424'
  surface-container-highest: '#303030'

  # --- Text ---
  on-surface: '#F0F0F0'
  on-surface-variant: '#999999'
  inverse-surface: '#F0F0F0'
  inverse-on-surface: '#1C1C1C'

  # --- Borders ---
  outline: '#2A2A2A'
  outline-variant: '#222222'

  # --- Accent / Primary (monochromatic — no hue) ---
  surface-tint: '#F0F0F0'
  primary: '#F0F0F0'
  on-primary: '#111111'
  primary-container: '#F0F0F0'
  on-primary-container: '#111111'
  inverse-primary: '#111111'

  # --- Secondary ---
  secondary: '#999999'
  on-secondary: '#1C1C1C'
  secondary-container: '#2A2A2A'
  on-secondary-container: '#999999'

  # --- Tertiary ---
  tertiary: '#5C5C5C'
  on-tertiary: '#0D0D0D'
  tertiary-container: '#383838'
  on-tertiary-container: '#5C5C5C'

  # --- Error / Danger ---
  error: '#CF6679'
  on-error: '#111111'
  error-container: '#3B1217'
  on-error-container: '#FFDAD6'

  # --- Fixed variants (mirror surface-alt logic) ---
  primary-fixed: '#F0F0F0'
  primary-fixed-dim: '#CCCCCC'
  on-primary-fixed: '#111111'
  on-primary-fixed-variant: '#2A2A2A'
  secondary-fixed: '#999999'
  secondary-fixed-dim: '#777777'
  on-secondary-fixed: '#111111'
  on-secondary-fixed-variant: '#2A2A2A'
  tertiary-fixed: '#5C5C5C'
  tertiary-fixed-dim: '#444444'
  on-tertiary-fixed: '#F0F0F0'
  on-tertiary-fixed-variant: '#2A2A2A'

  # --- Surface variant ---
  surface-variant: '#242424'

typography:
  display-xl:
    fontFamily: Anton
    fontSize: 64px
    fontWeight: '400'
    lineHeight: 82px
    letterSpacing: 1.28px
  display-sm:
    fontFamily: Anton
    fontSize: 40px
    fontWeight: '400'
    lineHeight: 54px
    letterSpacing: 0.8px
  title-lg:
    fontFamily: Anton
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 44px
    letterSpacing: 0.64px
  title-sm:
    fontFamily: Anton
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 34px
    letterSpacing: 0.24px
  label-caps:
    fontFamily: Lexend
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 17px
    letterSpacing: 0.7px
  body-main:
    fontFamily: Lexend
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0px
  micro-bold:
    fontFamily: Lexend
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.24px
rounded:
  sm: 4px
  DEFAULT: 8px
  md: 8px
  lg: 12px
  full: 9999px
spacing:
  unit: 4px
  gutter: 20px
  margin-mobile: 20px
  stack-sm: 8px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

Dark version of **Mastery Habits Light** — same minimal, monochromatic aesthetic, inverted luminosity.
No hue shifts, no colored accents. Pure grayscale. Everything that was black becomes near-white; everything that was near-white becomes near-black.

The personality stays identical: restrained, editorial, precise. The dark mode is not a "night mode with tints" — it is a true luminosity inversion of the same design language.

---

## Colors

### Token Mapping (Light → Dark)

| Semantic Token | Light Value | Dark Value | Role |
|----------------|-------------|------------|------|
| `bg.base` | `#FAFAFA` | `#111111` | App background |
| `bg.surface` | `#FFFFFF` | `#1C1C1C` | Card / panel background |
| `bg.surfaceAlt` | `#F4F4F4` | `#242424` | Alternate section background |
| `bg.elevated` | `#FFFFFF` | `#1C1C1C` | Modal / sheet background |
| `text.primary` | `#111111` | `#F0F0F0` | Main readable text |
| `text.secondary` | `#666666` | `#999999` | Labels, captions |
| `text.tertiary` | `#A3A3A3` | `#5C5C5C` | Placeholder, disabled |
| `text.inverse` | `#FFFFFF` | `#111111` | Text on inverted background |
| `accent.primary` | `#111111` | `#F0F0F0` | CTA buttons, active states |
| `accent.onPrimary` | `#FFFFFF` | `#111111` | Text on accent background |
| `accent.muted` | `rgba(17,17,17,0.10)` | `rgba(240,240,240,0.10)` | Subdued accent (badges, chips) |
| `border.subtle` | `#E5E5E5` | `#2A2A2A` | Hairline dividers |
| `border.default` | `#E5E5E5` | `#2A2A2A` | Card borders |
| `border.strong` | `#111111` | `#F0F0F0` | Emphasis borders |
| `score.excellent` | `#111111` | `#F0F0F0` | Score ≥ 80 |
| `score.good` | `#111111` | `#F0F0F0` | Score 50–79 |
| `score.warning` | `#666666` | `#999999` | Score 20–49 |
| `score.critical` | `#BA1A1A` | `#CF6679` | Score < 20 |
| `status.success` | `#111111` | `#F0F0F0` | Completed check-in |
| `status.skip` | `#666666` | `#999999` | Skipped (grace period) |
| `status.danger` | `#BA1A1A` | `#CF6679` | Missed day |
| `status.info` | `#666666` | `#999999` | Informational |

### Mastery Level Colors

| Level | fg | bg | border |
|-------|----|----|--------|
| Seed | `#999999` | `#242424` | `#2A2A2A` |
| Sprout | `#F0F0F0` | `#242424` | `#2A2A2A` |
| Tree | `#F0F0F0` | `#242424` | `#2A2A2A` |
| Forest | `#F0F0F0` | `#242424` | `#F0F0F0` |
| Ancient | `#111111` | `#F0F0F0` | `#F0F0F0` |

### Activity Grid Colors (30-day history)

| Level | Value | Role |
|-------|-------|------|
| `activity.none` | `#242424` | Not planned / empty |
| `activity.low` | `#383838` | Low activity |
| `activity.medium` | `#555555` | Medium activity |
| `activity.high` | `#A0A0A0` | High activity |
| `activity.veryHigh` | `#F0F0F0` | Very high activity |

### Category Colors (all neutral — monochromatic)

All 9 categories (`green`, `violet`, `blue`, `yellow`, `orange`, `pink`, `cyan`, `emerald`, `neutral`) use the same neutral swatch:

| Role | Value |
|------|-------|
| `fg` | `#F0F0F0` |
| `bg` | `rgba(240, 240, 240, 0.08)` |
| `border` | `#2A2A2A` |

---

## Elevation

Depth is achieved through tonal layers only — no shadows, no blurs.

| Layer | Color | Usage |
|-------|-------|-------|
| Base | `#111111` | App background |
| Surface | `#1C1C1C` | Cards, panels |
| Surface Alt | `#242424` | Alternate sections, chips |
| Elevated | `#1C1C1C` | Modals, sheets (same as surface) |
| Highest | `#303030` | Top-layer popups |

---

## What Does NOT Change (inherit from Light theme)

- **Typography:** Anton (display) + Lexend (body), same scale, same weights
- **Spacing:** Same unit/gutter/stack values
- **Border radius:** Same sm/md/lg/pill values
- **Component structure:** Same layout, same component hierarchy
- **Iconography:** Same icons, same stroke weight

Only luminosity changes. The design language is identical.
