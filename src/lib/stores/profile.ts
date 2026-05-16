import { create } from 'zustand';
import { leagueFor } from '../leagues';
import { seedProfile } from '../seed';
import type { Profile } from '../types';

interface ProfileState {
  profile: Profile;
  rename: (name: string) => void;
  addXP: (delta: number) => void;
}

export const useProfile = create<ProfileState>((set, get) => ({
  profile: seedProfile,
  rename: (name) => set({ profile: { ...get().profile, name } }),
  addXP: (delta) => {
    const p = get().profile;
    const xp = Math.max(0, p.xp + delta);
    set({ profile: { ...p, xp, league: leagueFor(xp).key } });
  },
}));
