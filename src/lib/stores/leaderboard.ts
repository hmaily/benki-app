import { create } from 'zustand';
import { seedLeaderboard } from '../seed';
import type { LeaderboardEntry, LeaderboardRange } from '../types';

interface LeaderboardState {
  range: LeaderboardRange;
  entries: Record<LeaderboardRange, LeaderboardEntry[]>;
  setRange: (range: LeaderboardRange) => void;
}

// All-time is the same set but scaled up — keeps mock data plausible.
const allTime: LeaderboardEntry[] = seedLeaderboard
  .map((e) => ({ ...e, xp: Math.round(e.xp * 3.4) }))
  .sort((a, b) => b.xp - a.xp)
  .map((e, idx) => ({ ...e, rank: idx + 1 }));

export const useLeaderboard = create<LeaderboardState>((set) => ({
  range: 'weekly',
  entries: { weekly: seedLeaderboard, allTime },
  setRange: (range) => set({ range }),
}));
