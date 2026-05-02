# Master Prompt — Mastery Habits (Claude Code)

> **Instrucciones para Claude Code:** Lee este documento completo antes de empezar. Trabaja **dentro de la carpeta actual** (no crees subcarpeta para el proyecto). Ejecuta las fases en orden estricto. Al finalizar cada fase, genera un commit con mensaje convencional (`feat:`, `chore:`, `db:`) y espera validación humana antes de pasar a la siguiente fase. No saltes fases.

---

## 0. Contexto del producto

**Mastery Habits** es un rastreador de hábitos de alta fidelidad que sustituye las listas de tareas por un sistema de **Commitment Score** y **niveles de maestría**. El usuario no marca tareas: cultiva un score de vida que decae si no es consistente. La gamificación es analítica, no superficial.

**Diferenciador clave:** un Promedio Ponderado Móvil con Decaimiento que castiga la inconsistencia y recompensa la disciplina sostenida.

---

## 1. Stack técnico (no negociable)

| Capa          | Tecnología                                                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Framework     | React Native + Expo (SDK estable más reciente)                                                                                       |
| Navegación    | **Expo Router** (file-based, en `app/`)                                                                                              |
| Estilos       | NativeWind (Tailwind para RN)                                                                                                        |
| Estado global | **Zustand** con persistencia (`zustand/middleware`) para datos compartidos entre módulos (sesión, score activo, hábito seleccionado) |
| Backend       | Supabase (PostgreSQL + Auth + RLS + RPC)                                                                                             |
| Forms         | `react-hook-form` + `zod`                                                                                                            |
| Fechas        | `date-fns` (semanas ISO)                                                                                                             |
| Testing       | Jest + React Native Testing Library — solo para `commitment/` y `progression/`                                                       |
| Lenguaje      | TypeScript **estricto** (`strict: true`, `noUncheckedIndexedAccess: true`)                                                           |

---

## 2. Arquitectura — Screaming Architecture

**Regla de oro:** los nombres de carpeta gritan **qué hace** la app, no qué tecnología usa. Un dev nuevo abre `src/modules/` y entiende el dominio en 10 segundos.

```
./
├── app/                          # Expo Router — rutas file-based
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx             # Dashboard
│   │   └── profile.tsx
│   ├── habit/[id].tsx            # Detalle de hábito
│   ├── habit/new.tsx             # Crear hábito
│   └── _layout.tsx               # Root layout (auth gate)
├── src/
│   ├── assets/
│   ├── modules/
│   │   ├── core/                 # Design System, Supabase client, hooks globales
│   │   │   ├── components/       # Button, Card, Modal, Input, ProgressBar
│   │   │   ├── hooks/
│   │   │   ├── lib/              # supabase.ts (client)
│   │   │   ├── states/           # session.store.ts (Zustand)
│   │   │   └── utils/
│   │   ├── auth/                 # SignUp, Login, Magic Link, Profile
│   │   │   ├── components/
│   │   │   ├── hooks/            # useAuth.ts
│   │   │   ├── services/         # auth.service.ts
│   │   │   └── states/           # auth.store.ts
│   │   ├── habits/               # CRUD de hábitos, listas, categorías
│   │   │   ├── components/       # HabitCard, HabitForm, FrequencySelector
│   │   │   ├── hooks/            # useHabits.ts, useHabit.ts
│   │   │   ├── services/         # habits.service.ts
│   │   │   ├── states/           # habits.store.ts
│   │   │   ├── utils/
│   │   │   └── types/
│   │   ├── check-in/             # Marcar día, skip logic, validaciones
│   │   │   ├── components/       # CheckInButton, SkipModal
│   │   │   ├── hooks/            # useCheckIn.ts
│   │   │   ├── services/         # checkin.service.ts
│   │   │   ├── states/
│   │   │   └── utils/            # isPlannedDay.ts, hasUsedSkipThisWeek.ts
│   │   ├── commitment/           # Motor del Score
│   │   │   ├── hooks/            # useCommitmentScore.ts
│   │   │   ├── services/         # score.service.ts (llama RPC)
│   │   │   ├── states/           # score.store.ts
│   │   │   └── utils/            # calculateScore.ts (réplica TS de la RPC para tests)
│   │   └── progression/          # Niveles Seed → Ancient
│   │       ├── components/       # MasteryBadge, LevelProgress
│   │       ├── hooks/            # useMasteryLevel.ts
│   │       ├── utils/            # getLevel.ts, LEVELS constant
│   │       └── types/
│   └── shared/
│       ├── types/                # Tipos globales (Database type generado por Supabase CLI)
│       └── constants/
├── supabase/
│   ├── migrations/
│   │   ├── 0001_initial_schema.sql
│   │   ├── 0002_rls_policies.sql
│   │   └── 0003_rpc_functions.sql
│   └── seed.sql
├── app.json
├── tsconfig.json
├── tailwind.config.js
├── package.json
└── README.md
```

