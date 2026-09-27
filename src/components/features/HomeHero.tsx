import { Image } from 'expo-image';
import { Flame } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Text } from '../ui/Text';
import { leagueProgress } from '@/lib/leagues';
import type { Profile } from '@/lib/types';
import { formatXP } from '@/lib/utils/format';
import { effectiveStreak } from '@/lib/utils/streak';
import { colors, shadow, spacing } from '@/theme';

interface HomeHeroProps {
  profile: Profile;
}

export function HomeHero({ profile }: HomeHeroProps) {
  const { current } = leagueProgress(profile.xp);
  const streak = effectiveStreak(profile);
  return (
    <View style={styles.wrap}>
      <View style={styles.avatarCircle}>
        <Image
          source={require('../../../assets/coffee-cup.png')}
          style={styles.avatarImg}
          contentFit="contain"
        />
      </View>
      <Text variant="titleMd">{profile.name}</Text>
      <View style={styles.statsRow}>
        <Text variant="caption" color={colors.textMuted}>
          {formatXP(profile.xp)} XP
        </Text>
        <View style={styles.dot} />
        <Text variant="caption" color={colors.textMuted}>
          {current.label}
        </Text>
        {streak > 0 ? (
          <>
            <View style={styles.dot} />
            <View style={styles.streakPill}>
              <Flame size={12} color={colors.warning} strokeWidth={2.4} />
              <Text variant="caption" color={colors.text}>
                {streak}
              </Text>
            </View>
          </>
        ) : null}
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
  streakPill: { flexDirection: 'row', alignItems: 'center', gap: 2 },
});
