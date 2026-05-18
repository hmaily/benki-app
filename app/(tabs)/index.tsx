import { useFocusEffect, useRouter } from 'expo-router';
import { Bell, Coffee } from 'lucide-react-native';
import { useCallback, useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, HomeHero, SectionHeader, TaskCard, TopBar } from '@/components/features';
import { IconButton, Skeleton } from '@/components/ui';
import { useProfile } from '@/lib/stores/profile';
import { useTasks } from '@/lib/stores/tasks';
import { colors, spacing } from '@/theme';

export default function HomeScreen() {
  const router = useRouter();
  const profile = useProfile((s) => s.profile);
  const addXP = useProfile((s) => s.addXP);
  const tasks = useTasks((s) => s.tasks);
  const load = useTasks((s) => s.load);
  const toggleComplete = useTasks((s) => s.toggleComplete);
  const reschedule = useTasks((s) => s.reschedule);

  useFocusEffect(
    useCallback(() => {
      if (tasks.state === 'idle') {
        void load();
      }
    }, [tasks.state, load]),
  );

  const { upcoming, missed } = useMemo(() => {
    const upcoming = tasks.data.filter((t) => t.status === 'upcoming');
    const missed = tasks.data.filter((t) => t.status === 'missed');
    return { upcoming, missed };
  }, [tasks.data]);

  const handleToggle = (id: string) => {
    const updated = toggleComplete(id);
    if (!updated) return;
    addXP(updated.status === 'completed' ? updated.xp : -updated.xp);
  };

  const handleReschedule = (id: string) => {
    // Push the due date 24h forward — a sensible default for the prototype.
    reschedule(id, new Date(Date.now() + 24 * 3600 * 1000).toISOString());
  };

  const isLoading = tasks.state === 'loading';
  const insets = useSafeAreaInsets();

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
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} tintColor={colors.primary} />}
      >
        <HomeHero name={profile.name} xp={profile.xp} />

        <View style={styles.section}>
          <SectionHeader title="Upcoming Tasks" caption={`${upcoming.length} on deck`} />
          {isLoading && tasks.data.length === 0 ? (
            <View style={styles.skeletons}>
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.base, paddingTop: spacing.base, gap: spacing.xl },
  section: { gap: spacing.sm },
  list: { gap: spacing.sm },
  skeletons: { gap: spacing.sm },
});
