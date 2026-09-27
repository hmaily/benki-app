-- Fix the notify_new_message trigger:
--   • pg_net installs its functions in the `net` schema regardless of the
--     WITH SCHEMA hint on CREATE EXTENSION, so `extensions.net.http_post`
--     is parsed as db.schema.function and errors with "cross-database
--     references are not implemented". Use `net.http_post` directly.
--   • Wrap the HTTP call in an exception block so a push-side failure
--     never rolls back the message insert.
create or replace function public.notify_new_message()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  begin
    perform net.http_post(
      url     := 'https://fdxcrzmqldovbrcatzvd.supabase.co/functions/v1/send-push-on-message',
      body    := jsonb_build_object('record', row_to_json(new)),
      headers := jsonb_build_object('Content-Type', 'application/json')
    );
  exception when others then
    -- Never block the insert if the notification hop fails.
    raise warning 'notify_new_message: %', sqlerrm;
  end;
  return new;
end;
$$;