**Reglas de import:**

- Un módulo **nunca** importa internamente de otro módulo. Solo de `core/`, `shared/` o exporta vía `index.ts` público.
- Cada módulo expone su API pública en `modules/<modulo>/index.ts`.
- Configura paths en `tsconfig.json`: `@core/*`, `@auth/*`, `@habits/*`, etc.

---

## 3. Lógica de negocio

### 3.1. Commitment Score

Fórmula recursiva con decaimiento:

```
Score_today = (Score_yesterday × 0.8) + (Compliance_today × 20)
```

Donde `Compliance_today`:

- `1` si el día estaba planificado y se cumplió (o se usó el skip semanal).
- `0` si el día estaba planificado y NO se cumplió.
- **No se evalúa** en días no planificados (el score se mantiene igual: `Score_today = Score_yesterday`).

Score inicial: `0`. Rango: `0–100`.

### 3.2. Niveles de Maestría

| Nivel      | Rango  | Significado        |
| ---------- | ------ | ------------------ |
| 🌱 Seed    | 0–20   | Iniciación         |
| 🌿 Sprout  | 21–45  | Formación de racha |
| 🌳 Tree    | 46–70  | Hábito arraigado   |
| 🌲 Forest  | 71–90  | Disciplina sólida  |
| 🗿 Ancient | 91–100 | Maestría total     |

### 3.3. Grace Period (Regla de Oro)

- **1 skip por semana ISO por hábito.**
- El skip cuenta como cumplimiento (`Compliance = 1`) y no rompe la racha.
- Si el usuario falla un día planificado y NO ha usado el skip de esa semana ISO → puede convertir ese fallo en skip retroactivamente desde el modal correspondiente.
- El skip aplica únicamente a **días planificados**.

### 3.4. Frecuencia

- Configurable: array de días de la semana (`[1,3,5]` = Lun/Mié/Vie, ISO 1–7).
- El score solo decae en días planificados no cumplidos.
- Días no planificados no afectan al score.

### 3.5. Forward-only

- El usuario solo puede marcar el **día actual** (no días pasados).
- El score se calcula incrementalmente cada día. No hay edición retroactiva (excepto el mecanismo de skip descrito arriba).

### 3.6. Cálculo del score (persistencia)

- El score se **persiste** en la tabla `mastery_scores` (una fila por hábito, actualizada).
- Tras cada check-in, el cliente invoca la RPC `update_habit_score(habit_id, check_date)` que:
  1. Lee `mastery_scores.score` actual.
  2. Aplica la fórmula.
  3. Recalcula nivel.
  4. Hace `UPSERT` en `mastery_scores`.
  5. Devuelve `{ score, level }`.

---

## 4. Modelo de datos (SQL completo)

### 4.1. Migración `0001_initial_schema.sql`

