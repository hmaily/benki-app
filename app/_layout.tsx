import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuth } from '@/lib/stores/auth';
import { useFriends } from '@/lib/stores/friends';
import { useLeaderboard } from '@/lib/stores/leaderboard';
import { useProfile } from '@/lib/stores/profile';
import { useTasks } from '@/lib/stores/tasks';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* fine if the splash is already gone */
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const status = useAuth((s) => s.status);
  const init = useAuth((s) => s.init);

  // Hydrate the session and subscribe to auth changes once.
  useEffect(() => init(), [init]);

  // Reveal the app only when fonts and the auth check are both done.
  // The navigator below always renders so route guards can navigate;
  // the splash screen covers any pre-ready frames.
  useEffect(() => {
    if (fontsLoaded && status !== 'loading') {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, status]);

  // Drop cached data on sign-out so the next account starts clean.
  useEffect(() => {
    if (status === 'signedOut') {
      useTasks.getState().reset();
      useProfile.getState().reset();
      useFriends.getState().reset();
      useLeaderboard.getState().reset();
    }
  }, [status]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="sign-in" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="new-task"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="add-friends"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="task/[id]" options={{ animation: 'slide_from_right' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
