create table public.task_subtasks (
  id           uuid primary key default gen_random_uuid(),
  task_id      uuid not null references public.tasks(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  title        text not null check (char_length(title) between 1 and 120),
  status       public.task_status not null default 'pending',
  completed_at timestamptz,
  order_index  integer not null default 0,
  created_at   timestamptz default now() not null,
  constraint task_subtasks_completion_consistency check (
    (status = 'completed' and completed_at is not null)
    or (status = 'pending' and completed_at is null)
  )
);

create index idx_task_subtasks_task_order on public.task_subtasks(task_id, order_index);
create index idx_task_subtasks_user_status on public.task_subtasks(user_id, status);

alter table public.task_subtasks enable row level security;

create policy "users_own_task_subtasks_all" on public.task_subtasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