```sql
-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  created_at timestamptz default now() not null
);

-- habits
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  description text,
  category text,
  frequency_days smallint[] not null check (
    array_length(frequency_days, 1) between 1 and 7
    and frequency_days <@ array[1,2,3,4,5,6,7]::smallint[]
  ),
  created_at timestamptz default now() not null,
  archived_at timestamptz
);

create index idx_habits_user on public.habits(user_id) where archived_at is null;

-- check_ins
create type public.checkin_status as enum ('completed', 'skipped', 'missed');

create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  check_date date not null,
  status public.checkin_status not null,
  created_at timestamptz default now() not null,
  unique(habit_id, check_date)
);

create index idx_checkins_habit_date on public.check_ins(habit_id, check_date desc);

-- mastery_scores (persistencia del score actual)
create table public.mastery_scores (
  habit_id uuid primary key references public.habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  score numeric(5,2) not null default 0 check (score between 0 and 100),
  level text not null default 'seed' check (level in ('seed','sprout','tree','forest','ancient')),
  last_calculated_date date,
  updated_at timestamptz default now() not null
);
```

### 4.2. Migración `0002_rls_policies.sql`

```sql
alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.check_ins enable row level security;
alter table public.mastery_scores enable row level security;

-- profiles
create policy "users_own_profile_select" on public.profiles
  for select using (auth.uid() = id);
create policy "users_own_profile_update" on public.profiles
  for update using (auth.uid() = id);
create policy "users_own_profile_insert" on public.profiles
  for insert with check (auth.uid() = id);

-- habits
create policy "users_own_habits_all" on public.habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- check_ins
create policy "users_own_checkins_all" on public.check_ins
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- mastery_scores
create policy "users_own_scores_all" on public.mastery_scores
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- trigger: crear profile al registrarse
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### 4.3. Migración `0003_rpc_functions.sql`

```sql
-- helper: nivel a partir del score
create or replace function public.calculate_mastery_level(p_score numeric)
returns text language sql immutable as $$
  select case
    when p_score <= 20 then 'seed'
    when p_score <= 45 then 'sprout'
    when p_score <= 70 then 'tree'
    when p_score <= 90 then 'forest'
    else 'ancient'
  end;
$$;

-- helper: ¿el usuario ya usó el skip semanal?
create or replace function public.has_used_weekly_skip(p_habit_id uuid, p_date date)
returns boolean language sql stable as $$
  select exists(
    select 1 from public.check_ins
    where habit_id = p_habit_id
      and status = 'skipped'
      and date_trunc('week', check_date) = date_trunc('week', p_date)
  );
$$;

-- RPC principal: registra check-in y actualiza el score
create or replace function public.register_check_in(
  p_habit_id uuid,
  p_check_date date,
  p_status public.checkin_status
)
returns table(score numeric, level text, used_skip boolean)
language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid := auth.uid();
  v_frequency smallint[];
  v_is_planned boolean;
  v_compliance int;
  v_prev_score numeric;
  v_new_score numeric;
  v_new_level text;
  v_iso_dow smallint;
begin
  if v_user_id is null then
    raise exception 'unauthenticated';
  end if;

  -- valida ownership
  select frequency_days into v_frequency
  from public.habits
  where id = p_habit_id and user_id = v_user_id and archived_at is null;

  if v_frequency is null then
    raise exception 'habit_not_found';
  end if;

  -- valida grace period: solo 1 skip por semana
  if p_status = 'skipped' and public.has_used_weekly_skip(p_habit_id, p_check_date) then
    raise exception 'weekly_skip_already_used';
  end if;

  -- ¿día planificado?
  v_iso_dow := extract(isodow from p_check_date)::smallint;
  v_is_planned := v_iso_dow = any(v_frequency);

  -- compliance: completed o skipped en día planificado = 1, missed en planificado = 0
  if v_is_planned then
    v_compliance := case when p_status in ('completed','skipped') then 1 else 0 end;
  else
    v_compliance := null; -- no afecta al score
  end if;

  -- upsert check-in
  insert into public.check_ins (habit_id, user_id, check_date, status)
  values (p_habit_id, v_user_id, p_check_date, p_status)
  on conflict (habit_id, check_date) do update set status = excluded.status;

  -- score previo
  select s.score into v_prev_score from public.mastery_scores s where s.habit_id = p_habit_id;
  v_prev_score := coalesce(v_prev_score, 0);

  -- aplica fórmula solo en días planificados
  if v_compliance is null then
    v_new_score := v_prev_score;
  else
    v_new_score := round((v_prev_score * 0.8) + (v_compliance * 20), 2);
  end if;

  v_new_level := public.calculate_mastery_level(v_new_score);

  -- persiste
  insert into public.mastery_scores (habit_id, user_id, score, level, last_calculated_date)
  values (p_habit_id, v_user_id, v_new_score, v_new_level, p_check_date)
  on conflict (habit_id) do update set
    score = excluded.score,
    level = excluded.level,
    last_calculated_date = excluded.last_calculated_date,
    updated_at = now();

  return query select v_new_score, v_new_level, (p_status = 'skipped');
