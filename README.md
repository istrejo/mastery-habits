# Mastery Habits

Habit tracker de alta fidelidad basado en **Commitment Score** y niveles de maestría. No marcás tareas — cultivás un score de vida que decae si no sos consistente.

**Diferenciador:** Promedio Ponderado Móvil con Decaimiento que castiga la inconsistencia y recompensa la disciplina sostenida.

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | React Native + Expo SDK 54 |
| Navegación | Expo Router v6 (file-based) |
| Estilos | NativeWind v4 (Tailwind para RN) |
| Estado global | Zustand v5 |
| Backend | Supabase (PostgreSQL + Auth + RLS + RPC) |
| Forms | react-hook-form + zod |
| Fechas | date-fns |
| Testing | Jest + ts-jest |
| Lenguaje | TypeScript strict |

---

## Correr en local

### Requisitos

- Node 20+
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (para Supabase local)
- Expo Go en tu dispositivo o simulador iOS/Android

### Setup

```bash
# 1. Instalar dependencias
npm install --legacy-peer-deps

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Levantar Supabase local (requiere Docker)
npx supabase start

# El CLI imprime las URLs y keys al finalizar.
# Copialas en .env:
#   EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
#   EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon key del output>

# 4. Correr migraciones
npx supabase db reset

# 5. Generar tipos TypeScript (opcional, ya están commiteados)
npx supabase gen types typescript --local > src/shared/types/database.types.ts

# 6. Arrancar la app
npx expo start
```

---

## Variables de entorno

| Variable | Descripción |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase (local o producción) |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Anon key pública de Supabase |

---

## Tests

```bash
npm test
```

Cubre los módulos `commitment/` y `progression/` con casos de borde:

- Día planificado cumplido / fallado / skip
- Día no planificado (score inmutable)
- Decaimiento tras 7 fallos consecutivos
- Score nunca supera 100 ni baja de 0
- Los 5 niveles de maestría y sus bordes exactos (0, 20, 21, 45, 46, 70, 71, 90, 91, 100)

---

## Arquitectura

### Screaming Architecture

Las carpetas gritan **qué hace** la app, no qué tecnología usa. Un dev nuevo abre `src/modules/` y entiende el dominio en 10 segundos.

```
src/modules/
├── core/         → Design System, cliente Supabase, session store
├── auth/         → Login, signup, sesión
├── habits/       → CRUD de hábitos
├── check-in/     → Marcar día, skip logic, historial
├── commitment/   → Motor del Commitment Score
└── progression/  → Niveles Seed → Ancient
```

**Regla de imports:** un módulo nunca importa directamente de otro módulo — solo de `core/` o `shared/`. Cada módulo expone su API pública en `index.ts`.

### Estructura de pantallas (Expo Router)

```
app/
├── _layout.tsx          → Root layout con auth gate
├── (auth)/
│   ├── login.tsx
│   └── signup.tsx
├── (tabs)/
│   ├── _layout.tsx
│   ├── index.tsx        → Dashboard
│   └── profile.tsx
├── habit/
│   ├── new.tsx
│   └── [id].tsx         → Detalle + check-in + historial
```

---

## Fórmula del Commitment Score

```
Score_hoy = (Score_ayer × 0.8) + (Compliance_hoy × 20)
```

| `Compliance` | Condición |
|---|---|
| `1` | Día planificado y completado (o skip semanal usado) |
| `0` | Día planificado y NO completado |
| — | Día no planificado → score se mantiene igual |

- **Rango:** 0–100
- **Score inicial:** 0
- **Cálculo:** ejecutado en Supabase vía RPC `register_check_in` y replicado en TypeScript puro para tests

### Niveles de Maestría

| Nivel | Rango | Emoji |
|---|---|---|
| Seed | 0–20 | 🌱 |
| Sprout | 21–45 | 🌿 |
| Tree | 46–70 | 🌳 |
| Forest | 71–90 | 🌲 |
| Ancient | 91–100 | 🗿 |

### Grace Period

- 1 skip por semana ISO por hábito
- El skip cuenta como `Compliance = 1` — no rompe la racha
- Solo aplicable a días planificados

---

## Base de datos

3 migraciones en `supabase/migrations/`:

| Migración | Qué hace |
|---|---|
| `0001_initial_schema.sql` | Tablas: `profiles`, `habits`, `check_ins`, `mastery_scores` |
| `0002_rls_policies.sql` | RLS policies + trigger para crear perfil en signup |
| `0003_rpc_functions.sql` | `register_check_in` RPC, `calculate_mastery_level`, `has_used_weekly_skip` |

RLS garantiza aislamiento total por usuario — ningún usuario puede leer datos de otro.
