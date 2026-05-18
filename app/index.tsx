import { Redirect } from 'expo-router';

import { useAuth } from '@/lib/stores/auth';

/**
 * Entry route — sends users to the tabs or to sign-in once the auth
 * status is known. The root layout holds the splash until then.
 */
export default function Index() {
  const status = useAuth((s) => s.status);
  if (status === 'loading') return null;
  return <Redirect href={status === 'authed' ? '/(tabs)' : '/sign-in'} />;
}