end;
$$;

grant execute on function public.register_check_in to authenticated;
```

---

## 5. Fases de ejecución

> Tras cada fase, ejecuta los comandos de validación, commitea y **detente para revisión humana**.

### Fase 0 — Bootstrap

1. Inicializa proyecto Expo en la carpeta actual: `npx create-expo-app@latest . --template blank-typescript`.
2. Instala dependencias: `expo-router`, `nativewind`, `tailwindcss`, `zustand`, `@supabase/supabase-js`, `react-hook-form`, `zod`, `date-fns`, `@react-native-async-storage/async-storage`.
3. Configura NativeWind (`tailwind.config.js`, `babel.config.js`, `nativewind-env.d.ts`).
4. Configura `tsconfig.json` con paths absolutos y `strict: true`.
5. Crea `.env.example` con `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
6. Crea estructura de carpetas vacías según la sección 2.
7. **Validación:** `npx expo start` arranca sin errores.
8. **Commit:** `chore: bootstrap project structure`.

### Fase 1 — Base de datos

1. Inicializa Supabase local: `npx supabase init`.
2. Crea las 3 migraciones tal como están en la sección 4.
3. Ejecuta `npx supabase db reset` para validar.
4. Genera tipos: `npx supabase gen types typescript --local > src/shared/types/database.types.ts`.
5. **Commit:** `db: initial schema, RLS and scoring RPC`.

### Fase 2 — Core module

1. Crea `src/modules/core/lib/supabase.ts` con el cliente tipado.
2. Crea `src/modules/core/states/session.store.ts` (Zustand): `{ session, user, setSession, clear }`.
3. Crea Design System mínimo: `Button`, `Card`, `Input`, `Modal`, `ProgressBar`, `Screen`. Todos con NativeWind y variantes.
4. Crea `app/_layout.tsx` con auth gate (redirige a `/login` si no hay sesión).
5. **Commit:** `feat(core): supabase client, session store and design system`.

### Fase 3 — Auth module

1. `auth.service.ts`: signUp, signIn, signInWithMagicLink, signOut, getSession.
2. `auth.store.ts` (Zustand): solo si necesitas estado más allá de la sesión.
3. `useAuth.ts`: hook que integra service + session store + manejo de errores.
4. Pantallas `app/(auth)/login.tsx` y `app/(auth)/signup.tsx` con `react-hook-form` + `zod`.
5. **Validación:** registro, login, logout funcionan end-to-end contra Supabase local.
6. **Commit:** `feat(auth): signup, login and session management`.

### Fase 4 — Habits module

1. `habits.service.ts`: CRUD completo (`createHabit`, `listHabits`, `getHabit`, `updateHabit`, `archiveHabit`).
2. `habits.store.ts` (Zustand): cache de hábitos del usuario, hábito seleccionado.
3. `useHabits.ts` y `useHabit.ts`.
4. `FrequencySelector` (componente para elegir días ISO 1–7).
5. `HabitCard` (muestra nombre, score actual, badge de nivel).
6. `HabitForm` (crear/editar).
7. Pantallas: `app/(tabs)/index.tsx` (lista), `app/habit/new.tsx`, `app/habit/[id].tsx`.
8. **Commit:** `feat(habits): CRUD with frequency selector`.

### Fase 5 — Commitment module

