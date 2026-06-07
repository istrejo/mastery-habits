# Pendie Auth Screens — Plan de ejecución (continuación)

**Origen**: Plan de Cloud Code (`plan-auth-screens.md`) que se quedó sin créditos a mitad de ejecución
**Fecha de reanudación**: 2026-06-07
**Corrección aplicada**: NO usar carpetas `atoms/` y `molecules/` — flat structure según convención de la arquitectura

---

## Contexto y decisiones

- **Diseño**: Stitch project `2673083030812216083` (Pendie Task & Habit Tracker) — `designMd` con paleta Material 3 completa
- **Theming**: CSS custom properties + NativeWind `vars()` en `src/core/theme/` (light theme en uso, dark stub)
- **Auth backend**: Supabase con cliente en `src/core/api/supabase.ts`, expuesto vía `src/features/auth/services/authService.ts`
- **Arquitectura**: Feature-sliced con `src/features/{feature}/components/` para componentes feature-specific y `src/shared/ui/` para primitivos cross-feature
- **Atomic design**: **DESCARTADO**. No usamos carpetas `atoms/` ni `molecules/`. Regla de decisión:
  - Si 2+ features lo usan → `src/shared/ui/`
  - Si solo 1 feature lo usa → `src/features/{feature}/components/`
  - Si es route-level → `app/{route}.tsx`

---

## Estado actual (lo que Cloud Code construyó)

✅ **Hecho** (todo lo que sigue ya existe en el código):

| Componente / archivo | Estado |
|---|---|
| `src/core/theme/tokens.ts` | ✅ Pendiente DS completo (50+ tokens) |
| `src/core/theme/ThemeProvider.tsx` | ✅ Switch light/dark con `vars()` de nativewind |
| `tailwind.config.js` | ✅ Tokens wireados a CSS vars, typography scale, radii, spacing |
| `src/shared/ui/Button.tsx` | ✅ Migrado a tokens nuevos |
| `src/shared/ui/Checkbox.tsx` | ✅ Migrado a tokens nuevos |
| `src/features/auth/services/authService.ts` | ✅ `signIn`, `signUp`, `sendPasswordReset`, `verifyOtp`, `resendVerification` |
| `src/features/auth/components/AuthLayout.tsx` | ✅ Shell con AppLogo + AuthCard |
| `app/(auth)/login.tsx` | ✅ Implementado con useForm + FloatingLabelField + GoogleSignIn |
| `app/(auth)/signup.tsx` | ✅ Implementado con useForm + LabeledField + PasswordField |
| `app/(auth)/confirm.tsx` | ✅ Implementado con OTPForm + resend |
| `app/(auth)/forgot-password.tsx` | ✅ Implementado con LabeledField + success state inline |

🔴 **Pendiente** (lo que voy a hacer ahora):

| Tarea | Por qué |
|---|---|
| Aplanar `src/features/auth/components/atoms/` | Rompe convención del codebase (atomic design no encaja) |
| Aplanar `src/features/auth/components/molecules/` | Idem |
| Redistribuir 10 componentes a flat structure | Ver tabla de migración abajo |
| Borrar `FormField.tsx` y `PasswordInput.tsx` | Reemplazados por `LabeledField` y `PasswordField` (los "molecules") |
| Borrar `AuthProvider.tsx` | Dead code (la guardia real está inline en `app/_layout.tsx`) |
| Actualizar imports en 4 screens + `AuthLayout.tsx` | Apuntan a paths de atoms/molecules que ya no existen |
| Actualizar `src/shared/ui/index.ts` barrel | Agregar los 4 nuevos shared primitives |

---

## Plan de migración (mover de `atoms/` y `molecules/` a flat)

### Regla aplicada
- **Shared (2+ features potenciales)** → `src/shared/ui/`
- **Auth-specific (1 feature por ahora)** → `src/features/auth/components/`

### Movimientos

| Desde | Hacia | Razón |
|---|---|---|
| `components/atoms/AppLogo.tsx` | `components/AppLogo.tsx` | Solo auth por ahora |
| `components/atoms/EyeToggle.tsx` | `components/EyeToggle.tsx` | Solo auth (password feature viene después) |
| `components/atoms/FormDivider.tsx` | `src/shared/ui/FormDivider.tsx` | Genérico, reusable en cualquier social login |
| `components/atoms/OTPDigitInput.tsx` | `components/OTPDigitInput.tsx` | Solo auth por ahora |
| `components/molecules/AuthCard.tsx` | `components/AuthCard.tsx` | Auth-specific (no aplica a otros flows) |
| `components/molecules/FloatingLabelField.tsx` | `src/shared/ui/FloatingLabelField.tsx` | Genérico, reusable en settings/search/etc |
| `components/molecules/GoogleSignInButton.tsx` | `components/GoogleSignInButton.tsx` | Solo auth |
| `components/molecules/LabeledField.tsx` | `src/shared/ui/LabeledField.tsx` | Genérico |
| `components/molecules/OTPForm.tsx` | `components/OTPForm.tsx` | Solo auth por ahora |
| `components/molecules/PasswordField.tsx` | `src/shared/ui/PasswordField.tsx` | Genérico (settings: change password) |
| `components/atoms/index.ts` | **DELETE** | Reemplazado por barrels apropiados |
| `components/molecules/index.ts` | **DELETE** | Idem |
| `components/FormField.tsx` | **DELETE** | Reemplazado por `shared/ui/LabeledField.tsx` |
| `components/PasswordInput.tsx` | **DELETE** | Reemplazado por `shared/ui/PasswordField.tsx` |
| `components/AuthProvider.tsx` | **DELETE** | Dead code (guardia inline en `app/_layout.tsx`) |

