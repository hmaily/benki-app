import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LeagueBanner, RankRow, TopBar } from '@/components/features';
import { Card, SegmentedTabs } from '@/components/ui';
import { useLeaderboard } from '@/lib/stores/leaderboard';
import { useProfile } from '@/lib/stores/profile';
import { colors, spacing } from '@/theme';
import type { LeaderboardRange } from '@/lib/types';

const TABS = [
  { value: 'weekly' as const, label: 'Weekly' },
  { value: 'allTime' as const, label: 'All-time' },
];

export default function LeaderboardScreen() {
  const profile = useProfile((s) => s.profile);
  const range = useLeaderboard((s) => s.range);
  const entries = useLeaderboard((s) => s.entries);
  const setRange = useLeaderboard((s) => s.setRange);
  const insets = useSafeAreaInsets();

  const list = entries[range];

  return (
    <View style={styles.flex}>
      <TopBar title="Leaderboard" />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 96 + insets.bottom }]}
      >
        <LeagueBanner xp={profile.xp} />

        <SegmentedTabs<LeaderboardRange>
          items={TABS}
          value={range}
          onChange={setRange}
        />

        <Card padding="sm" tone="surface">
          {list.map((entry) => (
            <RankRow key={entry.id} entry={entry} />
          ))}
        </Card>
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
});
