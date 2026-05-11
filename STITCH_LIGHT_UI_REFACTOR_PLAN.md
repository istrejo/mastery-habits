# Stitch Light UI Refactor Plan — Mastery Habits

## Regla de ejecución

Este refactor se ejecuta por fases. **No se desarrolla la fase siguiente sin aprobación explícita del usuario.**

Formato de avance:

1. Ejecutar una fase.
2. Reportar checklist completado, archivos tocados y validación realizada.
3. Detenerse.
4. Esperar aprobación explícita antes de continuar.


Regla adicional de versionado:

- Cada fase se cierra con su propio commit convencional.
- No se mezclan archivos de fases distintas en el mismo commit.
- Si existen cambios adelantados de fases posteriores, quedan sin commitear hasta aprobar/verificar su fase.

Restricciones del repo:

- No ejecutar build.
- Usar `npm install --legacy-peer-deps` si hay que instalar dependencias.
- No agregar `Co-Authored-By` ni atribución AI en commits.
- Verificar antes de afirmar.
- Mantener Screaming Architecture y aislamiento modular.

---

## Objetivo

Refactorizar la UI de Mastery Habits para alinearla al design system **Mastery Habits Light** de Stitch:

- Fondo claro editorial.
- Cards blancas.
- Bordes low-contrast.
- Primary monocromo `#111111`.
- Tipografía Anton + Lexend.
- Solo tema light activo por ahora.
- Infraestructura de theming conservada para futuro.

---

## Fase 0 — Plan y control de alcance

**Objetivo:** dejar el plan verificable antes de tocar más UI.

### Checklist

- [x] Crear/actualizar `STITCH_LIGHT_UI_REFACTOR_PLAN.md`.
- [x] Documentar fases con checklist.
- [x] Documentar regla de aprobación entre fases.
- [x] Registrar que la app manejará solo light por ahora.
- [x] Registrar que theming queda preparado para futuro.
- [x] Identificar cambios parciales existentes antes de continuar:
  - `package.json`
  - `package-lock.json`
  - `src/modules/core/theming/tokens.ts`

### Validación

- [x] `git status --short` revisado.
- [x] No se ejecutó build.
- [x] No se refactorizó UI dentro de esta fase; existen cambios previos/parciales en el working tree que deben tratarse antes de avanzar.


### Estado del working tree detectado al cerrar Fase 0

Además de este plan, el working tree ya muestra cambios parciales de implementación en fuentes/tokens/core UI y borrados de assets no-light. Antes de aprobar Fase 1, decidir si esos cambios se conservan como trabajo ya realizado o si se revierten para ejecutar estrictamente fase por fase.

### Gate

**STOP. Esperar aprobación para Fase 1.**

---

## Fase 1 — Limpieza de assets Stitch no usados

**Objetivo:** conservar solo assets/specs útiles para light y borrar variantes no-light.

### Checklist

- [x] Borrar `stitch-assets/*-dark.png`.
- [x] Borrar `stitch-specs/*-dark.html`.
- [x] Borrar `stitch-specs/stats-dashboard-cyberpunk.html`.
- [x] Conservar screenshots/specs light.
- [x] Conservar `stitch-specs/design-system.md`.
- [x] Conservar assets de login/register/profile/theme-selector.

### Validación

- [x] `find stitch-assets stitch-specs -maxdepth 2 -type f | sort` muestra solo assets necesarios.
- [x] `git status --short` revisado.
- [x] No se ejecutó build.


### Resultado Fase 1

Verificado: solo quedan assets/specs light y archivos de referencia. Los borrados detectados coinciden con el alcance aprobado: dark/cyberpunk local fuera.

### Gate

**STOP. Esperar aprobación para Fase 2.**

---

## Fase 2 — Tokens, fuentes y tema único light

**Objetivo:** cerrar la base del design system antes de tocar pantallas. Acá va la estructura; si esto queda mal, todo lo demás es maquillaje barato.

### Checklist

- [x] Completar dependencias de fuentes:
  - `@expo-google-fonts/anton`
  - `@expo-google-fonts/lexend`
- [x] Cargar en `app/_layout.tsx`:
  - `Anton_400Regular`
  - `Lexend_400Regular`
  - `Lexend_500Medium`
  - `Lexend_600SemiBold`
  - `Lexend_700Bold`
- [x] Completar `src/modules/core/theming/tokens.ts` con escala Stitch Light.
- [x] Ajustar `minimalLightTheme` a:
  - background `#FAFAFA` / surface app `#FDF8F8` según token actual,
  - cards `#FFFFFF`,
  - border `#E5E5E5`,
  - primary `#111111`,
  - secondary `#666666` / muted hierarchy.
