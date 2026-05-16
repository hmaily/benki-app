import { create } from 'zustand';
import type { AuthProvider } from '../types';

interface AuthState {
  isAuthed: boolean;
  provider: AuthProvider | null;
  isAuthing: boolean;
  signIn: (provider: AuthProvider) => Promise<void>;
  signOut: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  isAuthed: false,
  provider: null,
  isAuthing: false,
  signIn: async (provider) => {
    set({ isAuthing: true });
    // Simulated provider handshake
    await new Promise((r) => setTimeout(r, 650));
    set({ isAuthed: true, provider, isAuthing: false });
  },
  signOut: () => set({ isAuthed: false, provider: null }),
}));
