---
name: Mastery Habits
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#b9cbb9'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#849585'
  outline-variant: '#3b4b3d'
  surface-tint: '#00e479'
  primary: '#f1ffef'
  on-primary: '#003919'
  primary-container: '#00ff88'
  on-primary-container: '#007139'
  inverse-primary: '#006d37'
  secondary: '#c6c6c7'
  on-secondary: '#2f3131'
  secondary-container: '#454747'
  on-secondary-container: '#b4b5b5'
  tertiary: '#fffaf7'
  on-tertiary: '#3d2f00'
  tertiary-container: '#ffdb79'
  on-tertiary-container: '#795f01'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#60ff99'
  primary-fixed-dim: '#00e479'
  on-primary-fixed: '#00210c'
  on-primary-fixed-variant: '#005228'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#ffe08d'
  tertiary-fixed-dim: '#e5c364'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#584400'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-xl:
    fontFamily: Inter
    fontSize: 72px
    fontWeight: '900'
    lineHeight: '1.0'
    letterSpacing: -0.04em
  display-sm:
    fontFamily: Inter
    fontSize: 56px
    fontWeight: '900'
    lineHeight: '1.0'
    letterSpacing: -0.04em
  title-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  title-sm:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.08em
  body-main:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0em
  micro-bold:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 20px
  margin-desktop: 40px
  stack-sm: 8px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style
The design system is engineered for elite performance and athletic discipline. It utilizes a **High-Contrast / Bold** aesthetic that draws heavily from high-end sports performance interfaces. The personality is uncompromising, urgent, and premium.

By prioritizing a dark-first environment with aggressive typography and neon accents, the UI creates a "flow state" for users focused on self-mastery. The visual language avoids decorative flourishes like gradients or shadows, opting instead for raw, geometric precision and high-energy color hits to signify progress and action.

## Colors
The palette is rooted in "Tech Neon," a high-contrast scheme designed for maximum legibility in low-light environments.

- **Backgrounds:** The true-black base (#0D0D0D) provides the foundation for extreme contrast.
- **Accents:** The primary neon green (#00FF88) is reserved exclusively for interactive states, primary progress indicators, and "success" moments.
- **Surfaces:** Use the secondary surface (#1F1F1F) to elevate interactive cards from the base background.
- **Hierarchy:** Text follows a strict grayscale scale to ensure the neon accent remains the focal point of the user's attention.

## Typography
Typography is the primary visual driver of this design system. It uses **Inter** for its geometric clarity and technical feel.

- **Display Styles:** Use for "hero" data points, such as daily streaks or total reps. These should feel massive and immovable.
- **Labels:** Always set in All-Caps with expanded tracking to act as clear navigational anchors or metadata headers.
- **Tight Leading:** Headlines and Display styles use tight line-heights to maintain a compact, "heavy" feel.
- **Responsiveness:** Scale Display-XL down to Display-SM on mobile devices to prevent excessive wrapping while maintaining impact.

## Layout & Spacing
The layout follows a **Fluid Grid** model with an 8px rhythmic baseline.

- **Structure:** Content is organized into clear vertical stacks. On mobile, use a 4-column grid with 20px side margins.
- **Density:** Use tight spacing (`stack-sm`) for related grouped items (like a label and its input) and generous spacing (`stack-lg`) to separate major functional sections.
- **Alignment:** Everything must be strictly left-aligned to reinforce the "typographically dominant" editorial style.

## Elevation & Depth
This design system rejects physical metaphors like shadows or blurs. Depth is achieved purely through **Tonal Layers** and **Bold Outlines**.

- **Z-Axis:** The background is the lowest layer (#0D0D0D). Cards and containers sit on top using #161616. Interactive elements or active states may use #1F1F1F.
- **Borders:** Use #262626 for all structural containment. Use the primary neon accent for borders only when an item is "Active" or "Focused."
- **Flatness:** Avoid any form of "softness." The interface should feel like a digital cockpit—functional, flat, and high-precision.

## Shapes
Shape language is controlled and geometric.

- **Cards:** 12px corner radius provides a slight softening to the otherwise aggressive aesthetic, ensuring the app feels "premium" rather than just "brutalist."
- **Buttons:** A tighter 8px radius distinguishes interactive triggers from content containers.
- **Progress Bars:** Fixed at a slim 3px height. They should appear as sharp, surgical lines of light cutting through the dark interface.

## Components
- **Buttons:** High-contrast blocks. Primary buttons use a solid #00FF88 fill with #0D0D0D text. Secondary buttons use #262626 outlines with white text.
- **Progress Indicators:** 3px height bars. Use #262626 for the track and #00FF88 for the fill.
- **Cards:** Use #161616 background with 12px rounding. No shadows. Internal padding should be a consistent 20px.
- **Icons:** Use 2px stroke weight, outline-only icons. Never use filled icons unless they represent a completed/toggled state in the primary accent color.
- **Inputs:** Dark backgrounds (#0D0D0D) with a bottom-border only (#262626), switching to the neon accent on focus.
- **Habit Chips:** Small, All-Caps label components used for categorizing habits (e.g., "STRENGTH," "MINDSET"). These use the `accent-muted` background with the primary accent text color.
