import { create } from 'zustand';

import { toLeaderboardEntry } from '../mappers';
import { supabase } from '../supabase';
import type { LeaderboardEntry, LeaderboardRange } from '../types';
import { errorMessage } from '../utils/errors';

type Status = 'idle' | 'loading' | 'ready' | 'error';

interface LeaderboardState {
  range: LeaderboardRange;
  entries: LeaderboardEntry[];
  status: Status;
  error: string | null;
  setRange: (range: LeaderboardRange) => void;
  load: () => Promise<void>;
  reset: () => void;
}

export const useLeaderboard = create<LeaderboardState>((set, get) => ({
  range: 'weekly',
  entries: [],
  status: 'idle',
  error: null,

  setRange: (range) => {
    set({ range });
    void get().load();
  },

  load: async () => {
    set({ status: 'loading', error: null });
    try {
      const { data, error } = await supabase.rpc('get_leaderboard', {
        p_range: get().range === 'weekly' ? 'weekly' : 'all_time',
      });
      if (error) throw error;
      set({ entries: data.map(toLeaderboardEntry), status: 'ready' });
    } catch (e) {
      set({ status: 'error', error: errorMessage(e) });
    }
  },

  reset: () => set({ entries: [], status: 'idle', error: null, range: 'weekly' }),
}));
