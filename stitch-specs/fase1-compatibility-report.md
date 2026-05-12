# FASE 1 — REPORTE DE COMPATIBILIDAD
# Stitch UI Migration — Mastery Habits Tracker
# Proyecto ID: 17054801401337424439
# Rama: feat/stitch-ui-migration

---

## A. SISTEMA DE DISEÑO — Tokens extraídos

### Paleta de colores — dark (principal)

| Token Stitch | Valor Stitch | Token actual | Valor actual | Delta | Impacto |
|---|---|---|---|---|---|
| `background` | `#131313` | `bg.base` | `#0a0a0a` | +19 luminance | ALTO |
| `surface` | `#131313` | `bg.surface` | `#18181b` | diferente | ALTO |
| `surface-container-low` | `#1c1b1b` | `bg.surfaceAlt` | `#27272a` | diferente | ALTO |
| `surface-container-high` | `#2a2a2a` | `bg.elevated` | `#1f1f23` | diferente | MEDIO |
| `primary-container` | `#00ff88` | `accent.primary` | `#4ade80` | hue shift verde→verde-azul | ALTO |
| `on-primary-container` | `#007139` | — | — | falta | MEDIO |
| `on-surface` | `#e5e2e1` | `text.primary` | `#f4f4f5` | levemente más frío | BAJO |
| `on-surface-variant` | `#b9cbb9` | `text.secondary` | `#a1a1aa` | Stitch tiene tinte verde | MEDIO |
| `outline` | `#849585` | `border.default` | `#27272a` | totalmente diferente | ALTO |
| `outline-variant` | `#3b4b3d` | `border.subtle` | `rgba(39,39,42,0.6)` | diferente | MEDIO |
| *(card bg)* | `#161616` | `bg.surface` | `#18181b` | cercano | BAJO |
| *(card border)* | `#262626` | `border.default` | `#27272a` | casi igual | BAJO |
| `error` | `#ffb4ab` | `status.danger` | `#ef4444` | diferente | BAJO |

### Paleta de colores — light (tema alternativo)

| Token Stitch | Valor | Token actual (minimalLight) | Delta | Impacto |
|---|---|---|---|---|
| `background` | `#fdf8f8` | `bg.base: #fafaf9` | leve | BAJO |
| `surface` | `#fdf8f8` | `bg.surface: #ffffff` | diferente | MEDIO |
| `primary` | `#000000` | `accent.primary: #1c1917` | diferente | MEDIO |
| `primary-container` | `#1c1b1b` | — | falta | MEDIO |
| `on-surface` | `#1c1b1b` | `text.primary: #1c1917` | casi igual | BAJO |
| `outline` | `#747878` | `border.default: #e7e5e4` | muy diferente | ALTO |
| `outline-variant` | `#c4c7c7` | `border.subtle: #e7e5e4` | diferente | MEDIO |

### Tipografía

El proyecto actual tiene `typography: { numericFeatures: 'tnum' }` — sin escala tipográfica.
Stitch define 7 estilos. Ninguno existe en el sistema actual.

| Estilo Stitch | Size / Weight / Leading / Tracking | ¿Existe? |
|---|---|---|
| `display-xl` | 72px / 900 / 1.0 / -0.04em | NO |
| `display-sm` | 56px / 900 / 1.0 / -0.04em | NO |
| `title-lg` | 28px / 700 / 1.2 / -0.02em | NO |
| `title-sm` | 22px / 700 / 1.2 / -0.02em | NO |
| `label-caps` | 12px / 600 / 1.0 / +0.08em | NO |
| `body-main` | 16px / 400 / 1.5 / 0 | NO |
| `micro-bold` | 11px / 500 / 1.4 / +0.01em | NO |

Fuente: Inter (pesos 400/500/600/700/900).
Proyecto no carga Inter explícitamente → requiere `@expo-google-fonts/inter`.
**Impacto: ALTO**

### Espaciado

`ThemeTokens` actual no tiene spacing tokens. Stitch define:

| Token | Valor | ¿Existe? |
|---|---|---|
| `unit` | 4px | NO |
| `gutter` | 16px | NO |
| `margin-mobile` | 20px | NO |
| `stack-sm` | 8px | NO |
| `stack-md` | 24px | NO |
| `stack-lg` | 48px | NO |

**Impacto: ALTO** — extensión obligatoria de `ThemeTokens`.

### Radios, bordes, iconografía

| Token Stitch | Valor | Actual | Delta | Impacto |
|---|---|---|---|---|
| `DEFAULT` (button) | 8px (0.5rem) | `radius.md: 10` | -2px | BAJO |
| `md` (card) | 12px (0.75rem) | `radius.lg: 12` | igual | — |
| `full` | 9999px | `radius.pill: 999` | igual | — |
| Progress bar height | 3px | `ProgressBar` variable | verificar | MEDIO |
| Icons | outline, 2px stroke | MaterialSymbols | compatibles | — |

---

## B. INVENTARIO DE VISTAS EXISTENTES