- [x] Cambiar default de `useThemeStore` a `minimal-light`.
- [x] Hacer que `ThemeProvider` resuelva `minimalLightTheme` aunque exista un theme viejo persistido.
- [x] Mantener exportados `THEMES` y tipos actuales para futuro theming.

### Validación

- [!] `npx tsc --noEmit` ejecutado; bloqueado por errores fuera de Fases 1–3 (`login` Fase 5, `stats` Fase 6).
- [x] `git diff` revisado para confirmar que no se eliminó infraestructura futura.
- [x] No se ejecutó build.

### Gate

**STOP. Esperar aprobación para Fase 3.**

---

## Fase 3 — Core UI components

**Objetivo:** refactorizar componentes base para que las pantallas no dupliquen estilos. Conceptos primero, código después: una UI sana se construye con ladrillos sanos.

### Componentes modificados

- `Screen`
- `Card`
- `Button`
- `Input`
- `ProgressBar`
- `Skeleton`
- `LanguageSelector`
- `ThemePicker`

### Checklist

- [x] `Screen`: fondo light, padding mobile editorial, scroll spacing consistente.
- [x] `Card`: white surface, border `#E5E5E5`, radius 12, padding 20/24, sin shadows.
- [x] `Button`: primary/secondary/ghost/danger con Lexend, uppercase opcional, icon left/right estable.
- [x] `Input`: agregar `variant?: 'boxed' | 'underline'`.
- [x] `Input`: default `boxed`; login usa `underline`.
- [x] `ProgressBar`: default height 8, track muted, fill primary.
- [x] `Skeleton`: surfaces light y radius coherente.
- [x] `LanguageSelector`: filas light, borde active primary, Lexend.
- [x] `ThemePicker`: reemplazar selector interactivo por placeholder deshabilitado:
  - Light theme active.
  - Theming coming soon.

### Validación

- [!] `npx tsc --noEmit` ejecutado; bloqueado por errores fuera de Fases 1–3 (`login` Fase 5, `stats` Fase 6).
- [!] Revisión global de API bloqueada por errores typed-routes/noUncheckedIndexedAccess fuera de Fase 3.
- [x] No se ejecutó build.


### Resultado parcial Fases 2–3

Se verificó que los cambios actuales cubren tokens, fuentes, tema forzado a light y core UI components. La validación global `npx tsc --noEmit` está bloqueada por errores fuera de Fases 1–3:

- `app/(auth)/login.tsx`: `Link href="#"` no cumple typed routes. Corresponde a Fase 5.
- `app/(tabs)/stats.tsx`: acceso a celda posiblemente `undefined` por `noUncheckedIndexedAccess`. Corresponde a Fase 6.

No se corrigieron esos archivos porque pertenecen a fases posteriores y requieren aprobación explícita.

### Validación adicional

- `npm test -- --runInBand` pasó: 3 suites, 48 tests.


### Cambios fuera de Fases 1–3 detectados

Estos archivos ya están modificados en el working tree, pero no fueron validados ni desarrollados en esta revisión porque pertenecen a fases posteriores:

- `app/(tabs)/index.tsx` — Fase 6.
- `src/modules/check-in/components/CheckInButton.tsx` — Fase 4.
- `src/modules/habits/components/*` — Fase 4.
- `src/modules/progression/components/LevelProgress.tsx` — Fase 4.
- `src/modules/progression/components/MasteryBadge.tsx` — Fase 4.

### Gate

**STOP. Esperar aprobación para Fase 4.**

---

## Fase 4 — Habit UI, Progression y Check-in components

**Objetivo:** alinear componentes de dominio reutilizables antes de pantallas finales.

### Componentes modificados

- `HabitCard`
- `CategoryBadge`
- `CategoryPicker`
- `CustomCategoryInput`
- `FrequencySelector`
- `HabitForm`
- `MasteryBadge`
- `LevelProgress`
- `CheckInButton`

### Checklist

- [x] `HabitCard`: layout tipo Today Dashboard:
  - status circle,
  - nombre + metadata,
  - score/streak,
  - completed state con line-through/check.
- [x] `CategoryBadge`: tratamiento badge light/monochrome, Lexend labels.
- [x] `CategoryPicker`: card grid light, active border primary.
- [x] `FrequencySelector`: controles técnicos, active primary, border low contrast.
- [x] `HabitForm`: spacing de secciones y labels con tokens.
- [x] `MasteryBadge`: pill/border light.
- [x] `LevelProgress`: bar/labels con tokens Stitch.
- [x] `CheckInButton`: acciones primary/secondary y modal alineados a cards light.

### Validación

- [!] `npx tsc --noEmit` pendiente/bloqueado hasta corregir pantallas de fases posteriores.
- [x] `npm test -- --runInBand`: 3 suites, 48 tests.
- [x] No se ejecutó build.