1. `score.service.ts`: wrapper de la RPC `register_check_in`.
2. `calculateScore.ts`: réplica TS de la fórmula para tests unitarios.
3. `score.store.ts` (Zustand): cache `{ [habitId]: { score, level } }` para evitar refetch tras cada check-in.
4. `useCommitmentScore.ts`.
5. **Tests Jest:** `calculateScore.test.ts` con casos: día planificado cumplido, día planificado fallado, día no planificado, decaimiento tras 7 fallos consecutivos, score nunca pasa de 100 ni baja de 0.
6. **Commit:** `feat(commitment): scoring engine with decay formula and tests`.

### Fase 6 — Progression module

1. `LEVELS` constant: array con `{ key, label, emoji, min, max, color }`.
2. `getLevel.ts`: pure function `(score: number) => Level`.
3. `useMasteryLevel.ts`.
4. `MasteryBadge` y `LevelProgress` (barra que muestra progreso hacia el siguiente nivel).
5. **Tests Jest:** `getLevel.test.ts` con los 5 niveles y bordes (0, 20, 21, 45, 46, 70, 71, 90, 91, 100).
6. **Commit:** `feat(progression): mastery levels with badge and progress bar`.

### Fase 7 — Check-in module

1. `isPlannedDay.ts`: `(habit, date) => boolean`.
2. `hasUsedSkipThisWeek.ts`: query a Supabase.
3. `checkin.service.ts`: orquesta la llamada a `register_check_in` y refresca el score store.
4. `useCheckIn.ts`: hook que expone `{ markCompleted, markSkipped, canCheckInToday, alreadyCheckedIn }`.
5. `CheckInButton`: componente con 3 estados (pending, completed, skipped) y modal de confirmación de skip.
6. Integración en `app/habit/[id].tsx`: muestra histórico simple (últimos 30 días en grid), score actual, badge de nivel, botón de check-in.
7. **Commit:** `feat(check-in): daily check-in with weekly grace period`.

### Fase 8 — Dashboard polish

1. `app/(tabs)/index.tsx`: lista de hábitos con score promedio del usuario destacado arriba.
2. `app/(tabs)/profile.tsx`: datos del usuario, logout, score global.
3. Empty states cuidados.
4. Loading states con skeletons.
5. **Commit:** `feat(dashboard): polished home and profile screens`.

### Fase 9 — README y cierre

1. Genera `README.md` con: descripción del producto, stack, cómo correr local (incluye `supabase start`), variables de entorno, estructura de carpetas, decisiones arquitectónicas (Screaming Architecture explicada brevemente), fórmula del score documentada.
2. **Commit:** `docs: project readme`.

---

## 6. Reglas de calidad de código

- **TypeScript estricto.** Nada de `any`. Si necesitas escape, usa `unknown` y narrow.
- **Zustand:** un store por dominio, no un mega-store. Usa `persist` solo donde tenga sentido (sesión sí, hábitos no — esos vienen de Supabase).
- **No cross-imports entre módulos.** Si `check-in` necesita algo de `commitment`, lo pide a través del `index.ts` público del módulo.
- **Naming:** archivos en `camelCase.ts`, componentes en `PascalCase.tsx`, hooks `useXxx.ts`, stores `xxx.store.ts`, services `xxx.service.ts`.
- **Errores:** captura en services, propaga tipados a hooks, muestra UI en componentes.
- **Comentarios:** solo donde el código no se explica solo. Sin redundancia.
- **Commits:** Conventional Commits estricto.

---

## 7. Definition of Done

- [ ] `npx expo start` arranca sin warnings.
- [ ] `npx tsc --noEmit` pasa.
- [ ] `npm test` pasa (commitment y progression).
- [ ] Un usuario puede registrarse, crear un hábito Lun/Mié/Vie, marcar 3 días seguidos, ver su score subir, intentar saltar un día y usar el skip semanal.
- [ ] Tras 7 días sin marcar (en días planificados), el score está cerca de 0.
- [ ] RLS impide leer datos de otro usuario (verificado manualmente con dos cuentas).

---

**Empieza por la Fase 0 ahora. Confirma cada fase antes de pasar a la siguiente.**
