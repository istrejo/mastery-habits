# Master Prompt: Mastery Habits — Ionic + Angular 21 (Standalone)

> **Contexto:** Este prompt se ejecuta **dentro de un proyecto Ionic + Angular ya existente** creado previamente con `ionic start`. No se debe crear el proyecto desde cero. Solo instalar dependencias faltantes y escribir código.
>
> **Objetivo:** Implementar la app **Mastery Habits** usando **Ionic + Angular 21** en modo **standalone** (sin `NgModules`), manteniendo la misma lógica de negocio, las mismas tablas de Supabase y la misma división de funcionalidades por feature.

---

## 1. Contexto del Proyecto

**Mastery Habits** es una app de productividad que combina:

- **Hábitos con streaks**: CRUD de hábitos, marcado diario, cálculo de rachas.
- **Tareas (Today View)**: lista de tareas con prioridad y fecha de vencimiento.
- **Pomodoro**: timer local configurable (work/break durations).
- **Autenticación**: email/password + Google OAuth vía Supabase Auth.
- **Configuración**: tema (light/dark/system) y configuración del timer.

---

## 2. Vistas de la App (Mapeo 1:1)

Recrear **exactamente** estas pantallas. El enrutamiento usa Angular Router + Ionic Tabs (no file-based routing).

### Auth (no tabs)
| Ruta | Vista | Descripción |
|------|-------|-------------|
| `/login` | **LoginPage** | Email + password, validación con Zod, toggle visibilidad de password, error handling (email no confirmado redirige a `/confirm`), botón Google OAuth. |
| `/signup` | **SignupPage** | Registro con email/password, validación Zod, confirmación de password. |
| `/confirm` | **ConfirmPage** | Pantalla post-registro para confirmar email. Recibe email por query param. |
| `/forgot-password` | **ForgotPasswordPage** | Solicitar reset de password. |

### Main Tabs
| Ruta | Vista | Descripción |
|------|-------|-------------|
| `/tabs/today` | **TodayPage** | **Today View**: lista de tareas filtradas por `user_id` + `due_date = hoy`. Mostrar prioridad, checkbox para completar. |
| `/tabs/habits` | **HabitsPage** | Lista de hábitos del usuario. Cada item muestra nombre, frecuencia (daily/weekly), streak actual. Botón para marcar como completado hoy. |
| `/tabs/pomodoro` | **PomodoroPage** | Timer visual grande. Controles: start/pause/reset. Configurable desde settings. Estado **100% local/ephemeral** (solo durations se sincronizan). |
| `/tabs/settings` | **SettingsPage** | Preferencias: tema (light/dark/system), duraciones del pomodoro (work/break). Guarda en `profiles` de Supabase. |

### Dev-only
| Ruta | Vista | Descripción |
|------|-------|-------------|
| `/dev/ui-kit` | **UiKitPage** | Showcase de componentes compartidos (solo en dev). |

> **Nota**: Todas las rutas bajo `/tabs` usan `ion-tabs` + `ion-tab-bar` con 4 tabs. Las rutas de auth usan un layout limpio sin tabs ni menú.

---

## 3. Stack Tecnológico Objetivo

| Capa | Tecnología | Notas |
|------|-----------|-------|
| Framework | **Angular 21** | Standalone por defecto. Zoneless change detection opcional. Signals-first. |
| UI / Mobile | **Ionic 8+** | `@ionic/angular/standalone`. Usar `ion-*` components. |
| Router | **Angular Router** | Lazy loading con `loadComponent`. Guards funcionales con `inject()`. |
| Backend / Auth | **Supabase** | Reutilizar el proyecto existente (`nvpkgrqfzrcwgigztymp`). |
| Tipos DB | **Supabase CLI** | `supabase gen types typescript` → `src/shared/types/database.types.ts`. |
| Validación | **Zod** | **Reutilizar** — es agnóstico. Usar para schemas de forms y parseo de datos. |
| Fechas | **date-fns** | **Reutilizar** — funciona igual en Angular. |
| Estilos | **Ionic CSS Variables** + CSS puro/SCSS | Reemplaza NativeWind/Tailwind. Usar variables de Ionic para theming. |
| Storage local | **Capacitor Preferences** o `localStorage` | Reemplaza AsyncStorage/MMKV. Usar Capacitor Preferences para persistencia cross-platform. |

---

## 4. Tecnologías: ¿Qué Reutilizar vs Alternativa Angular?

