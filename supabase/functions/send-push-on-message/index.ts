// Edge function called by the on_new_message_notify trigger.
// Given a message row, looks up the recipient's Expo push tokens
// (via the service role, bypassing RLS) and forwards the payload
// to Expo's push service.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface MessageRow {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
}

interface WebhookPayload {
  record?: MessageRow;
}

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data: Record<string, string>;
  sound?: 'default';
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('method not allowed', { status: 405 });
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response('bad json', { status: 400 });
  }

  const msg = payload.record;
  if (!msg?.id || !msg.recipient_id || !msg.sender_id || !msg.body) {
    return new Response(JSON.stringify({ skipped: 'missing fields' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) {
    return new Response('server misconfigured', { status: 500 });
  }

  const admin = createClient(supabaseUrl, serviceKey);

  // Fetch recipient's push tokens and the sender's display name in parallel.
  const [{ data: tokens, error: tokensError }, { data: sender }] =
    await Promise.all([
      admin
        .from('push_tokens')
        .select('token')
        .eq('user_id', msg.recipient_id),
      admin
        .from('profiles')
        .select('name')
        .eq('id', msg.sender_id)
        .single(),
    ]);

  if (tokensError) {
    console.error('tokens lookup failed', tokensError);
    return new Response('tokens lookup failed', { status: 500 });
  }

  if (!tokens || tokens.length === 0) {
    return new Response(JSON.stringify({ sent: 0, reason: 'no tokens' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const title = sender?.name ?? 'New message';
  const preview = msg.body.length > 140 ? msg.body.slice(0, 137) + '…' : msg.body;

  const messages: ExpoPushMessage[] = tokens.map((t) => ({
    to: t.token,
    title,
    body: preview,
    sound: 'default',
    data: { friendId: msg.sender_id, messageId: msg.id },
  }));

  const expoRes = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
    },
    body: JSON.stringify(messages),
  });

  const expoBody = await expoRes.text();
  if (!expoRes.ok) {
    console.error('expo push failed', expoRes.status, expoBody);
    return new Response(JSON.stringify({ sent: 0, expoStatus: expoRes.status }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({ sent: messages.length, expo: JSON.parse(expoBody) }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
});
