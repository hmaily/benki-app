import { Flame } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Card } from '../ui/Card';
import { Text } from '../ui/Text';
import type { Profile } from '@/lib/types';
import { effectiveStreak, streakAtRisk } from '@/lib/utils/streak';
import { colors, spacing } from '@/theme';

interface StreakCardProps {
  profile: Profile;
}

export function StreakCard({ profile }: StreakCardProps) {
  const current = effectiveStreak(profile);
  const atRisk = streakAtRisk(profile);
  const flameColor = current > 0 ? colors.warning : colors.iconMuted;

  const caption =
    current === 0
      ? 'Complete a task today to start a streak.'
      : atRisk
        ? 'Finish a task today to keep it going.'
        : 'Nice — you already logged a task today.';

  return (
    <Card tone="surface" style={styles.card}>
      <View style={styles.iconWrap}>
        <Flame size={28} color={flameColor} strokeWidth={2.2} />
      </View>
      <View style={styles.body}>
        <Text variant="titleLg">
          {current} <Text variant="titleMd" color={colors.textMuted}>day{current === 1 ? '' : 's'}</Text>
        </Text>
        <Text variant="caption" color={colors.textMuted}>
          {caption}
        </Text>
      </View>
      <View style={styles.best}>
        <Text variant="caption" color={colors.textMuted} style={styles.bestLabel}>
          Best
        </Text>
        <Text variant="titleMd">{profile.longestStreak}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.xpBg,
  },
  body: { flex: 1, gap: 2 },
  best: { alignItems: 'flex-end', gap: 2 },
  bestLabel: { textTransform: 'uppercase', letterSpacing: 0.5 },
});
