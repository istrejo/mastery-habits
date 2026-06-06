-- 0011_prevent_checkin_gaming.sql
-- Bloquea transiciones de estado desde 'missed' hacia 'completed'/'skipped' en un mismo día.
-- Antes, un usuario podía:
--   1. Marcar día X como 'missed' (compliance 0, score baja)
--   2. Re-marcar día X como 'completed' (compliance 1, score sube de nuevo)
-- distorsionando el mastery score sin historial de cambios.
--
-- Fix: usar SELECT ... FOR UPDATE sobre el row existente y rechazar el upgrade.
-- El lock evita race conditions entre requests concurrentes.

create or replace function public.register_check_in(
  p_habit_id uuid,
  p_check_date date,
  p_status public.checkin_status
)
returns table(score numeric, level text, used_skip boolean)
language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid := auth.uid();
  v_frequency smallint[];
  v_is_planned boolean;
  v_compliance int;
  v_prev_score numeric;
  v_new_score numeric;
  v_new_level text;
  v_iso_dow smallint;
  v_existing_status public.checkin_status;
begin
  if v_user_id is null then
    raise exception 'unauthenticated';
  end if;

  -- valida ownership
  select frequency_days into v_frequency
  from public.habits
  where id = p_habit_id and user_id = v_user_id and archived_at is null;

  if v_frequency is null then
    raise exception 'habit_not_found';
  end if;

  -- valida grace period: solo 1 skip por semana
  if p_status = 'skipped' and public.has_used_weekly_skip(p_habit_id, p_check_date) then
    raise exception 'weekly_skip_already_used';
  end if;

  -- Lock + leer el row existente para validar la transición de estado.
  -- FOR UPDATE previene race conditions: dos requests que validan
  -- "no hay missed previo" al mismo tiempo, ambos pasan y ambos hacen upsert.
  select status into v_existing_status
  from public.check_ins
  where habit_id = p_habit_id and check_date = p_check_date
  for update;

  if v_existing_status = 'missed' and p_status in ('completed', 'skipped') then
    raise exception 'cannot_recover_missed_day';
  end if;

  -- ¿día planificado?
  v_iso_dow := extract(isodow from p_check_date)::smallint;
  v_is_planned := v_iso_dow = any(v_frequency);

  -- compliance: completed o skipped en día planificado = 1, missed en planificado = 0
  if v_is_planned then
    v_compliance := case when p_status in ('completed','skipped') then 1 else 0 end;
  else
    v_compliance := null;
  end if;

  -- upsert check-in
  insert into public.check_ins (habit_id, user_id, check_date, status)
  values (p_habit_id, v_user_id, p_check_date, p_status)
  on conflict (habit_id, check_date) do update set status = excluded.status;

  -- score previo
  select s.score into v_prev_score from public.mastery_scores s where s.habit_id = p_habit_id;
  v_prev_score := coalesce(v_prev_score, 0);

  if v_compliance is null then
    v_new_score := v_prev_score;
  else
    v_new_score := round((v_prev_score * 0.8) + (v_compliance * 20), 2);
  end if;

  v_new_level := public.calculate_mastery_level(v_new_score);

  insert into public.mastery_scores (habit_id, user_id, score, level, last_calculated_date)
  values (p_habit_id, v_user_id, v_new_score, v_new_level, p_check_date)
  on conflict (habit_id) do update set
    score = excluded.score,
    level = excluded.level,
    last_calculated_date = excluded.last_calculated_date,
    updated_at = now();

  return query select v_new_score, v_new_level, (p_status = 'skipped');
end;
$$;

grant execute on function public.register_check_in to authenticated;
