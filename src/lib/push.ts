/**
 * Expo push notification setup for chat.
 *
 * Register once per signed-in device: request permissions, ask Expo for a
 * push token, upsert it into public.push_tokens. The DB trigger on the
 * messages table takes care of actually sending pushes when new messages
 * arrive.
 *
 * Requires an EAS `projectId` — normally auto-set in app.json/eas.json
 * once you've run `eas init`. If it's missing (e.g. the app was never
 * initialised with EAS), registration is skipped cleanly.
 */
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { supabase } from './supabase';

export interface RegisterOptions {
  userId: string;
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function getProjectId(): string | null {
  const legacy = (Constants as { easConfig?: { projectId?: string } }).easConfig?.projectId;
  const fromConfig = Constants.expoConfig?.extra?.eas?.projectId ?? legacy ?? null;
  return typeof fromConfig === 'string' && fromConfig.length > 0 ? fromConfig : null;
}

/**
 * Ensures the current signed-in device has a push token stored server-side.
 * Returns the Expo token that was registered, or null when registration
 * was skipped (no device, no projectId, user declined permissions, etc.).
 */
export async function registerPushToken({ userId }: RegisterOptions): Promise<string | null> {
  if (!Device.isDevice) {
    // Simulators/emulators can't receive push (iOS at all; Android occasionally can).
    return null;
  }
  if (Platform.OS === 'web') {
    return null; // web push is a separate integration
  }

  const projectId = getProjectId();
  if (!projectId) {
    console.warn(
      '[push] No EAS projectId in app config — skipping push registration. ' +
        'Run `eas init` to set one up.',
    );
    return null;
  }

  // Android requires a channel before requesting permissions.
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Messages',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#B8895D',
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  if (status !== 'granted') {
    return null;
  }

  let token: string;
  try {
    const res = await Notifications.getExpoPushTokenAsync({ projectId });
    token = res.data;
  } catch (e) {
    console.warn('[push] getExpoPushTokenAsync failed', e);
    return null;
  }

  const platform = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';

  const { error } = await supabase.from('push_tokens').upsert(
    { token, user_id: userId, platform, updated_at: new Date().toISOString() },
    { onConflict: 'token' },
  );
  if (error) {
    console.warn('[push] token upsert failed', error);
    return null;
  }

  return token;
}

/** Remove a token when signing out or when the OS invalidates it. */
export async function unregisterPushToken(token: string): Promise<void> {
  await supabase.from('push_tokens').delete().eq('token', token);
}
