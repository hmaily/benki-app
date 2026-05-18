import { Redirect } from 'expo-router';

import { useAuth } from '@/lib/stores/auth';

/**
 * Entry route — sends authed users to the tab navigator, else to sign-in.
 */
export default function Index() {
  const isAuthed = useAuth((s) => s.isAuthed);
  return <Redirect href={isAuthed ? '/(tabs)' : '/sign-in'} />;
}
