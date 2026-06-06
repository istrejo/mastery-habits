-- 0014_harden_helper_functions_and_lock_handle_new_user.sql
-- Additional hardening surfaced by Supabase security advisor after 0011-0013
-- were applied. Fixes:
--   1. has_used_weekly_skip and calculate_mastery_level had a role-mutable
--      search_path (advisor lint 0011). They are called from
--      register_check_in which sets its own search_path, but if anyone ever
--      calls them directly they could be tricked into resolving unqualified
--      names from a different schema.
--   2. handle_new_user is SECURITY DEFINER and the advisor flagged that
--      both anon and authenticated can call it via the PostgREST API
--      (lints 0028/0029). It is a trigger function — only the trigger
--      should invoke it. Revoke direct EXECUTE.
--
-- Note: originally planned 0014 was the pomodoro XOR constraint, but that
-- migration is blocked by the local/remote schema divergence (issue #19)
-- because pomodoro_sessions does not exist on the deployed Supabase
-- project. This security fix is independent of that divergence and is safe
-- to apply to the remote.

create or replace function public.has_used_weekly_skip(
  p_habit_id uuid,
  p_date date
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.check_ins
    where habit_id = p_habit_id
      and status = 'skipped'
      and date_trunc('week', check_date) = date_trunc('week', p_date)
  );
$$;

create or replace function public.calculate_mastery_level(p_score numeric)
returns text
language sql
immutable
security definer
set search_path = public
as $$
  select case
    when p_score <= 20 then 'seed'
    when p_score <= 45 then 'sprout'
    when p_score <= 70 then 'tree'
    when p_score <= 90 then 'forest'
    else 'ancient'
  end;
$$;

revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;
-- The function is invoked by the on_auth_user_created trigger (SECURITY
-- DEFINER), so revoking from the public roles does not break signup.
