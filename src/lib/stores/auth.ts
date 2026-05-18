import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '../supabase';

type AuthStatus = 'loading' | 'authed' | 'signedOut';

interface AuthState {
  status: AuthStatus;
  session: Session | null;
  userId: string | null;
  /** Hydrate from stored session and subscribe to auth changes. Returns an unsubscribe fn. */
  init: () => () => void;
}

export const useAuth = create<AuthState>((set) => ({
  status: 'loading',
  session: null,
  userId: null,

  init: () => {
    void supabase.auth.getSession().then(({ data }) => {
      set({
        session: data.session,
        userId: data.session?.user.id ?? null,
        status: data.session ? 'authed' : 'signedOut',
      });
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      set({
        session,
        userId: session?.user.id ?? null,
        status: session ? 'authed' : 'signedOut',
      });
    });

    return () => data.subscription.unsubscribe();
  },
}));

/** Current user id outside React (for store actions). */
export function currentUserId(): string | null {
  return useAuth.getState().userId;
}
