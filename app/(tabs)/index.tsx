import { useFocusEffect, useRouter } from 'expo-router';
import { Bell, Coffee } from 'lucide-react-native';
import { useCallback, useMemo } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  EmptyState,
  ErrorState,
  HomeHero,
  SectionHeader,
  TaskCard,
  TopBar,
} from '@/components/features';
import { IconButton, Skeleton } from '@/components/ui';
import { useProfile } from '@/lib/stores/profile';
import { useTasks } from '@/lib/stores/tasks';
import { errorMessage } from '@/lib/utils/errors';
import { colors, spacing } from '@/theme';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const profile = useProfile((s) => s.profile);
  const loadProfile = useProfile((s) => s.load);
  const refreshProfile = useProfile((s) => s.refresh);

  const items = useTasks((s) => s.items);
  const tasksStatus = useTasks((s) => s.status);
  const tasksError = useTasks((s) => s.error);
  const loadTasks = useTasks((s) => s.load);
  const toggleComplete = useTasks((s) => s.toggleComplete);
  const reschedule = useTasks((s) => s.reschedule);

  useFocusEffect(
    useCallback(() => {
      if (tasksStatus === 'idle') void loadTasks();
      if (!profile) void loadProfile();
    }, [tasksStatus, loadTasks, profile, loadProfile]),
  );

  const { upcoming, missed } = useMemo(
    () => ({
      upcoming: items.filter((t) => t.status === 'upcoming'),
      missed: items.filter((t) => t.status === 'missed'),
    }),
    [items],
  );

  const handleToggle = async (id: string) => {
    try {
      await toggleComplete(id);
      await refreshProfile(); // XP is updated server-side by a trigger
    } catch (e) {
      Alert.alert('Could not update task', errorMessage(e));
    }
  };

  const handleReschedule = async (id: string) => {
    try {
      // Push the due date 24h forward — a sensible quick default.
      await reschedule(id, new Date(Date.now() + 24 * 3600 * 1000).toISOString());
    } catch (e) {
      Alert.alert('Could not reschedule', errorMessage(e));
    }
  };

  const refreshAll = useCallback(() => {
    void loadTasks();
    void refreshProfile();
  }, [loadTasks, refreshProfile]);

  const isLoading = tasksStatus === 'loading';
  const isInitialLoad = isLoading && items.length === 0;

  return (
    <View style={styles.flex}>
      <TopBar
        title="Home"
        right={
          <IconButton accessibilityLabel="Notifications" variant="plain" size={36}>
            <Bell size={20} color={colors.text} />
          </IconButton>
        }
      />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 96 + insets.bottom }]}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refreshAll} tintColor={colors.primary} />
        }
      >
        {profile ? (
          <HomeHero name={profile.name} xp={profile.xp} />
        ) : (
          <View style={styles.heroSkeleton}>
            <Skeleton width={96} height={96} rounded={48} />
            <Skeleton width={140} height={20} />
          </View>
        )}

        {tasksStatus === 'error' ? (
          <ErrorState message={tasksError ?? undefined} onRetry={loadTasks} />
        ) : (
          <>
            <View style={styles.section}>
              <SectionHeader title="Upcoming Tasks" caption={`${upcoming.length} on deck`} />
              {isInitialLoad ? (
                <View style={styles.list}>
                  <Skeleton height={72} rounded={16} />
                  <Skeleton height={72} rounded={16} />
                </View>
              ) : upcoming.length === 0 ? (
                <EmptyState
                  compact
                  icon={<Coffee size={28} color={colors.primary} />}
                  title="No tasks brewing"
                  description="Tap the + below to add your next study session."
                  actionLabel="Add a task"
                  onAction={() => router.push('/new-task')}
                />
              ) : (
                <View style={styles.list}>
                  {upcoming.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      onToggleComplete={handleToggle}
                      onReschedule={handleReschedule}
                    />
                  ))}
                </View>
              )}
            </View>

            {missed.length > 0 ? (
              <View style={styles.section}>
                <SectionHeader title="Missed Tasks" caption="Reschedule or knock them out today" />
                <View style={styles.list}>
                  {missed.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      onToggleComplete={handleToggle}
                      onReschedule={handleReschedule}
                    />
                  ))}
                </View>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.base, paddingTop: spacing.base, gap: spacing.xl },
  section: { gap: spacing.sm },
  list: { gap: spacing.sm },
  heroSkeleton: { alignItems: 'center', gap: spacing.sm },
});
