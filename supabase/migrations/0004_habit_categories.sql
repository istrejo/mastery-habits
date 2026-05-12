-- 0004_habit_categories.sql

-- 1. Crear enum de categorías
create type public.habit_category as enum (
  'health', 'mind', 'learning', 'productivity',
  'nutrition', 'creativity', 'social', 'finance', 'custom'
);

-- 2. Migrar columna existente: text → enum
-- Primero: limpiar datos previos (todos pasan a 'custom' con label por defecto)
alter table public.habits
  add column category_new public.habit_category,
  add column custom_label text,
  add column custom_emoji text;

update public.habits
  set category_new = 'custom',
      custom_label = 'Sin categorizar',
      custom_emoji = '📌'
  where category_new is null;

alter table public.habits
  alter column category_new set not null;

-- Eliminar columna antigua y renombrar
alter table public.habits drop column category;
alter table public.habits rename column category_new to category;

-- 3. Constraints de integridad
alter table public.habits add constraint custom_label_required
  check (
    (category = 'custom' and custom_label is not null and char_length(custom_label) between 1 and 30)
    or (category != 'custom' and custom_label is null)
  );

alter table public.habits add constraint custom_emoji_required
  check (
    (category = 'custom' and custom_emoji is not null and char_length(custom_emoji) between 1 and 8)
    or (category != 'custom' and custom_emoji is null)
  );

-- 4. Índice para queries de agrupación por categoría
create index idx_habits_user_category on public.habits(user_id, category)
  where archived_at is null;
