create type public.task_status as enum ('pending', 'completed');

create table public.tasks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  habit_id     uuid references public.habits(id) on delete set null,
  title        text not null check (char_length(title) between 1 and 120),
  description  text check (description is null or char_length(description) <= 500),
  due_date     date,
  status       public.task_status not null default 'pending',
  completed_at timestamptz,
  created_at   timestamptz default now() not null,
  constraint tasks_completion_consistency check (
    (status = 'completed' and completed_at is not null)
    or (status = 'pending' and completed_at is null)
  )
);

create index idx_tasks_user_status on public.tasks(user_id, status);
create index idx_tasks_habit       on public.tasks(habit_id) where habit_id is not null;
create index idx_tasks_user_due    on public.tasks(user_id, due_date) where due_date is not null;

alter table public.tasks enable row level security;

create policy "users_own_tasks_all" on public.tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
