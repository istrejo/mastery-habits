-- 0013_block_old_checkins.sql
-- Bloquea check-ins con fecha mayor a 7 días en el pasado.
--
-- Razón: combinado con el fix de 0012 (calcular score desde el check-in anterior),
-- un backfill de 30 días causaba drift acumulativo porque no se hace replay de los
-- días intermedios. Limitar a 7 días mantiene el cálculo estable y el backfill útil
-- para corregir olvidos de la semana en curso.

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
  v_window_start date;
begin
  if v_user_id is null then
    raise exception 'unauthenticated';
  end if;

  -- ventana de 7 días: bloquea backfill más viejo
  v_window_start := (current_date - interval '7 days')::date;
  if p_check_date < v_window_start then
    raise exception 'checkin_too_old';
  end if;
  -- tampoco permitir fechas futuras
  if p_check_date > current_date then
    raise exception 'checkin_in_future';
  end if;

  select frequency_days into v_frequency
  from public.habits
  where id = p_habit_id and user_id = v_user_id and archived_at is null;

  if v_frequency is null then
    raise exception 'habit_not_found';
  end if;

  if p_status = 'skipped' and public.has_used_weekly_skip(p_habit_id, p_check_date) then
    raise exception 'weekly_skip_already_used';
  end if;

  select status into v_existing_status
  from public.check_ins
  where habit_id = p_habit_id and check_date = p_check_date
  for update;

  if v_existing_status = 'missed' and p_status in ('completed', 'skipped') then
    raise exception 'cannot_recover_missed_day';
  end if;

  v_iso_dow := extract(isodow from p_check_date)::smallint;
  v_is_planned := v_iso_dow = any(v_frequency);

  if v_is_planned then
    v_compliance := case when p_status in ('completed','skipped') then 1 else 0 end;
  else
    v_compliance := null;
  end if;

  insert into public.check_ins (habit_id, user_id, check_date, status)
  values (p_habit_id, v_user_id, p_check_date, p_status)
  on conflict (habit_id, check_date) do update set status = excluded.status;

  select s.score into v_prev_score
  from public.mastery_scores s
  where s.habit_id = p_habit_id
    and s.last_calculated_date is not null
    and s.last_calculated_date < p_check_date
  order by s.last_calculated_date desc
  limit 1;
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
