CREATE TYPE task_frequency AS ENUM ('once', 'daily', 'weekly', 'custom');
ALTER TABLE public.tasks ADD COLUMN frequency task_frequency NOT NULL DEFAULT 'once';
ALTER TABLE public.tasks ADD COLUMN custom_days smallint[] DEFAULT '{}';