| Pantalla Stitch | ID Stitch | Archivo proyecto | Cambio |
|---|---|---|---|
| Login | `47dfbfa7...` | `app/(auth)/login.tsx` | 🟡 Estilos + inputs underline |
| Register | `a6572133...` | `app/(auth)/signup.tsx` | 🟡 Estilos + inputs underline |
| Today Dashboard dark | `4d8af5e5...` | `app/(tabs)/index.tsx` | 🔴 Estructural (score card display-xl) |
| Today Dashboard light | `0be7da39...` | `app/(tabs)/index.tsx` | 🟡 Tokens light |
| Stats Dashboard dark | `e0f05f2d...` | **NO EXISTE** → crear en FASE 7 | 🔴 NUEVA (aprobada) |
| Stats Dashboard light | `5e880946...` | **NO EXISTE** → crear en FASE 7 | 🔴 NUEVA (aprobada) |
| Power Grid dark | `1acde434...` | `app/habit/grid.tsx` (nueva ruta) | 🔴 NUEVA ruta (aprobada) |
| Power Grid light | `6bf1a9e8...` | `app/habit/grid.tsx` | 🟡 Tokens light |
| Profile | `98272115...` | `app/(tabs)/profile.tsx` | 🟡 Estilos + sección avatar |
| Theme Selector | `7cead585...` | `app/settings.tsx` + ThemePicker | 🔴 Estructural (preview cards) |

---

## C. THEMING DARK / LIGHT

### Mecanismo actual

- Zustand store (`theme.store.ts`) → guarda `themeId`
- `ThemeProvider` (React Context) → resuelve a `ThemeTokens`
- `useTheme()` hook → acceso en componentes
- 6 temas: `tech-neon` (dark), `organic-growth`, `minimal-light` (light), `brutalist-editorial`, `cyberpunk`, `terminal-phosphor`

### Estrategia de extensión

1. Extender `ThemeTokens` type: añadir `spacing` + `typography` scale
2. Mapear tokens dark Stitch → actualizar `techNeonTheme`
3. Mapear tokens light Stitch → actualizar `minimalLightTheme`
4. Los 4 temas restantes reciben valores compatibles (sin romper su identidad)
5. `ThemeProvider` + `useTheme()` API pública permanece **intacta**

---

## D. RIESGOS Y BREAKING CHANGES

| Riesgo | Área | Impacto | Mitigación |
|---|---|---|---|
| Extender `ThemeTokens` rompe TS en los 6 `.theme.ts` | tipos | ALTO | Actualizar todos en la misma fase |
| Inter no está cargado | tipografía | ALTO | Instalar `@expo-google-fonts/inter` en FASE 2 |
| `outline` token Stitch `#849585` muy diferente al actual | borders | MEDIO | Reemplazar deliberadamente |
| ThemePicker actual es lista simple, Stitch es preview cards | Theme Selector | MEDIO | Solo estructural, lógica intacta |
| Power Grid requiere nueva ruta | routing | MEDIO | Nueva ruta `app/habit/grid.tsx` (aprobada) |
| Accent `#4ade80` → `#00ff88` afecta todos los componentes | visual | MEDIO | Objetivo de la migración |
| Inputs underline rompen layout actual de auth | auth | BAJO | Solo estilos, react-hook-form intacto |

### Estimación de esfuerzo

| Fase | Horas |
|---|---|
| FASE 2 — Tokens + tipos | ~3h |
| FASE 3 — Theming | ~1h |
| FASE 4 — Componentes base | ~3h |
| FASE 5 — Auth | ~2h |
| FASE 6 — Today Dashboard | ~3h |
| FASE 7 — Stats (nueva) + Power Grid (nueva ruta) | ~4h+ |
| FASE 8 — Profile + Theme Selector | ~2h |
| **Total** | **~18h** |

---

## E. PLAN DE FASES PROPUESTO

```
FASE 2 → Tokens + tipos
  ├─ Instalar @expo-google-fonts/inter
  ├─ Extender ThemeTokens: añadir spacing + typography scale
  ├─ Actualizar techNeonTheme (dark Stitch)
  ├─ Actualizar minimalLightTheme (light Stitch)
  └─ Añadir nuevas secciones a los 4 temas restantes

FASE 3 → Theming dark/light
  └─ Validar ThemeProvider con nuevos tokens, sin cambios estructurales

FASE 4 → Componentes base (átomos)
  ├─ ProgressBar (3px height, #00ff88 fill)
  ├─ HabitCard (#161616 bg, #262626 border, 12px radius)
  ├─ Input (underline style)
  └─ CategoryBadge (label-caps, accent-muted bg)

FASE 5 → Auth
  ├─ app/(auth)/login.tsx
  └─ app/(auth)/signup.tsx

FASE 6 → Today Dashboard
  └─ app/(tabs)/index.tsx

FASE 7 → Stats Dashboard + Power Grid
  ├─ app/stats.tsx (NUEVA — aprobada)
  └─ app/habit/grid.tsx (NUEVA ruta — aprobada)

FASE 8 → Profile + Theme Selector
  ├─ app/(tabs)/profile.tsx
  └─ app/settings.tsx + ThemePicker component
```

---

## Decisiones confirmadas

- Stats Dashboard → crear en FASE 7 como pantalla nueva
- Power Grid → nueva ruta `app/habit/grid.tsx`
- Ambas aprobadas por el usuario en sesión 2026-05-11
