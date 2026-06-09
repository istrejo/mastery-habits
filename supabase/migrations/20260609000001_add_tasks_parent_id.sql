ALTER TABLE public.tasks ADD COLUMN parent_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE;
CREATE INDEX idx_tasks_parent_id ON public.tasks(parent_id);