### Nuevos barrel exports
- `src/shared/ui/index.ts` debe agregar: `FormDivider`, `FloatingLabelField`, `LabeledField`, `PasswordField`
- Auth-specific components: imports directos, sin barrel (son internos al feature)

### Imports a actualizar en consumidores

| Archivo | Cambios |
|---|---|
| `app/(auth)/login.tsx` | `FloatingLabelField` (path), `FormDivider` (path), `GoogleSignInButton` (path), `EyeToggle` (path), `AuthCard` (path) |
| `app/(auth)/signup.tsx` | `AuthCard` (path), `LabeledField` (path), `PasswordField` (path), `FormDivider` (path), `GoogleSignInButton` (path) |
| `app/(auth)/confirm.tsx` | `AuthCard` (path), `OTPForm` (path) |
| `app/(auth)/forgot-password.tsx` | `AuthCard` (path), `LabeledField` (path) |
| `app/(auth)/_layout.tsx` | Probablemente `AuthLayout` path |
| `src/features/auth/components/AuthLayout.tsx` | Imports de `AppLogo` y `AuthCard` (paths) |
| `src/shared/ui/FloatingLabelField.tsx` | Import de `EyeToggle` cambia de `../atoms/EyeToggle` a `../../features/auth/components/EyeToggle` |
| `src/shared/ui/PasswordField.tsx` | Idem |
| `src/features/auth/components/OTPForm.tsx` | Import de `OTPDigitInput` cambia a `./OTPDigitInput` |

### Verificación post-migración
- `grep -r "components/atoms\|components/molecules" app/ src/` debe dar **0 resultados**
- `grep -r "FormField\|PasswordInput\|AuthProvider" app/ src/` debe dar **0 referencias de import**
- `git status` debe mostrar solo moves (renames), no adds/deletes confusos
- TS typecheck sin errores

---

## Riesgos y consideraciones

1. **`git mv` vs `mv`**: usar `git mv` para preservar el rename history. Si git no detecta rename (archivos modificados después), agregar `--follow` o forzar el rename manualmente.
2. **Barrel exports rotos transitorios**: durante la migración, los imports quedan apuntando a paths que no existen por unos minutos. Hacerlo todo en un solo commit limpio.
3. **FormField y PasswordInput**: ya NO se usan (los screens usan `LabeledField` y `PasswordField`). Confirmado por grep — solo `PasswordInput.tsx` los referencia internamente, y va a borrarse.
4. **ThemeProvider.tsx usa `vars()` de nativewind**: verificar que `darkMode: 'class'` o equivalente no sea necesario. Si `vars()` aplica el theme via style en lugar de class, no hace falta darkMode en config. Verificar.
5. **Dark mode real**: tokens.ts tiene un dark stub con los mismos valores que light. Pendiente real: poblar la paleta dark correcta. No es parte de este PR.
6. **Confirm screen con OTP**: el plan original dice "4 boxes" pero `OTPDigitInput` puede componer 4 o 6. Verificar en confirm.tsx actual.

---

## Orden de ejecución

```
1. git mv todos los archivos a sus destinos
2. Editar imports dentro de archivos movidos (FloatingLabelField, PasswordField, OTPForm)
3. Editar imports en 4 screens + AuthLayout + _layout
4. Borrar archivos obsoletos (FormField, PasswordInput, AuthProvider, 2 index.ts)
5. Actualizar src/shared/ui/index.ts barrel
6. grep -r verificación
7. tsc --noEmit (si está configurado)
8. commit único "chore: flatten auth components, remove atomic design folders"
```

---

## Contexto de la regla atomic vs flat (para futuras decisiones)

**Por qué NO atomic design en este codebase**:
- Feature-sliced ya separa "shared" de "feature-specific". Esa es la clasificación que aporta valor.
- Atomic design agrega un segundo eje ortogonal (atoms/molecules/organisms) que entra en conflicto con la organización por feature.
- El test: "¿`TextField` con label y error es átomo o molécula?" → no hay respuesta clara, y la respuesta no cambia el código.
- La regla más simple: **"¿Cuántas features lo van a usar?"** → 1 = `src/features/{feature}/components/`, 2+ = `src/shared/ui/`.

**Cuándo SÍ considerar atomic design**:
- Equipos con design system team separado del dev team
- Catálogos de componentes publicados como librería npm
- Proyectos donde el "lenguaje de diseño" se discute por niveles (átomos vs moléculas) con stakeholders no-técnicos

Ninguno aplica acá. Pendie es un producto chico, 1 equipo, 1 design system. La regla shared/feature-specific alcanza.
