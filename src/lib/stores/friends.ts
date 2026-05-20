import { create } from 'zustand';

import { toFriend, toFriendRequest, toUserSearchResult } from '../mappers';
import { supabase } from '../supabase';
import type { Friend, FriendRequest, UserSearchResult } from '../types';
import { errorMessage } from '../utils/errors';
import { currentUserId } from './auth';

type Status = 'idle' | 'loading' | 'ready' | 'error';

interface FriendsState {
  friends: Friend[];
  requests: FriendRequest[];
  status: Status;
  error: string | null;
  load: () => Promise<void>;
  acceptRequest: (requestId: string) => Promise<void>;
  declineRequest: (requestId: string) => Promise<void>;
  /** Search profiles by name (excludes self and existing friends). */
  searchUsers: (query: string) => Promise<UserSearchResult[]>;
  /** Send a friend request to another user. */
  sendRequest: (toUserId: string) => Promise<void>;
  /** Ids of users the current user already has a pending outgoing request to. */
  outgoingPendingIds: () => Promise<string[]>;
  reset: () => void;
}

async function fetchFriends(userId: string): Promise<Friend[]> {
  const { data: edges, error: edgesError } = await supabase
    .from('friendships')
    .select('friend_id')
    .eq('user_id', userId);
  if (edgesError) throw edgesError;

  const friendIds = edges.map((e) => e.friend_id);
  if (friendIds.length === 0) return [];

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, name, xp, avatar_url')
    .in('id', friendIds);
  if (profilesError) throw profilesError;

  return profiles.map(toFriend).sort((a, b) => b.xp - a.xp);
}

async function fetchRequests(userId: string): Promise<FriendRequest[]> {
  const { data: rows, error: rowsError } = await supabase
    .from('friend_requests')
    .select('id, from_user')
    .eq('to_user', userId)
    .eq('status', 'pending');
  if (rowsError) throw rowsError;
  if (rows.length === 0) return [];

  const senderIds = rows.map((r) => r.from_user);
  const { data: senders, error: sendersError } = await supabase
    .from('profiles')
    .select('id, name, avatar_url')
    .in('id', senderIds);
  if (sendersError) throw sendersError;

  const byId = new Map(senders.map((s) => [s.id, s]));
  return rows
    .map((r) => {
      const sender = byId.get(r.from_user);
      return sender ? toFriendRequest(r.id, sender) : null;
    })
    .filter((r): r is FriendRequest => r !== null);
}

export const useFriends = create<FriendsState>((set, get) => ({
  friends: [],
  requests: [],
  status: 'idle',
  error: null,

  load: async () => {
    const userId = currentUserId();
    if (!userId) return;

    set({ status: 'loading', error: null });
    try {
      const [friends, requests] = await Promise.all([
        fetchFriends(userId),
        fetchRequests(userId),
      ]);
      set({ friends, requests, status: 'ready' });
    } catch (e) {
      set({ status: 'error', error: errorMessage(e) });
    }
  },

  acceptRequest: async (requestId) => {
    const prevRequests = get().requests;
    set({ requests: prevRequests.filter((r) => r.id !== requestId) }); // optimistic

    const { error } = await supabase.rpc('accept_friend_request', {
      p_request_id: requestId,
    });
    if (error) {
      set({ requests: prevRequests }); // rollback
      throw error;
    }
    // Pull in the freshly added friend.
    const userId = currentUserId();
    if (userId) set({ friends: await fetchFriends(userId) });
  },

  declineRequest: async (requestId) => {
    const prevRequests = get().requests;
    set({ requests: prevRequests.filter((r) => r.id !== requestId) }); // optimistic

    const { error } = await supabase
      .from('friend_requests')
      .update({ status: 'declined' })
      .eq('id', requestId);
    if (error) {
      set({ requests: prevRequests }); // rollback
      throw error;
    }
  },

  searchUsers: async (query) => {
    const { data, error } = await supabase.rpc('search_profiles', {
      p_query: query,
    });
    if (error) throw error;
    return data.map(toUserSearchResult);
  },

  sendRequest: async (toUserId) => {
    const userId = currentUserId();
    if (!userId) throw new Error('Not signed in');

    const { error } = await supabase
      .from('friend_requests')
      .insert({ from_user: userId, to_user: toUserId });
    if (error) throw error;
  },

  outgoingPendingIds: async () => {
    const userId = currentUserId();
    if (!userId) return [];

    const { data, error } = await supabase
      .from('friend_requests')
      .select('to_user')
      .eq('from_user', userId)
      .eq('status', 'pending');
    if (error) throw error;
    return data.map((r) => r.to_user);
  },

  reset: () => set({ friends: [], requests: [], status: 'idle', error: null }),
}));
