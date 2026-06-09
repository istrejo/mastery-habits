# Supabase — Tareas pendientes para add-today-view

> ⚠️ Estas tareas requieren acceso manual al Dashboard de Supabase o a la CLI autenticada.
> El MCP de Supabase no estaba autorizado durante la implementación y la CLI requirió Docker (no disponible).

## 1. Aplicar migraciones

Ejecutar estos scripts en el SQL Editor del Dashboard:
**https://supabase.com/dashboard/project/nvpkgrqfzrcwgigztymp/sql/new**

### Migración 1: parent_id (archivo: `supabase/migrations/20260609000001_add_tasks_parent_id.sql`)
```sql
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_tasks_parent_id ON public.tasks(parent_id);
```

### Migración 2: frequency (archivo: `supabase/migrations/20260609000002_add_tasks_frequency.sql`)
```sql
DO $$ BEGIN
  CREATE TYPE task_frequency AS ENUM ('once', 'daily', 'weekly', 'custom');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS frequency task_frequency NOT NULL DEFAULT 'once';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS custom_days smallint[] DEFAULT '{}';
```

## 2. Regenerar tipos de TypeScript

En el Dashboard de Supabase:
1. Ir a **API** → **Typescript Types**
2. Copiar el contenido generado
3. Sobrescribir `src/shared/types/database.types.ts`

O desde CLI (si Docker está disponible):
```bash
supabase gen types typescript --project-ref nvpkgrqfzrcwgigztymp > src/shared/types/database.types.ts
```

## 3. Verificar

Ejecutar en el SQL Editor para confirmar que las columnas existen:
```sql
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'tasks' 
  AND column_name IN ('parent_id', 'frequency', 'custom_days');
```

## 4. (Opcional) Reparar historial de migraciones

El `supabase migration repair` anterior marcó 21 migraciones como "reverted" en `schema_migrations`. Las tablas y datos deberían seguir intactos (la CLI solo toca el historial, no ejecuta DDL destructivo). Para verificar:

```sql
SELECT * FROM supabase_migrations.schema_migrations ORDER BY version;
```

Si las tablas originales (profiles, habits, habit_logs, tasks) existen y tienen datos, no es necesario reparar.