### Resultado Fase 4

Componentes de dominio alineados al sistema light y tests de negocio pasando. Typecheck global sigue dependiendo de correcciones en pantallas posteriores.

### Gate

**STOP. Esperar aprobación para Fase 5.**

---

## Fase 5 — Auth screens

**Objetivo:** refactorizar Login y Register contra los specs Stitch light.

### Pantallas modificadas

- `app/(auth)/login.tsx`
- `app/(auth)/signup.tsx`

### Checklist

- [ ] Login:
  - centered vertical,
  - masthead Anton,
  - tagline uppercase,
  - underline inputs,
  - forgot link,
  - primary CTA con icon right,
  - footer link.
- [ ] Register:
  - centered layout,
  - card form,
  - boxed inputs,
  - primary CTA con icon right,
  - footer login link.
- [ ] Reusar validación actual con `react-hook-form` + `zod`.
- [ ] No cambiar lógica auth.

### Validación

- [ ] `npx tsc --noEmit`.
- [ ] QA visual contra assets Stitch light de login/register.
- [ ] No se ejecutó build.

### Gate

**STOP. Esperar aprobación para Fase 6.**

---

## Fase 6 — Main tabs: Today, Power Grid, Stats, Profile

**Objetivo:** alinear pantallas principales a Stitch Light usando componentes ya refactorizados.

### Pantallas modificadas

- `app/(tabs)/index.tsx`
- `app/(tabs)/grid.tsx`
- `app/(tabs)/stats.tsx`
- `app/(tabs)/profile.tsx`
- `app/(tabs)/_layout.tsx` si hace falta ajuste de tab bar.

### Checklist

- [ ] Today Dashboard:
  - protocol/score card,
  - active habits section,
  - completed count real,
  - `HabitCard` nuevo.
- [ ] Power Grid:
  - grid light editorial,
  - active/empty visual states,
  - summary cards reales cuando aplique.
- [ ] Stats Dashboard:
  - current streak hero,
  - completion/summary card si se puede calcular sin nueva lógica,
  - activity grid,
  - top habits.
- [ ] Profile:
  - identity block,
  - global score,
  - habit levels list,
  - settings route preservada.
- [ ] Tab bar light con icons actuales alineados a Stitch.

### Validación

- [ ] `npx tsc --noEmit`.
- [ ] `npm test`.
- [ ] QA visual contra Today/Stats/Power Grid/Profile light.
- [ ] No se ejecutó build.

### Gate

**STOP. Esperar aprobación para Fase 7.**

---

## Fase 7 — Settings, Habit New y Habit Detail

**Objetivo:** evitar pantallas “Frankenstein” con estilo viejo. Si el core cambia y estas quedan viejas, la app se siente rota.

### Pantallas modificadas

- `app/settings.tsx`
- `app/habit/new.tsx`
- `app/habit/[id].tsx`

### Checklist

- [ ] Settings:
  - language section light,
  - theme placeholder,
  - logout button light/danger.
- [ ] New Habit:
  - top bar/back pattern,
  - heading Anton,
  - form card/sections.
- [ ] Habit Detail:
  - header card,
  - score hero,
  - check-in card,
  - history grid tokens,
  - edit/archive actions.
- [ ] No cambiar DB ni lógica check-in.

### Validación

- [ ] `npx tsc --noEmit`.
- [ ] `npm test`.
- [ ] QA visual manual.
- [ ] No se ejecutó build.

### Gate

**STOP. Esperar aprobación para Fase 8.**

---

## Fase 8 — Final verification and cleanup

**Objetivo:** revisar consistencia, eliminar restos obvios y entregar estado verificable.

### Checklist

- [ ] Buscar hardcodes visuales viejos:
  - `Inter_` en pantallas/componentes,
  - colores hex no tokenizados,
  - shadows no deseadas,
  - dark-theme assumptions visibles.
- [ ] Confirmar que solo `minimal-light` está activo visualmente.
- [ ] Confirmar que theming futuro no fue eliminado.
- [ ] Revisar `git diff` completo.
- [ ] Ejecutar `npx tsc --noEmit`.
- [ ] Ejecutar `npm test`.
- [ ] No ejecutar build.

### Gate final

**STOP. Reportar resumen final y esperar decisión del usuario para commit/stage/PR si aplica.**

---

## Archivos de referencia Stitch conservados

- `stitch-specs/design-system.md`
- `stitch-specs/today-dashboard-light.html`
- `stitch-specs/stats-dashboard-light.html`
- `stitch-specs/power-grid-light.html`
- `stitch-specs/login.html`
- `stitch-specs/register.html`
- `stitch-specs/profile.html`
- `stitch-specs/theme-selector.html`
- Screenshots light equivalentes en `stitch-assets/`.
