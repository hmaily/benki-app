import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { Text } from './Text';

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'xp';

interface BadgeProps {
  label: string;
  tone?: Tone;
  leftIcon?: React.ReactNode;
  style?: ViewStyle;
}

export function Badge({ label, tone = 'neutral', leftIcon, style }: BadgeProps) {
  return (
    <View style={[styles.base, TONE[tone].box, style]}>
      {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
      <Text variant="caption" color={TONE[tone].fg}>
        {label}
      </Text>
    </View>
  );
}

const TONE: Record<Tone, { box: ViewStyle; fg: string }> = {
  neutral: { box: { backgroundColor: colors.surfaceMuted }, fg: colors.textMuted },
  brand: { box: { backgroundColor: colors.brandSurface }, fg: colors.textOnBrand },
  success: { box: { backgroundColor: '#E8F5EE' }, fg: colors.success },
  warning: { box: { backgroundColor: '#FCEFD8' }, fg: '#8a5a14' },
  danger: { box: { backgroundColor: '#FBE6E6' }, fg: colors.danger },
  xp: { box: { backgroundColor: colors.xpBg }, fg: colors.xp },
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  icon: { marginRight: 4 },
});
