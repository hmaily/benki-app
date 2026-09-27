-- Streaks and completion tracking
-- Adds current/longest streak counters to profiles and teaches the
-- task-completion trigger to maintain them.

alter table public.profiles
  add column current_streak integer not null default 0
    check (current_streak >= 0),
  add column longest_streak integer not null default 0
    check (longest_streak >= 0),
  -- UTC calendar date of the user's most recent completion. Used to decide
  -- whether a new completion continues, breaks, or restarts the streak.
  add column last_completion_date date;

-- Lock down score columns: only the completion trigger (which runs
-- security definer as the migration owner) may write these. Without this,
-- an authenticated user could PATCH their own profile.xp or streak
-- counters to arbitrary values because the row-level policy has no
-- per-column restriction.
revoke update (xp, current_streak, longest_streak, last_completion_date)
  on public.profiles from authenticated;

-- Redefine handle_task_completion to also maintain streak counters.
-- Streak semantics:
--   • A "streak day" is any UTC calendar day with at least one completion.
--   • Completing another task on the same day does not change the streak.
--   • Completing a task the day after the last completion increments it.
--   • Any longer gap restarts the streak at 1.
--   • Uncompletion and deletion refund XP but do not touch the streak
--     (rare edge case; slight inflation on un-then-recomplete is preferable
--     to a rewrite of history that could break the current day).
create or replace function public.handle_task_completion()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  v_last_date date;
  v_current  integer;
  v_today    date := (now() at time zone 'utc')::date;
begin
  if tg_op = 'UPDATE' then
    if new.completed_at is not null and old.completed_at is null then
      -- Task just completed: award XP…
      update public.profiles
      set xp = xp + new.xp
      where id = new.user_id;

      -- …and update streak.
      select last_completion_date, current_streak
        into v_last_date, v_current
      from public.profiles
      where id = new.user_id;

      if v_last_date is null or v_last_date < v_today - 1 then
        -- First ever, or streak broken → restart at 1.
        update public.profiles
        set current_streak      = 1,
            longest_streak      = greatest(longest_streak, 1),
            last_completion_date = v_today
        where id = new.user_id;
      elsif v_last_date = v_today - 1 then
        -- Consecutive day → increment.
        update public.profiles
        set current_streak      = v_current + 1,
            longest_streak      = greatest(longest_streak, v_current + 1),
            last_completion_date = v_today
        where id = new.user_id;
      end if;
      -- v_last_date = v_today → already counted today, nothing to do.

    elsif new.completed_at is null and old.completed_at is not null then
      -- Task uncompleted: refund XP; leave streak alone.
      update public.profiles
      set xp = greatest(0, xp - old.xp)
      where id = new.user_id;
    end if;
    return new;

  elsif tg_op = 'DELETE' then
    if old.completed_at is not null then
      update public.profiles
      set xp = greatest(0, xp - old.xp)
      where id = old.user_id;
    end if;
    return old;
  end if;

  return new;
end;
$$;
