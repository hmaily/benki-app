-- Benki initial schema
-- Tables, triggers, RLS policies, and RPCs for the gamified study app.

-- ============================================================
-- profiles — one row per auth user, created by trigger on signup
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default 'Benki Learner' check (char_length(name) between 1 and 60),
  email text,
  avatar_url text,
  xp integer not null default 0 check (xp >= 0),
  -- League tier is always derived from XP, never set directly.
  league text generated always as (
    case
      when xp >= 8000 then 'mocha'
      when xp >= 2500 then 'cappuccino'
      when xp >= 500 then 'latte'
      else 'espresso'
    end
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- tasks — study tasks owned by a single user
-- Status (upcoming / missed / completed) is derived in the client
-- from completed_at and due_at; only completed_at is stored.
-- ============================================================
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  notes text check (char_length(notes) <= 2000),
  due_at timestamptz not null,
  xp integer not null default 50 check (xp between 0 and 1000),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index tasks_user_id_idx on public.tasks (user_id);
create index tasks_due_at_idx on public.tasks (due_at);
create index tasks_completed_at_idx on public.tasks (completed_at);

-- ============================================================
-- friend_requests — pending/accepted/declined directed requests
-- ============================================================
create table public.friend_requests (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references public.profiles (id) on delete cascade,
  to_user uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  unique (from_user, to_user),
  check (from_user <> to_user)
);

create index friend_requests_to_user_idx on public.friend_requests (to_user);
create index friend_requests_from_user_idx on public.friend_requests (from_user);

-- ============================================================
-- friendships — accepted friendships stored as two directed rows
-- (a -> b and b -> a) so "my friends" is a simple user_id filter.
-- ============================================================
create table public.friendships (
  user_id uuid not null references public.profiles (id) on delete cascade,
  friend_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id),
  check (user_id <> friend_id)
);

-- ============================================================
-- Functions & triggers
-- ============================================================

-- Keep updated_at fresh on profile changes.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Create a profile automatically when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(coalesce(new.email, 'learner@benki.app'), '@', 1)
    ),
    new.email,
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep profile XP authoritative: award on completion, refund on
-- un-completion or deletion of a completed task. Server-side so the
-- client can never inflate its own XP.
create or replace function public.handle_task_completion()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    if new.completed_at is not null and old.completed_at is null then
      update public.profiles set xp = xp + new.xp where id = new.user_id;
    elsif new.completed_at is null and old.completed_at is not null then
      update public.profiles set xp = greatest(0, xp - old.xp) where id = new.user_id;
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    if old.completed_at is not null then
      update public.profiles set xp = greatest(0, xp - old.xp) where id = old.user_id;
    end if;
    return old;
  end if;
  return new;
end;
$$;

create trigger on_task_completion_change
  after update or delete on public.tasks
  for each row execute function public.handle_task_completion();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.friend_requests enable row level security;
alter table public.friendships enable row level security;

-- profiles: readable by the owner and by people connected to them
-- (friends, or anyone in a pending request either direction).
create policy "Profiles are visible to self and connections"
  on public.profiles for select
  to authenticated
  using (
    id = (select auth.uid())
    or exists (
      select 1 from public.friendships f
      where f.user_id = (select auth.uid()) and f.friend_id = profiles.id
    )
    or exists (
      select 1 from public.friend_requests r
      where (r.from_user = (select auth.uid()) and r.to_user = profiles.id)
         or (r.to_user = (select auth.uid()) and r.from_user = profiles.id)
    )
  );

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- tasks: fully private to their owner.
create policy "Users manage their own tasks"
  on public.tasks for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- friend_requests: visible to either party; only the sender creates,
-- only the recipient updates (accept/decline), either party deletes.
create policy "Friend requests visible to both parties"
  on public.friend_requests for select
  to authenticated
  using (from_user = (select auth.uid()) or to_user = (select auth.uid()));

create policy "Users send their own friend requests"
  on public.friend_requests for insert
  to authenticated
  with check (from_user = (select auth.uid()));

create policy "Recipients respond to friend requests"
  on public.friend_requests for update
  to authenticated
  using (to_user = (select auth.uid()))
  with check (to_user = (select auth.uid()));

create policy "Either party removes a friend request"
  on public.friend_requests for delete
  to authenticated
  using (from_user = (select auth.uid()) or to_user = (select auth.uid()));

-- friendships: visible to either side. Inserts happen only through
-- accept_friend_request() (security definer); no direct insert policy.
create policy "Friendships visible to either side"
  on public.friendships for select
  to authenticated
  using (user_id = (select auth.uid()) or friend_id = (select auth.uid()));

create policy "Users can remove their own friendships"
  on public.friendships for delete
  to authenticated
  using (user_id = (select auth.uid()) or friend_id = (select auth.uid()));

-- ============================================================
-- RPCs
-- ============================================================

-- Accept a friend request atomically: flip status and create both
-- directed friendship rows. Only the recipient may call it.
create or replace function public.accept_friend_request(p_request_id uuid)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  r public.friend_requests;
begin
  select * into r from public.friend_requests where id = p_request_id;

  if r.id is null then
    raise exception 'Friend request not found';
  end if;
  if r.to_user <> auth.uid() then
    raise exception 'Not authorized to accept this request';
  end if;
  if r.status <> 'pending' then
    raise exception 'Friend request is no longer pending';
  end if;

  update public.friend_requests set status = 'accepted' where id = p_request_id;

  insert into public.friendships (user_id, friend_id)
  values (r.from_user, r.to_user), (r.to_user, r.from_user)
  on conflict do nothing;
end;
$$;

-- Leaderboard for the caller plus their friends. p_range is
-- 'weekly' (XP from tasks completed in the last 7 days) or
-- 'all_time' (lifetime profile XP).
create or replace function public.get_leaderboard(p_range text default 'all_time')
returns table (
  id uuid,
  name text,
  avatar_url text,
  xp bigint,
  rank bigint,
  is_me boolean
)
language sql
stable
security definer set search_path = ''
as $$
  with circle as (
    select auth.uid() as id
    union
    select friend_id from public.friendships where user_id = auth.uid()
  ),
  scored as (
    select
      p.id,
      p.name,
      p.avatar_url,
      case
        when p_range = 'weekly' then coalesce((
          select sum(t.xp)
          from public.tasks t
          where t.user_id = p.id
            and t.completed_at is not null
            and t.completed_at >= now() - interval '7 days'
        ), 0)
        else p.xp
      end::bigint as xp
    from public.profiles p
    where p.id in (select id from circle)
  )
  select
    s.id,
    s.name,
    s.avatar_url,
    s.xp,
    rank() over (order by s.xp desc) as rank,
    s.id = auth.uid() as is_me
  from scored s
  order by rank, s.name;
$$;

-- Search profiles by name for friend discovery. Excludes the caller
-- and anyone already a friend. Security definer so it can see
-- profiles RLS would otherwise hide.
create or replace function public.search_profiles(p_query text)
returns table (
  id uuid,
  name text,
  avatar_url text,
  xp integer
)
language sql
stable
security definer set search_path = ''
as $$
  select p.id, p.name, p.avatar_url, p.xp
  from public.profiles p
  where p.id <> auth.uid()
    and char_length(trim(p_query)) >= 2
    and p.name ilike '%' || trim(p_query) || '%'
    and p.id not in (
      select friend_id from public.friendships where user_id = auth.uid()
    )
  order by p.name
  limit 20;
$$;
