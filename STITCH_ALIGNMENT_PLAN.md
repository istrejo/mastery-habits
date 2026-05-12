# Plan: Stitch UI Migration — Component & Screen Alignment

## Context

App ya migró tokens (FASE 2 previa: typography scale + spacing + paletas dark/light synced con Stitch). Componentes base ya migrados: `CheckInButton`, `LevelProgress`, `MasteryBadge`, `ProgressBar`. Screens migrados: Power Grid, Habit Detail, New Habit.

Falta: alinear visualmente Login, Signup, Today Dashboard (HabitCard), Profile, Stats (ActivityGrid) con diseño Stitch. Botón base no soporta icono trailing — bloquea CTAs Login/Signup. Aplica tanto a dark como light theme (Stitch provee ambos).

**Stitch Project ID:** `17054801401337424439`

| Screen | Stitch ID (Dark) | Stitch ID (Light) |
|---|---|---|
| Login | `47dfbfa79e5d4cb1ba5709df0105e05b` | — |
| Register | `a65721334de5488aaa9e61337f166c56` | — |
| Today Dashboard | `4d8af5e5a2194e1b8e4aaff30a80d618` | `0be7da39e94444028b5025288048f531` |
| Stats Dashboard | `e0f05f2d26894f2d89b9c8fe83c55c3b` | `5e880946d0a249a89b194f206292c0ef` |
| Power Grid | `1acde434081141659cf880bbb4683096` | `6bf1a9e88cc24f82a46348fe6b92c8b4` |
| Profile | `982721159650405a8a041dd3faec80e4` | — |

URL pattern: `projects/17054801401337424439/screens/{ID}`

---

## Decisiones acordadas

- **Themes**: migrar dark + light (ambos provistos por Stitch). Sistema theming actual ya soporta — validación visual al final.
- **Profile button**: agregar `EDIT PROFILE` (con `edit` icon) + mantener Settings icon.
- **HabitCard icon**: mantener `CategoryBadge` (visual equivalente, preserva feature).

---

## FASE 1 — Button trailing icon support

**Razón:** Login y Signup CTAs requieren `arrow_forward` icon a la derecha del label. API actual no lo soporta.

**Archivo:** `src/modules/core/components/Button.tsx`

**Cambio:**
```typescript
interface ButtonProps {
  // existing props
  iconRight?: keyof typeof MaterialIcons.glyphMap;
  iconLeft?: keyof typeof MaterialIcons.glyphMap;
}
```
Render icon adyacente al `Text` con `gap: theme.spacing.unit * 2` (8px) si existe. Color hereda de `accent.onPrimary` (primary variant).

**Ref:** Stitch `47dfbfa79e5d4cb1ba5709df0105e05b` — CTA "LOG IN → arrow_forward".

---

## FASE 2 — HabitCard layout match Stitch

**Razón:** Footer y orden de elementos no coincide con Stitch. Stitch: header (icon+name+badge) → grupo interno (Score:X.X + X% en misma fila + ProgressBar debajo). Actual: header → ProgressBar → footer (Score label + score number en filas separadas).

**Archivo:** `src/modules/habits/components/HabitCard.tsx`

**Cambios:**
1. Reordenar: ProgressBar va DESPUÉS de la fila score+percentage, no antes.
2. Fila score: izquierda `"Score: {score.toFixed(1)}"` (un solo `Text`) + derecha `"{compliance}%"` (porcentaje compliance, no score raw).
3. Mantener `CategoryBadge` size=sm showLabel=false a la izquierda del nombre.
4. Eliminar `LEVEL_LABELS` con emoji prefix — Stitch badge solo muestra label uppercase (ej. "SPROUT"). Emoji ya está en CategoryBadge.

**Ref:** Stitch `4d8af5e5a2194e1b8e4aaff30a80d618` — 4 habit cards.

---

## FASE 3 — Login redesign

**Razón:** Header actual usa `titleLg` (28px) — Stitch usa `display-sm` (56px weight 900 color `accent.primary`). Layout actual scrollable left-aligned — Stitch centered vertical+horizontal. Falta subtítulo, falta "Forgot?" link, falta form card wrapper, button sin icon.

**Archivo:** `app/(auth)/login.tsx`

