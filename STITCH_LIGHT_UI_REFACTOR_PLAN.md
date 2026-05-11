# Plan — Refactor UI a Stitch Light Design System

## Summary

- Usar exclusivamente el design system **Mastery Habits Light** de Stitch: Anton + Lexend, fondo claro, cards blancas, bordes `#E5E5E5`, primary `#111111`.
- Mantener la arquitectura de theming para futuro, pero pinnear la app a `minimal-light` por ahora.
- Limpiar solo assets no-light: borrar variantes dark/cyberpunk locales y conservar light + design-system para comparación.

## Components to Modify

- **Core UI**
  - `Screen` — padding/background/layout base light.
  - `Card` — white surface, 1px border, 12px radius, no shadows.
  - `Button` — Stitch primary/secondary/danger styles, Lexend labels, icon support.
  - `Input` — agregar `variant="boxed" | "underline"`; boxed default, underline para Login.
  - `ProgressBar` — 8px habit bars, monochrome track/fill.
  - `Skeleton` — ajustar a surfaces/borders light.
  - `ThemePicker` — convertir en placeholder/deshabilitado para “Light active / theming coming soon”.
  - `LanguageSelector` — ajustar filas, bordes y tipografía a Stitch Light.

- **Habit UI**
  - `HabitCard` — layout de Today Dashboard: status circle, title/meta, streak/score, completed state.
  - `CategoryBadge` — Lexend labels, monochrome/light badge treatment.
  - `CategoryPicker` — cards light, active border primary.
  - `FrequencySelector` — selection controls light, sharp technical style.
  - `HabitForm` — secciones/labels/spacing consistentes con inputs boxed.

- **Progression / Check-in**
  - `MasteryBadge` — pill/border light style.
  - `LevelProgress` — progress bar + labels con tokens Stitch.
  - `CheckInButton` — primary/secondary actions light, modal aligned to card system.

## Key Changes

- **Cleanup**
  - Borrar `stitch-assets/*-dark.png`, `stitch-specs/*-dark.html`, `stitch-specs/stats-dashboard-cyberpunk.html`.
  - Conservar light screenshots/specs, `stitch-specs/design-system.md`, login/register/profile/theme-selector assets.

- **Design system**
  - Completar tokens Stitch Light: Anton para display/headlines, Lexend para body/labels.
  - Cargar `Anton_400Regular`, `Lexend_400Regular`, `Lexend_500Medium`, `Lexend_600SemiBold`, `Lexend_700Bold`.
  - Remover dependencia runtime de Inter.

- **Theming**
  - Default de `useThemeStore`: `minimal-light`.
  - `ThemeProvider` resuelve siempre `minimalLightTheme` por ahora, aunque haya un theme viejo persistido.
  - No eliminar infraestructura de themes; queda dormida para futuro.
  - Settings reemplaza ThemePicker interactivo por placeholder.

- **Screens**
  - Refactorizar Login, Register, Today Dashboard, Power Grid, Stats Dashboard, Profile, Settings, Habit new/detail.
  - Reusar datos reales actuales; no hardcodear métricas de Stitch salvo empty/loading states.
  - Mantener Screaming Architecture y module isolation.

## Public Interfaces

- `Input` suma `variant?: "boxed" | "underline"`.
- Theme runtime queda funcional pero single-theme: tema efectivo `minimal-light`.
- Sin cambios de DB, Supabase, rutas públicas ni lógica de Commitment Score.

## Test Plan

- No ejecutar build.
- Ejecutar `npx tsc --noEmit`.
- Ejecutar `npm test`.
- QA visual manual contra assets light de Stitch.
- Verificar que no queden imports visuales hardcodeados a `Inter_*` en runtime.

## Assumptions

- El plan Markdown vive en `STITCH_LIGHT_UI_REFACTOR_PLAN.md` en la raíz.
- Se borran solo assets/specs no-light; no se borra todo `stitch-assets/` ni `stitch-specs/`.
- Theming queda preparado para futuro, pero la app visible maneja únicamente light.
