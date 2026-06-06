create type public.pomodoro_phase   as enum ('work', 'short_break', 'long_break');
create type public.pomodoro_outcome as enum ('completed', 'cancelled');

create table public.pomodoro_sessions (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references auth.users(id) on delete cascade,
  habit_id                 uuid references public.habits(id) on delete set null,
  task_id                  uuid references public.tasks(id)  on delete set null,
  phase                    public.pomodoro_phase   not null,
  planned_duration_seconds int not null check (planned_duration_seconds between 60 and 7200),
  actual_duration_seconds  int not null check (actual_duration_seconds >= 0),
  outcome                  public.pomodoro_outcome not null,
  cycle_index              smallint not null default 1 check (cycle_index between 1 and 8),
  started_at               timestamptz not null,
  ended_at                 timestamptz not null,
  created_at               timestamptz default now() not null,
  constraint pomodoro_target_xor check (
    not (habit_id is not null and task_id is not null)
  )
);

create index idx_pomodoro_user_started on public.pomodoro_sessions(user_id, started_at desc);
create index idx_pomodoro_habit        on public.pomodoro_sessions(habit_id) where habit_id is not null;
create index idx_pomodoro_task         on public.pomodoro_sessions(task_id)  where task_id  is not null;

alter table public.pomodoro_sessions enable row level security;

create policy "users_own_pomodoro_all" on public.pomodoro_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
