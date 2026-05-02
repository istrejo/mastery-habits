-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  created_at timestamptz default now() not null
);

-- habits
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  description text,
  category text,
  frequency_days smallint[] not null check (
    array_length(frequency_days, 1) between 1 and 7
    and frequency_days <@ array[1,2,3,4,5,6,7]::smallint[]
  ),
  created_at timestamptz default now() not null,
  archived_at timestamptz
);

create index idx_habits_user on public.habits(user_id) where archived_at is null;

-- check_ins
create type public.checkin_status as enum ('completed', 'skipped', 'missed');

create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  check_date date not null,
  status public.checkin_status not null,
  created_at timestamptz default now() not null,
  unique(habit_id, check_date)
);

create index idx_checkins_habit_date on public.check_ins(habit_id, check_date desc);

-- mastery_scores (persistencia del score actual)
create table public.mastery_scores (
  habit_id uuid primary key references public.habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  score numeric(5,2) not null default 0 check (score between 0 and 100),
  level text not null default 'seed' check (level in ('seed','sprout','tree','forest','ancient')),
  last_calculated_date date,
  updated_at timestamptz default now() not null
);
