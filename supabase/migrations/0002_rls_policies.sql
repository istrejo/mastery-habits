alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.check_ins enable row level security;
alter table public.mastery_scores enable row level security;

-- profiles
create policy "users_own_profile_select" on public.profiles
  for select using (auth.uid() = id);
create policy "users_own_profile_update" on public.profiles
  for update using (auth.uid() = id);
create policy "users_own_profile_insert" on public.profiles
  for insert with check (auth.uid() = id);

-- habits
create policy "users_own_habits_all" on public.habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- check_ins
create policy "users_own_checkins_all" on public.check_ins
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- mastery_scores
create policy "users_own_scores_all" on public.mastery_scores
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- trigger: crear profile al registrarse
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
