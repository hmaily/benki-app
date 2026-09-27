import { useEffect } from 'react';

import type { Database } from '@/lib/database.types';
import { toMessage } from '@/lib/mappers';
import { currentUserId, useAuth } from '@/lib/stores/auth';
import { useChat } from '@/lib/stores/chat';
import { supabase } from '@/lib/supabase';

type MessageRow = Database['public']['Tables']['messages']['Row'];

/**
 * Subscribes to realtime INSERTs on `messages` for the current user (as
 * sender or recipient) and pipes them into the chat store. Also runs an
 * initial `loadUnreadCounts` so the Friends screen shows accurate dots
 * on first render. Mount once at the root, only while authed.
 */
export function useInboxSubscription() {
  const userId = useAuth((s) => s.userId);
  const applyIncoming = useChat((s) => s.applyIncomingMessage);
  const loadUnreadCounts = useChat((s) => s.loadUnreadCounts);

  useEffect(() => {
    if (!userId) return;
    const me = currentUserId();
    if (!me) return;

    void loadUnreadCounts();

    const channel = supabase
      .channel(`inbox:${me}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${me}`,
        },
        (payload) => applyIncoming(toMessage(payload.new as MessageRow)),
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${me}`,
        },
        // Also catch messages I sent, so a second device stays in sync.
        (payload) => applyIncoming(toMessage(payload.new as MessageRow)),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, applyIncoming, loadUnreadCounts]);
}
