import { StyleSheet, View } from 'react-native';

import { Avatar } from '../ui/Avatar';
import { Text } from '../ui/Text';
import { colors, radius, spacing } from '@/theme';
import { formatXP } from '@/lib/utils/format';
import type { LeaderboardEntry } from '@/lib/types';

interface RankRowProps {
  entry: LeaderboardEntry;
}

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export function RankRow({ entry }: RankRowProps) {
  const medal = MEDALS[entry.rank];
  return (
    <View style={[styles.row, entry.isMe && styles.rowMe]}>
      <View style={styles.rankWrap}>
        {medal ? (
          <Text variant="titleLg">{medal}</Text>
        ) : (
          <Text variant="titleSm" color={colors.textMuted}>
            #{entry.rank}
          </Text>
        )}
      </View>
      <Avatar
        name={entry.name}
        seed={entry.id}
        size={40}
        source={entry.avatarUrl ? { uri: entry.avatarUrl } : undefined}
      />
      <View style={styles.body}>
        <Text variant="titleSm">{entry.name}</Text>
        {entry.isMe ? (
          <Text variant="caption" color={colors.primary}>
            That's you
          </Text>
        ) : null}
      </View>
      <Text variant="titleSm" color={colors.xp}>
        {formatXP(entry.xp)} XP
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  rowMe: { backgroundColor: colors.xpBg },
  rankWrap: { width: 32, alignItems: 'center' },
  body: { flex: 1, gap: 2 },
});
