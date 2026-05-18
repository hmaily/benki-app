import { useFocusEffect } from 'expo-router';
import { Trophy } from 'lucide-react-native';
import { useCallback } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState, ErrorState, LeagueBanner, RankRow, TopBar } from '@/components/features';
import { Card, SegmentedTabs, Skeleton } from '@/components/ui';
import { useLeaderboard } from '@/lib/stores/leaderboard';
import { useProfile } from '@/lib/stores/profile';
import type { LeaderboardRange } from '@/lib/types';
import { colors, spacing } from '@/theme';

const TABS = [
  { value: 'weekly' as const, label: 'Weekly' },
  { value: 'allTime' as const, label: 'All-time' },
];

export default function LeaderboardScreen() {
  const profile = useProfile((s) => s.profile);
  const range = useLeaderboard((s) => s.range);
  const entries = useLeaderboard((s) => s.entries);
  const status = useLeaderboard((s) => s.status);
  const error = useLeaderboard((s) => s.error);
  const setRange = useLeaderboard((s) => s.setRange);
  const load = useLeaderboard((s) => s.load);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      if (status === 'idle') void load();
    }, [status, load]),
  );

  const isInitialLoad = status === 'loading' && entries.length === 0;

  return (
    <View style={styles.flex}>
      <TopBar title="Leaderboard" />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 96 + insets.bottom }]}
        refreshControl={
          <RefreshControl
            refreshing={status === 'loading'}
            onRefresh={load}
            tintColor={colors.primary}
          />
        }
      >
        {profile ? <LeagueBanner xp={profile.xp} /> : <Skeleton height={120} rounded={16} />}

        <SegmentedTabs<LeaderboardRange> items={TABS} value={range} onChange={setRange} />

        {status === 'error' ? (
          <ErrorState message={error ?? undefined} onRetry={load} />
        ) : isInitialLoad ? (
          <Card padding="sm" tone="surface">
            <View style={styles.skeletons}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} height={48} rounded={12} />
              ))}
            </View>
          </Card>
        ) : entries.length === 0 ? (
          <EmptyState
            icon={<Trophy size={28} color={colors.primary} />}
            title="No rankings yet"
            description="Add friends to see how you stack up this week."
          />
        ) : (
          <Card padding="sm" tone="surface">
            {entries.map((entry) => (
              <RankRow key={entry.id} entry={entry} />
            ))}
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    gap: spacing.base,
  },
  skeletons: { gap: spacing.sm, padding: spacing.xs },
});
