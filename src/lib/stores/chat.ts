import { create } from 'zustand';

import { toMessage } from '../mappers';
import { supabase } from '../supabase';
import type { Message } from '../types';
import { errorMessage } from '../utils/errors';
import { currentUserId } from './auth';

type ThreadStatus = 'idle' | 'loading' | 'ready' | 'error';

interface ChatState {
  messagesByThread: Record<string, Message[]>;
  threadStatus: Record<string, ThreadStatus>;
  threadError: Record<string, string | null>;
  unreadByThread: Record<string, number>;
  totalUnread: number;
  /** Id of the friend whose thread is currently on screen (skips unread counting). */
  activeThread: string | null;

  loadThread: (friendId: string) => Promise<void>;
  sendMessage: (friendId: string, body: string) => Promise<void>;
  markThreadRead: (friendId: string) => Promise<void>;
  loadUnreadCounts: () => Promise<void>;
  setActiveThread: (friendId: string | null) => void;
  /** Called by the realtime subscription for every INSERT the user can see. */
  applyIncomingMessage: (msg: Message) => void;

  reset: () => void;
}

const emptyState = () => ({
  messagesByThread: {} as Record<string, Message[]>,
  threadStatus: {} as Record<string, ThreadStatus>,
  threadError: {} as Record<string, string | null>,
  unreadByThread: {} as Record<string, number>,
  totalUnread: 0,
  activeThread: null,
});

export const useChat = create<ChatState>((set, get) => ({
  ...emptyState(),

  loadThread: async (friendId) => {
    const me = currentUserId();
    if (!me) return;
    set((s) => ({
      threadStatus: { ...s.threadStatus, [friendId]: 'loading' },
      threadError: { ...s.threadError, [friendId]: null },
    }));
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${me},recipient_id.eq.${friendId}),and(sender_id.eq.${friendId},recipient_id.eq.${me})`,
        )
        .order('created_at', { ascending: true });
      if (error) throw error;
      set((s) => ({
        messagesByThread: { ...s.messagesByThread, [friendId]: data.map(toMessage) },
        threadStatus: { ...s.threadStatus, [friendId]: 'ready' },
      }));
    } catch (e) {
      set((s) => ({
        threadStatus: { ...s.threadStatus, [friendId]: 'error' },
        threadError: { ...s.threadError, [friendId]: errorMessage(e) },
      }));
    }
  },

  sendMessage: async (friendId, body) => {
    const me = currentUserId();
    if (!me) throw new Error('Not signed in');
    const trimmed = body.trim();
    if (!trimmed) return;

    const { data, error } = await supabase
      .from('messages')
      .insert({ sender_id: me, recipient_id: friendId, body: trimmed })
      .select()
      .single();
    if (error) throw error;

    const msg = toMessage(data);
    // Realtime may also deliver this; dedupe by id.
    set((s) => {
      const existing = s.messagesByThread[friendId] ?? [];
      if (existing.some((m) => m.id === msg.id)) return s;
      return {
        messagesByThread: { ...s.messagesByThread, [friendId]: [...existing, msg] },
      };
    });
  },

  markThreadRead: async (friendId) => {
    const me = currentUserId();
    if (!me) return;
    const now = new Date().toISOString();

    // Optimistic: clear unread + stamp incoming messages.
    set((s) => {
      const prev = s.unreadByThread[friendId] ?? 0;
      return {
        unreadByThread: { ...s.unreadByThread, [friendId]: 0 },
        totalUnread: Math.max(0, s.totalUnread - prev),
        messagesByThread: {
          ...s.messagesByThread,
          [friendId]: (s.messagesByThread[friendId] ?? []).map((m) =>
            m.senderId === friendId && !m.readAt ? { ...m, readAt: now } : m,
          ),
        },
      };
    });

    await supabase
      .from('messages')
      .update({ read_at: now })
      .eq('recipient_id', me)
      .eq('sender_id', friendId)
      .is('read_at', null);
  },

  loadUnreadCounts: async () => {
    const me = currentUserId();
    if (!me) return;
    const { data, error } = await supabase
      .from('messages')
      .select('sender_id')
      .eq('recipient_id', me)
      .is('read_at', null);
    if (error) return;
    const counts: Record<string, number> = {};
    for (const row of data) {
      counts[row.sender_id] = (counts[row.sender_id] ?? 0) + 1;
    }
    set({ unreadByThread: counts, totalUnread: data.length });
  },

  setActiveThread: (friendId) => set({ activeThread: friendId }),

  applyIncomingMessage: (msg) => {
    const me = currentUserId();
    if (!me) return;

    const otherId = msg.senderId === me ? msg.recipientId : msg.senderId;
    const active = get().activeThread;

    set((s) => {
      const existing = s.messagesByThread[otherId] ?? [];
      if (existing.some((m) => m.id === msg.id)) return s;
      const next = [...existing, msg].sort((a, b) =>
        a.createdAt.localeCompare(b.createdAt),
      );

      const shouldCountUnread =
        msg.recipientId === me && !msg.readAt && active !== otherId;
      const prevUnread = s.unreadByThread[otherId] ?? 0;

      return {
        messagesByThread: { ...s.messagesByThread, [otherId]: next },
        unreadByThread: shouldCountUnread
          ? { ...s.unreadByThread, [otherId]: prevUnread + 1 }
          : s.unreadByThread,
        totalUnread: shouldCountUnread ? s.totalUnread + 1 : s.totalUnread,
      };
    });
  },

  reset: () => set(emptyState()),
}));
