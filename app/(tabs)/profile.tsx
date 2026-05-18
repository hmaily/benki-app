import { Image } from 'expo-image';
import { Settings as SettingsIcon, Sparkles } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LeagueBanner, SettingsSheet, TopBar } from '@/components/features';
import { Button, Card, Text } from '@/components/ui';
import { useProfile } from '@/lib/stores/profile';
import { useTasks } from '@/lib/stores/tasks';
import { colors, spacing } from '@/theme';
import { formatXP } from '@/lib/utils/format';
import { leagueProgress } from '@/lib/leagues';

export default function ProfileScreen() {
  const profile = useProfile((s) => s.profile);
  const tasks = useTasks((s) => s.tasks.data);
  const insets = useSafeAreaInsets();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const stats = useMemo(() => {
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const missed = tasks.filter((t) => t.status === 'missed').length;
    const total = tasks.length;
    const completionRate = total ? Math.round((completed / total) * 100) : 0;
    return { completed, missed, completionRate };
  }, [tasks]);

  const { current } = leagueProgress(profile.xp);

  return (
    <View style={styles.flex}>
      <TopBar title="Profile" />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: 96 + insets.bottom }]}>
        <View style={styles.hero}>
          <View style={styles.avatarCircle}>
            <Image
              source={require('../../assets/coffee-cup.png')}
              style={styles.avatarImg}
              contentFit="contain"
            />
          </View>
          <Text variant="titleLg">{profile.name}</Text>
          <Text variant="body" color={colors.textMuted}>
            {profile.email}
          </Text>
        </View>

        <Card style={styles.xpCard} tone="surface">
          <Text variant="caption" color={colors.textMuted} style={styles.xpCaption}>
            Total XP
          </Text>
          <View style={styles.xpRow}>
            <Text variant="displayLg" color={colors.xp}>
              {formatXP(profile.xp)}
            </Text>
            <Text variant="titleMd" color={colors.textMuted}>
              XP
            </Text>
          </View>
          <Text variant="body" color={colors.text}>
            {current.label}
          </Text>
        </Card>

        <LeagueBanner xp={profile.xp} />

        <View style={styles.statsGrid}>
          <StatCard label="Completed" value={stats.completed} />
          <StatCard label="Missed" value={stats.missed} />
          <StatCard label="Completion" value={`${stats.completionRate}%`} />
        </View>

        <Button
          label="Settings"
          size="lg"
          variant="secondary"
          fullWidth
          leftIcon={<SettingsIcon size={18} color={colors.text} />}
          onPress={() => setSettingsOpen(true)}
        />

        <View style={styles.tipRow}>
          <Sparkles size={14} color={colors.primary} />
          <Text variant="caption" color={colors.textMuted}>
            Tip: complete two tasks daily to keep your streak.
          </Text>
        </View>
      </ScrollView>

      <SettingsSheet visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <Card padding="md" tone="flat" style={styles.statCard}>
      <Text variant="titleLg">{value}</Text>
      <Text variant="caption" color={colors.textMuted}>
        {label}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    gap: spacing.base,
  },
  hero: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.base },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.brandSurface,
  },
  avatarImg: { width: 64, height: 64 },
  xpCard: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.lg },
  xpCaption: { textTransform: 'uppercase', letterSpacing: 0.5 },
  xpRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
  statsGrid: { flexDirection: 'row', gap: spacing.sm },
  statCard: { flex: 1, alignItems: 'center', gap: 2 },
  tipRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
});
