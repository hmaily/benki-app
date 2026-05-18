import { create } from 'zustand';

import { toProfile } from '../mappers';
import { supabase } from '../supabase';
import type { Profile } from '../types';
import { errorMessage } from '../utils/errors';
import { currentUserId } from './auth';

type Status = 'idle' | 'loading' | 'ready' | 'error';

interface ProfileState {
  profile: Profile | null;
  status: Status;
  error: string | null;
  load: () => Promise<void>;
  /** Re-fetch silently, keeping the last good profile visible on failure. */
  refresh: () => Promise<void>;
  rename: (name: string) => Promise<void>;
  reset: () => void;
}

async function fetchOwnProfile(): Promise<Profile | null> {
  const userId = currentUserId();
  if (!userId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return toProfile(data);
}

export const useProfile = create<ProfileState>((set, get) => ({
  profile: null,
  status: 'idle',
  error: null,

  load: async () => {
    set({ status: 'loading', error: null });
    try {
      set({ profile: await fetchOwnProfile(), status: 'ready' });
    } catch (e) {
      set({ status: 'error', error: errorMessage(e) });
    }
  },

  refresh: async () => {
    try {
      set({ profile: await fetchOwnProfile(), status: 'ready' });
    } catch {
      // Keep the last good profile rather than flashing an error.
    }
  },

  rename: async (name) => {
    const userId = currentUserId();
    if (!userId) return;

    const prev = get().profile;
    if (prev) set({ profile: { ...prev, name } }); // optimistic

    const { error } = await supabase.from('profiles').update({ name }).eq('id', userId);
    if (error) {
      if (prev) set({ profile: prev }); // rollback
      throw error;
    }
  },

  reset: () => set({ profile: null, status: 'idle', error: null }),
}));
