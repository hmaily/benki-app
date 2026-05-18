import * as Haptics from 'expo-haptics';
import { Redirect, Tabs, useRouter } from 'expo-router';
import { Award, Home, Plus, User, Users } from 'lucide-react-native';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/lib/stores/auth';
import { colors, radius, shadow, spacing } from '@/theme';

export default function TabsLayout() {
  const status = useAuth((s) => s.status);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Guard the tab group: bounce signed-out users to sign-in.
  if (status === 'loading') return null;
  if (status === 'signedOut') return <Redirect href="/sign-in" />;

  const openNewTask = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    router.push('/new-task');
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 64 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom,
          backgroundColor: colors.brandSurface,
          borderTopWidth: 0,
          ...shadow.md,
        },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} strokeWidth={2.2} />,
          tabBarAccessibilityLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          tabBarIcon: ({ color, size }) => <Award size={size} color={color} strokeWidth={2.2} />,
          tabBarAccessibilityLabel: 'Leaderboard',
        }}
      />
      <Tabs.Screen
        name="new-task-placeholder"
        options={{
          // Centered floating action that opens the modal task screen.
          tabBarButton: () => (
            <View style={styles.centerWrap} pointerEvents="box-none">
              <Pressable
                onPress={openNewTask}
                accessibilityRole="button"
                accessibilityLabel="Add new task"
                style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
              >
                <Plus size={28} color={colors.white} strokeWidth={2.6} />
              </Pressable>
            </View>
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            openNewTask();
          },
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} strokeWidth={2.2} />,
          tabBarAccessibilityLabel: 'Friends',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size }) => <User size={size} color={color} strokeWidth={2.2} />,
          tabBarAccessibilityLabel: 'Profile',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // Lift the FAB above the tab bar.
    marginTop: -spacing.lg,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.md,
    borderWidth: 4,
    borderColor: colors.brandSurface,
  },
  fabPressed: { backgroundColor: colors.primaryPressed, transform: [{ scale: 0.96 }] },
});
