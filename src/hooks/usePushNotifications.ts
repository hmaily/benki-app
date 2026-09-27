import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';

import { registerPushToken, unregisterPushToken } from '@/lib/push';
import { useAuth } from '@/lib/stores/auth';

/**
 * Handles the full push-notification lifecycle for the current session:
 * - Registers a push token with the backend when a user signs in.
 * - Unregisters it when they sign out.
 * - Wires notification taps to the chat screen for the sender.
 *
 * Notifications received while the app is in the foreground do not need to
 * pop banners — the existing Realtime subscription already updates the UI.
 * Tap handling still matters (from lock screen, notification center, etc.).
 */
export function usePushNotifications() {
  const userId = useAuth((s) => s.userId);
  const router = useRouter();
  const tokenRef = useRef<string | null>(null);

  // Register / unregister as auth state changes.
  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!userId) {
        if (tokenRef.current) {
          const stale = tokenRef.current;
          tokenRef.current = null;
          await unregisterPushToken(stale).catch(() => {});
        }
        return;
      }
      const token = await registerPushToken({ userId });
      if (cancelled) return;
      tokenRef.current = token;
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Handle a tap on a push notification (foreground or from cold start).
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as
        | { friendId?: string }
        | undefined;
      if (data?.friendId) {
        router.push(`/chat/${data.friendId}`);
      }
    });
    return () => sub.remove();
  }, [router]);
}