| Tecnología Original | Reutilizar | Alternativa en Angular | Justificación |
|---------------------|-----------|------------------------|---------------|
| `@supabase/supabase-js` | **Sí** | — | El cliente de Supabase es agnóstico de framework. Singleton en `src/core/api/supabase.ts`. |
| `zod` | **Sí** | — | Agnóstico. Integrar con Reactive Forms mediante parse manual o librerías como `ngx-zod`. |
| `date-fns` | **Sí** | — | Funciona idénticamente. Usar para formateo de fechas y cálculo de streaks. |
| **Zustand** | **No** | **Angular Signals** (`@angular/core/signals`) | Signals es el estándar oficial de estado local en Angular. Para estado complejo usar `@ngrx/signals`. |
| **TanStack Query (React)** | **No** | **TanStack Query Angular** (`@tanstack/angular-query-experimental`) | Mismo concepto: cacheo de server state, invalidación, loading/error states. Es la alternativa directa. |
| **React Hook Form** | **No** | **Angular Reactive Forms** | Nativo de Angular. Usar `FormBuilder` + `FormGroup` + validadores custom con Zod. |
| **Expo Router** | **No** | **Angular Router** | Declarative routing con `Routes` array. Lazy loading con `loadComponent`. |
| **NativeWind / Tailwind** | **No** | **Ionic Theming** | Ionic ya maneja theming via CSS variables (`--ion-color-primary`, etc.). Usar SCSS si se necesita más. |
| **AsyncStorage / MMKV** | **No** | **Capacitor Preferences** | API simple de key-value para Capacitor/Ionic. Alternativa: `localStorage` para web. |

---

## 5. Arquitectura de Directorios (Sugerencia)

> **Nota:** El usuario define la estructura final. Esta es una guía basada en la app actual.

```
src/
  main.ts                    # bootstrapApplication con providers globales
  app/
    app.config.ts              # provideRouter, provideHttpClient, providers de Supabase
    app.routes.ts              # Definición de rutas lazy-loaded
    core/
      api/
        supabase.ts            # Singleton: createClient(env.url, env.key)
      constants/
        env.ts                 # Variables de entorno (supabaseUrl, supabaseAnonKey)
      guards/
        auth.guard.ts          # Guard funcional: redirige a /login si no hay sesión
        public.guard.ts        # Guard funcional: redirige a /tabs/today si ya hay sesión
      services/
        storage.service.ts     # Wrapper sobre Capacitor Preferences / localStorage
    features/
      auth/
        pages/
          login.page.ts
          signup.page.ts
          confirm.page.ts
          forgot-password.page.ts
        services/
          auth.service.ts      # signIn, signUp, signOut, resetPassword, getSession
          auth-errors.service.ts  # Mapeo de errores de Supabase a mensajes amigables
        schemas/
          auth.schema.ts       # Zod schemas para login/signup
        components/            # Shared auth UI (si aplica)
      habits/
        pages/
          habits.page.ts
        components/            # HabitItem, HabitList, etc.
        services/
          habits.service.ts    # CRUD de hábitos + streak calculation
        models/              # Tipos derivados de DB (opcional)
      pomodoro/
        pages/
          pomodoro.page.ts
        components/            # TimerDisplay, TimerControls
        services/
          pomodoro.service.ts  # Lógica del timer (intervals, estados)
        stores/              # Signals para estado del timer (ephemeral)
      settings/
        pages/
          settings.page.ts
        services/
          settings.service.ts  # Update profile (theme, pomodoro durations)
      today/
        pages/
          today.page.ts
        components/            # TaskItem, TaskList
        services/
          tasks.service.ts     # CRUD de tareas + filtro por due_date
    shared/
      types/
        database.types.ts      # Auto-generado por Supabase CLI
      ui/
        button.component.ts
        card.component.ts
        checkbox.component.ts
        index.ts               # Barrel export
      utils/
        date.utils.ts          # Helpers con date-fns
```

---

## 6. Reglas de Oro — Angular 21 Standalone Moderno

1. **No `NgModule`**: Todo es `standalone: true`. Importar componentes/directivas directamente en el `imports` array de cada componente.
2. **Nueva sintaxis de control flow**: Usar `@if`, `@for`, `@switch`, `@empty` en templates. **NO** usar `*ngIf`, `*ngFor`, `*ngSwitch`.
3. **Signals para estado local**: Usar `signal()`, `computed()`, `effect()` de `@angular/core`. Reemplaza completamente a Zustand para estado local.
4. **`inject()` para inyección de dependencias**: Usar `inject()` en lugar de constructor injection. Ejemplo: `private readonly authService = inject(AuthService)`.
5. **Lazy loading**: Todas las rutas deben usar `loadComponent`.
6. **OnPush por defecto**: Usar `changeDetection: ChangeDetectionStrategy.OnPush` en todos los componentes.
7. **Inputs/Outputs modernos**: Usar `input()`, `output()`, `model()` de `@angular/core` en lugar de `@Input()` / `@Output()`.
8. **Ionic standalone**: Importar componentes Ionic desde `@ionic/angular/standalone`. Ejemplo: `import { IonButton, IonContent } from '@ionic/angular/standalone';`.
9. **Zoneless opcional**: Si el proyecto usa `provideExperimentalZonelessChangeDetection()`, respetarlo. Signals disparan cambios sin Zone.js.
10. **No `async` pipe en templates**: Preferir `toSignal()` de `@angular/core/rxjs-interop` para convertir Observables a Signals. O usar directamente TanStack Query.