**Cambios:**
1. Wrapper: `View` con `flex: 1`, `justifyContent: "center"`, `alignItems: "center"`, `paddingHorizontal: theme.spacing.marginMobile`. Quitar `Screen scrollable`.
2. Header `"MASTERY HABITS"`: `display-sm` 56px weight 900 color `theme.accent.primary`, centered, `marginBottom: theme.spacing.stackSm`.
3. Subtítulo `t("login.tagline")`: `label-caps` uppercase tracking-widest color `theme.text.secondary`, centered. Reusar key existente.
4. Form card wrapper: `View` con `backgroundColor: theme.bg.surfaceAlt`, `borderColor: theme.border.subtle`, `padding: theme.spacing.marginMobile`, `borderRadius: theme.radius.lg`, `width: "100%"`, `maxWidth: 480`.
5. Password label row: usar nuevo prop `labelRight` en `Input` o renderizar manual — `<Link href="#">Forgot?</Link>` color `theme.text.secondary`.
6. Button: usar `iconRight="arrow-forward"` (FASE 1).
7. Footer link "Register": estilo Stitch — texto secundario + link con `borderBottom` color `accent.primary`.

**i18n keys nuevos:**
- `login.tagline` → "BUILD THE DISCIPLINE. OWN THE RESULT." / "FORJÁ LA DISCIPLINA. ADUEÑATE DEL RESULTADO."
- `login.forgot` → "Forgot?" / "¿Olvidaste?"
- `login.no_account` → "Don't have an account?" / "¿No tenés cuenta?"

**Ref:** Stitch `47dfbfa79e5d4cb1ba5709df0105e05b`.

---

## FASE 4 — Signup redesign

**Razón:** Layout actual no coincide con Stitch register (`a65721334de5488aaa9e61337f166c56`). Fields ya correctos (name/email/password/confirm). Header puede mantener `titleLg` (Stitch usa title-lg también). Falta button icon, layout centered, link footer estilo Stitch.

**Archivo:** `app/(auth)/signup.tsx`

**Cambios:**
1. Wrapper centered (mismo patrón que Login).
2. Header `"Create Account"` mantener `titleLg` uppercase tracking-tighter.
3. Subtítulo `"Join the elite. Begin your mastery."` `bodyMain` color secundario.
4. Button con `iconRight="arrow-forward"`.
5. Footer link "Log in": underline + offset estilo Stitch.

**i18n keys nuevos:**
- `signup.tagline` → "Join the elite. Begin your mastery." / "Unite a la élite. Empezá tu maestría."
- `signup.have_account` → "Already have an account?" / "¿Ya tenés cuenta?"

**Ref:** Stitch `a65721334de5488aaa9e61337f166c56`.

---

## FASE 5 — Profile EDIT PROFILE button + level highlight

**Razón:** Acordado: agregar botón `EDIT PROFILE` además del Settings icon actual. HabitLevels card debe destacar nivel activo del usuario con `borderLeftWidth: 4` color `accent.primary` (patrón Stitch).

**Archivo:** `app/(tabs)/profile.tsx`

**Cambios:**
1. Identity card: agregar `Pressable` debajo de nombre/email con:
   - Label `"EDIT PROFILE"` en `label-caps` uppercase
   - Icon `edit` (MaterialIcons) a la derecha
   - Border `theme.border.default`, hover/press → border `accent.primary`
   - Ruta destino: `/settings` (mantener routing actual hasta que exista screen dedicado).
2. HabitLevels distribution: cada row tiene prop `isActive` (derivado de `getLevel(avgScore)`). Si activo → `borderLeftWidth: 4`, `borderLeftColor: theme.accent.primary`. Texto count → `accent.primary`.
3. Mantener Settings icon en top-right (acordado).

**i18n keys nuevos:**
- `profile.edit` → "EDIT PROFILE" / "EDITAR PERFIL"

**Ref:** Stitch `982721159650405a8a041dd3faec80e4`.

---

## FASE 6 — ActivityGrid GitHub-style

**Razón:** ActivityGrid actual es 10×7 flat sin estructura semanal y sin highlight de día actual. Stitch: contribution-grid con 14 cols mobile (semanas) × 7 rows (días de semana) + cell con ring para día actual.

**Archivo:** `app/(tabs)/stats.tsx` (función `ActivityGrid` interna)

