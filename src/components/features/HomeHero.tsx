import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { Text } from '../ui/Text';
import { colors, shadow, spacing } from '@/theme';
import { leagueProgress } from '@/lib/leagues';
import { formatXP } from '@/lib/utils/format';

interface HomeHeroProps {
  name: string;
  xp: number;
}

export function HomeHero({ name, xp }: HomeHeroProps) {
  const { current } = leagueProgress(xp);
  return (
    <View style={styles.wrap}>
      <View style={styles.avatarCircle}>
        <Image source={require('../../../assets/coffee-cup.png')} style={styles.avatarImg} contentFit="contain" />
      </View>
      <Text variant="titleMd">{name}</Text>
      <View style={styles.statsRow}>
        <Text variant="caption" color={colors.textMuted}>
          {formatXP(xp)} XP
        </Text>
        <View style={styles.dot} />
        <Text variant="caption" color={colors.textMuted}>
          {current.label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: spacing.xs },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadow.sm,
    borderWidth: 2,
    borderColor: colors.brandSurface,
  },
  avatarImg: { width: 64, height: 64 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.textSubtle },
});
