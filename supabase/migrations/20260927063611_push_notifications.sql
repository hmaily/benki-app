-- Push notifications for new messages.
--
-- Flow:
-- 1. Clients register their Expo push token(s) in push_tokens on sign-in.
-- 2. When a message row is inserted, an AFTER INSERT trigger uses pg_net
--    to POST the row asynchronously to the send-push-on-message edge
--    function.
-- 3. The edge function looks up the recipient's tokens via the service
--    role and hands the payload to the Expo Push API.
--
-- v1 note: the edge function endpoint is public (no shared-secret check).
-- Attack surface is small (someone would need to guess the function URL
-- and a real recipient UUID to fake a push), acceptable pre-launch.
-- Harden with a webhook secret before public launch.

create extension if not exists pg_net with schema extensions;

create table public.push_tokens (
  token text primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  platform text not null check (platform in ('ios', 'android', 'web')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index push_tokens_user_id_idx on public.push_tokens (user_id);

alter table public.push_tokens enable row level security;

create policy "Users manage their own push tokens"
  on public.push_tokens for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create or replace function public.notify_new_message()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  perform extensions.net.http_post(
    url     := 'https://fdxcrzmqldovbrcatzvd.supabase.co/functions/v1/send-push-on-message',
    body    := jsonb_build_object('record', row_to_json(new)),
    headers := jsonb_build_object('Content-Type', 'application/json')
  );
  return new;
end;
$$;

create trigger on_new_message_notify
  after insert on public.messages
  for each row execute function public.notify_new_message();