**Cambios:**
1. Generar grid orientado por semana: 14 semanas × 7 días (98 cells, ~3.4 meses).
2. Estructurar con `flexDirection: "column"` por semana, columnas envueltas en row container.
3. Día actual: `borderWidth: 1`, `borderColor: theme.accent.primary` + glow opcional via shadow.
4. Mantener escala intensidad existente (`bg.elevated` → `accent.primary` con alpha).

**Ref:** Stitch `e0f05f2d26894f2d89b9c8fe83c55c3b` — sección "ACTIVITY".

---

## FASE 7 — Light theme validation

**Razón:** Stitch provee variantes light para Today/Stats/Power Grid. Sistema theming ya tiene `minimalLight` synced en FASE 2 previa. Esta fase NO toca código — solo valida visualmente y ajusta tokens si surge mismatch.

**Pasos:**
1. Switch a `minimalLight` via ThemePicker en Settings.
2. Recorrer 3 screens: `0be7da39e94444028b5025288048f531`, `5e880946d0a249a89b194f206292c0ef`, `6bf1a9e88cc24f82a46348fe6b92c8b4`.
3. Comparar visualmente. Si discrepancia → editar `src/modules/core/theming/themes/minimalLight.theme.ts`.

**Archivos potencialmente afectados:**
- `src/modules/core/theming/themes/minimalLight.theme.ts` (solo si discrepancia)

---

## Archivos críticos modificados (resumen)

| Fase | Archivo |
|---|---|
| 1 | `src/modules/core/components/Button.tsx` |
| 2 | `src/modules/habits/components/HabitCard.tsx` |
| 3 | `app/(auth)/login.tsx` |
| 4 | `app/(auth)/signup.tsx` |
| 5 | `app/(tabs)/profile.tsx` |
| 6 | `app/(tabs)/stats.tsx` |
| 7 | `src/modules/core/theming/themes/minimalLight.theme.ts` (condicional) |
| 3,4,5 | `src/modules/core/i18n/locales/{en,es}.ts` (keys nuevos) |

---

## Reutilización (no recrear)

- `Input` (`src/modules/core/components/Input.tsx`) — ya tiene underline style, soporta `label` + `error`. Reutilizar tal cual.
- `CategoryBadge` (`src/modules/habits/components/CategoryBadge.tsx`) — mantener en HabitCard.
- `ProgressBar` (`src/modules/core/components/ProgressBar.tsx`) — ya migrado a tokens.
- `Screen` (`src/modules/core/components/Screen.tsx`) — usar `scrollable=false` en auth screens; `scrollable=true` en dashboards.
- `useTheme` — todas las fases consumen tokens vía hook.
- `useTranslation` — todas las strings nuevas via i18n keys.

---

## Verification (end-to-end)

Por fase:

1. **Button**: render Login (post-FASE 3) y verificar icon visible a la derecha de "LOG IN".
2. **HabitCard**: dashboard con habits existentes — verificar orden score+% → bar → no duplicación de badges.
3. **Login**: comparar lado a lado con screenshot Stitch (`47dfbfa79e5d4cb1ba5709df0105e05b`). Verificar centrado vertical, header verde grande, subtítulo, "Forgot?" link, form card.
4. **Signup**: comparar con `a65721334de5488aaa9e61337f166c56`. Validar 4 campos + CTA icon.
5. **Profile**: comparar con `982721159650405a8a041dd3faec80e4`. Verificar botón EDIT PROFILE + Settings icon ambos presentes, nivel activo con left-border verde.
6. **Stats ActivityGrid**: comparar con `e0f05f2d26894f2d89b9c8fe83c55c3b` sección ACTIVITY. Validar día actual ring, estructura semanal.
7. **Light theme**: switch theme, recorrer 3 screens, comparar con IDs light.

**Comando dev:**
```bash
npx expo start --ios
# o --android
```

**Tests**: ninguna fase toca lógica de negocio (commitment/progression). Tests existentes (`commitment/__tests__`, `progression/__tests__`) deben seguir pasando sin cambios.

---

## Orden ejecución recomendado

`1 → 2 → 3 → 4 → 5 → 6 → 7`

FASE 1 bloquea 3 y 4 (Button icon). Resto independiente.
