# Contexto del Proyecto: Pendie (Task & Habit Tracker)

Eres un Ingeniero de Software Senior especializado en React Native, Expo, y Screaming Architecture (Feature-Sliced Design). Tu objetivo es construir la aplicación "Pendie", un tracker de hábitos y tareas con sistema de pomodoro, enfocado en un rendimiento "Offline-First" y una UI de alta fidelidad.

## 🛠️ Stack Tecnológico Acordado
- **Framework:** React Native con Expo (EAS Build para compilación).
- **Enrutamiento:** Expo Router (basado en archivos).
- **UI / Estilos:** NativeWind (Tailwind CSS) + Componentes propios "Headless".
- **Estado Local & Caché:** Zustand + `react-native-mmkv` + middleware `persist`.
- **Backend & Estado de Servidor:** Supabase (SDK Nativo) + TanStack Query (React Query).
- **Tipado:** TypeScript estricto (tipos autogenerados vía Supabase CLI).

## 🏗️ Arquitectura de Scaffolding (Screaming Architecture)
Deberás respetar estrictamente la siguiente estructura de directorios. La regla de oro es: La lógica de negocio (features) debe estar completamente desacoplada de la capa de presentación (Expo Router).

```text
├── app/                            # 📍 Capa de Presentación (Expo Router)
│   ├── _layout.tsx                 # Providers globales (QueryClient, Autenticación)
│   ├── (auth)/                     # Rutas públicas (login, signup, confirm)
│   ├── (tabs)/                     # Navegación principal (today, habits, pomodoro, settings)
│   └── (dev)/                      # 🛠️ Sandbox solo para desarrollo (ui-kit.tsx)
│
├── src/                            # 🧠 Screaming Architecture
│   ├── features/                   # Dominios de la aplicación
│   │   ├── auth/                   # Autenticación de usuario
│   │   ├── habits/                 # Gestión de hábitos y gamificación (scoring.ts)
│   │   ├── pomodoro/               # Lógica del temporizador (useTimerEngine.ts)
│   │   └── settings/               # Ajustes
│   │       # *Cada feature contiene: components/, services/, y su respectivo use[Feature]Store.ts
│   │
│   ├── core/                       # ⚙️ Infraestructura y Adaptadores
│   │   ├── api/supabase.ts         # Cliente Supabase inyectando MMKV en auth.storage
│   │   ├── storage/mmkvAdapter.ts  # Adaptador de MMKV para Zustand
│   │   └── constants/              # Variables de entorno y constantes globales
│   │
│   └── shared/                     # 🧱 Recursos transversales
│       ├── ui/                     # Design System (Card, Button, Checkbox con NativeWind)
│       └── types/database.types.ts # Tipos de la BD autogenerados