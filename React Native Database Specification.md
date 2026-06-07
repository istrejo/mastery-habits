# Especificación de Entidades y Base de Datos: Pendie

Este documento define la estructura de datos, relaciones y reglas de negocio para el backend de **Pendie** en Supabase (PostgreSQL). La arquitectura está diseñada para soportar un enfoque **Offline-First**, garantizar la seguridad mediante **Row Level Security (RLS)** y permitir la autogeneración precisa de tipos en TypeScript para el frontend.

## 📌 Consideraciones de Arquitectura de Datos
- **Row Level Security (RLS):** Todas las tablas contienen una clave foránea hacia el perfil del usuario (`user_id` o `id`), permitiendo que las políticas de aislamiento protejan los datos individuales a nivel de base de datos.
- **Enfoque Híbrido Cloud-Local:** El temporizador Pomodoro se ejecuta de manera 100% efímera y local en el frontend (Zustand). No se almacena historial de sesiones en la base de datos, solo sus parámetros de configuración global dentro del perfil del usuario para mantener la ligereza del sistema.
- **Manejo de Fechas:** Para evitar desajustes de zona horaria al registrar el cumplimiento de hábitos entre el dispositivo local y el servidor, se utiliza el tipo `DATE` (formato puro `YYYY-MM-DD`) en el registro histórico en lugar de timestamps complejos.

---

## 🗂️ Definición de Entidades

### 1. Entidad: Perfiles (`profiles`)
Extensiones públicas de la tabla nativa de autenticación de Supabase (`auth.users`). Centraliza los datos del usuario, sus preferencias de personalización y los parámetros base para el sistema de enfoque Pomodoro.

- **Campos e Identificadores:**
  - `id` (UUID, Clave Primaria): Enlazado directamente al identificador único de la tabla nativa de autenticación (`auth.users`).
  - `username` (Texto, Opcional): Nombre de usuario o alias visible en la interfaz.
  - `total_score` (Entero, Por defecto: 0): Puntuación acumulada global del usuario para el sistema de gamificación y recompensas.
  - `theme_preference` (Texto, Por defecto: 'system'): Preferencia visual de la interfaz de usuario (valores válidos: 'light', 'dark', 'system').
  - `created_at` (Timestamp con zona horaria): Fecha y hora exactas de la creación del perfil.
- **Configuración Sincronizada del Pomodoro (Ejecución Local):**
  - `pomodoro_work_duration` (Entero, Por defecto: 25): Duración del bloque de enfoque o trabajo en minutos.
  - `pomodoro_short_break` (Entero, Por defecto: 5): Duración del periodo de descanso corto en minutos.
  - `pomodoro_long_break` (Entero, Por defecto: 15): Duración del periodo de descanso largo en minutos.

### 2. Entidad: Hábitos (`habits`)
Representa la definición conceptual de las actividades recurrentes que el usuario desea trackear y convertir en rutinas a lo largo del tiempo.

- **Campos e Identificadores:**
  - `id` (UUID, Clave Primaria): Identificador único auto-generado para cada hábito.
  - `user_id` (UUID, Clave Foránea): Relación directa con la tabla `profiles`. No nulo.
  - `title` (Texto): Nombre o enunciado del hábito (ej: "Entrenamiento de Calistenia"). No nulo.
  - `color` (Texto, Opcional): Código hexadecimal o identificador de color asignado para la personalización de las tarjetas en la UI.
  - `frequency` (Texto, Por defecto: 'daily'): Cadencia configurada para el hábito (ej: 'daily', 'weekly').
  - `current_streak` (Entero, Por defecto: 0): Racha actual de días consecutivos o periodos cumplidos con éxito.
  - `is_active` (Booleano, Por defecto: true): Flag lógico para archivar o desactivar el hábito en la UI sin necesidad de eliminar su historial de cumplimiento.
  - `created_at` (Timestamp con zona horaria): Fecha de registro inicial del hábito en el sistema.

### 3. Entidad: Logs de Hábitos (`habit_logs`)
Registro histórico e inmutable de cumplimiento. Cada fila representa una acción de marcado exitoso ("check") de un hábito específico en un día calendario concreto. Permite calcular estadísticas exactas en el frontend.

- **Campos e Identificadores:**
  - `id` (UUID, Clave Primaria): Identificador único auto-generado para el registro de cumplimiento.
  - `habit_id` (UUID, Clave Foránea): Relación directa con la tabla `habits`. Cuenta con eliminación en cascada para limpiar el historial si el hábito es eliminado.
  - `user_id` (UUID, Clave Foránea): Relación directa con la tabla `profiles` para aplicar políticas RLS eficientemente.
  - `completed_date` (Fecha pura - `DATE`): El día exacto en el que se cumplió el hábito, almacenado estrictamente en formato `YYYY-MM-DD`.
  - `created_at` (Timestamp con zona horaria): Momento exacto de servidor en el que se registró la acción.
- **Restricciones de Integridad:**
  - **Clave Única Compuesta (`UNIQUE`):** Se restringe la combinación de `habit_id` y `completed_date`. Un hábito específico no puede registrarse como completado más de una vez en el mismo día calendario.

### 4. Entidad: Tareas (`tasks`)
Elementos de acción orientados a metas u obligaciones específicas con un ciclo de vida finito (Pendiente -> Completada). Aparecen dinámicamente en la vista del día ("Today View") si cumplen con los criterios de fecha.

- **Campos e Identificadores:**
  - `id` (UUID, Clave Primaria): Identificador único auto-generado para la tarea.
  - `user_id` (UUID, Clave Foránea): Relación directa con la tabla `profiles`. No nulo.
  - `title` (Texto): Enunciado o título de la tarea pendiente. No nulo.
  - `description` (Texto, Opcional): Notas adicionales, subtareas en texto o detalles extendidos.
  - `priority` (Texto, Por defecto: 'medium'): Niveles de prioridad mapeados para la lógica visual y ordenamiento (valores: 'low', 'medium', 'high').
  - `due_date` (Timestamp con zona horaria, Opcional): Fecha y hora límite de vencimiento para su correcta visualización en la agenda de hoy.
  - `is_completed` (Booleano, Por defecto: false): Estado actual de resolución de la tarea.
  - `completed_at` (Timestamp con zona horaria, Opcional): Registro de tiempo de cuándo la tarea pasó a estado completado, útil para analíticas de productividad.
  - `created_at` (Timestamp con zona horaria): Fecha de creación del registro.

---

## 🔄 Mapeo de Sincronización e Integración con el Frontend

Al no utilizar queries directas en los componentes de la interfaz de usuario y operar bajo un esquema offline-first respaldado por Zustand y MMKV, las interacciones con estas entidades siguen las siguientes pautas de diseño de software:

1. **Lectura y Mutación Optimista:** Al marcar una tarea o hábito en la UI, el store de Zustand correspondiente actualiza el estado local en MMKV de inmediato. Paralelamente, las mutaciones asíncronas de TanStack Query envían los cambios a Supabase. Si la conexión a red falla, la UI no se bloquea y los reintentos se gestionan silenciosamente en segundo plano.
2. **Consumo de Tipos TypeScript:** El archivo autogenerado `database.types.ts` por la CLI de Supabase reflejará estas especificaciones de manera idéntica. En el código del frontend, los modelos se consumirán extrayendo los tipos directamente del esquema público de la base de datos (e.g., `Database['public']['Tables']['tasks']['Row']`), garantizando consistencia total de extremo a extremo.
