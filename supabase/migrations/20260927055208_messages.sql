-- 1-on-1 chat between friends.
--
-- Messages are immutable except for the recipient marking them read;
-- clients cannot send to anyone but their friends (enforced in the INSERT
-- policy). Realtime is enabled so both parties see new messages instantly.

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  read_at timestamptz,
  check (sender_id <> recipient_id)
);

-- Fetching a thread with a specific friend: rows where I'm sender OR
-- recipient of that friend. Two indexes cover both directions.
create index messages_sender_recipient_idx
  on public.messages (sender_id, recipient_id, created_at desc);
create index messages_recipient_sender_idx
  on public.messages (recipient_id, sender_id, created_at desc);

-- Unread messages to me, for computing per-thread unread counts.
create index messages_unread_idx
  on public.messages (recipient_id, sender_id)
  where read_at is null;

alter table public.messages enable row level security;

create policy "Users see messages they sent or received"
  on public.messages for select
  to authenticated
  using (
    sender_id = (select auth.uid()) or recipient_id = (select auth.uid())
  );

-- Only friends can message each other. RLS check enforces both that the
-- sender is the caller and that a friendship row exists in that direction.
create policy "Users send messages to friends only"
  on public.messages for insert
  to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1 from public.friendships
      where user_id = (select auth.uid())
        and friend_id = recipient_id
    )
  );

-- The RLS UPDATE policy lets the recipient touch their row, but table
-- privileges narrow the write surface to just read_at so bodies stay
-- immutable (same technique as the profile score-column lockdown).
create policy "Recipients update their own row"
  on public.messages for update
  to authenticated
  using (recipient_id = (select auth.uid()))
  with check (recipient_id = (select auth.uid()));

revoke update on public.messages from authenticated;
grant update (read_at) on public.messages to authenticated;

-- Enable Realtime.
alter publication supabase_realtime add table public.messages;