---

## 7. Conexión a Supabase

### Singleton del Cliente
```typescript
// src/core/api/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { environment } from '../constants/env';
import { Database } from '../../shared/types/database.types';

export const supabase = createClient<Database>(
  environment.supabaseUrl,
  environment.supabaseAnonKey
);
```

### Autenticación
- Usar `supabase.auth.signInWithPassword()`, `signUp()`, `signOut()`, `resetPasswordForEmail()`.
- Escuchar cambios de sesión con `supabase.auth.onAuthStateChange()`.
- **Persistencia de sesión**: Supabase ya maneja la sesión en `localStorage` por defecto. No reinventar.
- **AuthGuard**: Guard funcional que chequee `supabase.auth.getSession()` y redirija.

### Tipos de Base de Datos
- Ejecutar: `supabase gen types typescript --project-id nvpkgrqfzrcwgigztymp --schema public > src/shared/types/database.types.ts`
- Consumir como: `Database['public']['Tables']['habits']['Row']`.
- **Nunca escribir tipos a mano** que ya existan en `database.types.ts`.

### Row Level Security (RLS)
- Todas las tablas tienen RLS activado. Todas las queries deben respetar las políticas existentes.
- El cliente de Supabase usa el `user_id` del JWT automáticamente.

---

## 8. Manejo del Estado

### Split de Estado (mismo principio que la app original)

| Tipo de Estado | Herramienta Angular | Ejemplo |
|----------------|---------------------|---------|
| **Server State** (datos de Supabase) | **TanStack Query Angular** (`@tanstack/angular-query-experimental`) | Lista de hábitos, tareas, perfil del usuario. Cache, refetch, invalidación. |
| **Local / Optimistic State** | **Angular Signals** | Estado del timer pomodoro, formularios, UI toggles (password visibility), theme. |
| **Persistente Local** | **Capacitor Preferences** | Preferencias que deben sobrevivir a reloads (aunque el theme ya se sincroniza a Supabase). |

### Signals: Patrón Recomendado
```typescript
// Ejemplo: estado de autenticación con signals
import { signal, computed } from '@angular/core';
import { Session, User } from '@supabase/supabase-js';

export const authState = {
  session: signal<Session | null>(null),
  user: computed(() => authState.session()?.user ?? null),
  isLoading: signal(true),
  isAuthenticated: computed(() => !!authState.session()),
};
```

### TanStack Query Angular
- Usar `injectQuery()`, `injectMutation()` para leer/escribir datos de Supabase.
- Las queries se invalidan automáticamente después de mutaciones.
- **Nunca** pongas datos que vienen del servidor **solo** en Signals — deja que Query los cachee.

---

## 9. AuthGuard (Funcional)

```typescript
// src/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

export const authGuard = async () => {
  const router = inject(Router);
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};

export const publicGuard = async () => {
  const router = inject(Router);
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    router.navigate(['/tabs/today']);
    return false;
  }
  return true;
};
```

---

## 10. Pomodoro: Timer 100% Local

- El estado del timer debe vivir en un `signal` o en un service con ` Injectable({ providedIn: 'root' })`.
- Usar `setInterval`/`clearInterval` o `interval()` de RxJS. Preferir **RxJS** para timers que se cancelan limpiamente.
- **Solo** las configuraciones de duración (work, break) se persisten en la tabla `profiles`.
- **No** crear tabla de historial de sesiones pomodoro.

---

## 11. Formularios + Validación

- Usar **Reactive Forms** nativos de Angular (`FormBuilder`, `FormGroup`, `FormControl`).
- Integrar Zod para validación custom: crear un helper que corra `schema.safeParse()` y mapee los errores a `ValidationErrors` de Angular.
- **Ejemplo**:
```typescript
import { z } from 'zod';
import { AbstractControl, ValidationErrors } from '@angular/forms';

export function zodValidator<T>(schema: z.ZodSchema<T>) {
  return (control: AbstractControl): ValidationErrors | null => {
    const result = schema.safeParse(control.value);
    return result.success ? null : { zod: result.error.flatten() };
  };
}
```

---

## 12. Datos y Sincronización

