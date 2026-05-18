import { StyleSheet, View } from 'react-native';

import { Card } from '../ui/Card';
import { Text } from '../ui/Text';
import { colors, radius, spacing } from '@/theme';
import { leagueProgress } from '@/lib/leagues';

interface LeagueBannerProps {
  xp: number;
}

export function LeagueBanner({ xp }: LeagueBannerProps) {
  const { current, next, pct } = leagueProgress(xp);
  return (
    <Card tone="surface" style={styles.card}>
      <Text variant="caption" color={colors.textMuted} style={styles.caption}>
        Congrats! You are in the
      </Text>
      <Text variant="titleLg">{current.label}s</Text>
      <View style={styles.barWrap}>
        <View style={[styles.barFill, { width: `${Math.round(pct * 100)}%` }]} />
      </View>
      <Text variant="caption" color={colors.textMuted}>
        {next
          ? `${(next.minXP - xp).toLocaleString()} XP to ${next.label}`
          : 'Top league — keep brewing'}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.xs },
  caption: { textTransform: 'uppercase', letterSpacing: 0.5 },
  barWrap: {
    height: 8,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginVertical: spacing.xs,
  },
  barFill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.pill },
});