### Tablas existentes en Supabase
- `profiles`: `user_id` PK, `theme_preference`, `pomodoro_work_duration`, `pomodoro_break_duration`, `updated_at`.
- `habits`: `id`, `user_id`, `name`, `description`, `frequency` (daily/weekly), `current_streak`, `created_at`, `updated_at`.
- `habit_logs`: `id`, `habit_id`, `user_id`, `completed_date` (DATE, no timestamp), `created_at`. UNIQUE `(habit_id, completed_date)`.
- `tasks`: `id`, `user_id`, `title`, `description`, `priority` (low/medium/high), `due_date`, `completed`, `created_at`, `updated_at`.

### Reglas de Datos
- `updated_at` se actualiza con trigger `set_updated_at()`.
- `habit_logs.completed_date` es tipo `DATE`. Evitar timezone mismatches.
- Streaks (`current_streak`) se calculan **desde el frontend** después de insertar un log exitoso. No hay trigger en DB.
- FK indexes en todas las columnas `user_id`.

---

## 13. Checklist de Implementación

> **Nota:** El proyecto Ionic + Angular ya existe. No crearlo. Solo instalar dependencias y escribir código.

### Phase 1: Instalación y Configuración
- [ ] Instalar dependencias: `@supabase/supabase-js`, `zod`, `date-fns`, `@tanstack/angular-query-experimental`, `@capacitor/preferences`
- [ ] Configurar `app.config.ts` con `provideRouter`, `provideHttpClient`, providers de Supabase/TanStack Query
- [ ] Generar `database.types.ts` con Supabase CLI
- [ ] Crear `supabase.ts` singleton
- [ ] Configurar path aliases en `tsconfig.json` si se usan (opcional)

### Phase 2: Auth
- [ ] Implementar `AuthService` (signIn, signUp, signOut, getSession, onAuthStateChange)
- [ ] Crear Zod schemas para login/signup
- [ ] Implementar `LoginPage`, `SignupPage`, `ConfirmPage`, `ForgotPasswordPage`
- [ ] Crear `authGuard` y `publicGuard`
- [ ] Configurar rutas de auth lazy-loaded en `app.routes.ts`

### Phase 3: Layout Principal (Tabs)
- [ ] Crear `TabsPage` con `ion-tabs` y `ion-tab-bar`
- [ ] Configurar rutas hijas: `/tabs/today`, `/tabs/habits`, `/tabs/pomodoro`, `/tabs/settings`
- [ ] Proteger ruta padre `/tabs` con `authGuard`

### Phase 4: Features
- [ ] **Today**: `TasksService` con TanStack Query + `TodayPage`
- [ ] **Habits**: `HabitsService` + cálculo de streaks + `HabitsPage`
- [ ] **Pomodoro**: Timer con Signals/RxJS + `PomodoroPage`
- [ ] **Settings**: Form para tema y duraciones + `SettingsService`

### Phase 5: Shared UI
- [ ] Implementar `ButtonComponent`, `CardComponent`, `CheckboxComponent`
- [ ] Crear barrel export `src/shared/ui/index.ts`
- [ ] Crear `UiKitPage` (dev-only) para showcase

### Phase 6: Polish
- [ ] Tema light/dark/system con variables de Ionic
- [ ] Animaciones de entrada/salida (Ionic tiene `NavAnimations`)
- [ ] Splash screen y iconos (Capacitor)
- [ ] Manejo de errores global (toast service)

---

## 14. Notas Importantes

- **Proyecto existente**: No ejecutar `ionic start`, `ng new`, ni crear estructura de carpetas base. El proyecto ya está creado. Solo agregar código dentro del `src/` existente.
- **Standalone obligatorio**: No crear ningún `NgModule`. Ni `AppModule`, ni feature modules. Todo se configura en `app.config.ts` y en `imports` de cada componente.
- **Supabase es el backend**: No replicar validaciones de negocio que RLS ya resuelve, pero sí validar inputs de usuario antes de enviar.
- **Pomodoro es local**: Respetar la decisión de que el timer no tiene persistencia de sesiones. Solo configuraciones.
- **No inventar tablas nuevas**: Usar exactamente las mismas tablas y constraints que ya existen en Supabase.
- **Zustand → Signals**: El paradigma es diferente. Signals son más granulares. No trates de replicar 1:1 un store monolítico; aprovecha la reactividad fina de Signals.
- **TanStack Query Angular**: Es experimental pero funcional. Alternativa: usar RxJS + `shareReplay()` manual, pero se pierde cacheo inteligente. Recomendado usar TanStack Query.
- **Angular 21**: Asumir que el proyecto usa la API más moderna de Angular (standalone por defecto, control flow, signals inputs/outputs). Si algo falla por versión, ajustar al mínimo compatible.

---

**Fin del Master Prompt.**
