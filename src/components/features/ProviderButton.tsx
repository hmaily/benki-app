import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '../ui/Text';
import { colors, radius, shadow, spacing } from '@/theme';

interface ProviderButtonProps {
  label: string;
  onPress: () => void;
  /** Logo image source (e.g. require('../../assets/oauth/google.png')). */
  logo?: number;
  /** Lucide icon, used when no logo image is provided. */
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
}

export function ProviderButton({
  label,
  onPress,
  logo,
  icon,
  loading,
  disabled,
}: ProviderButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      <View style={styles.logoWrap}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.text} />
        ) : logo ? (
          <Image source={logo} style={styles.logo} contentFit="contain" />
        ) : (
          icon
        )}
      </View>
      <Text variant="button" color={colors.text}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    height: 56,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    ...shadow.sm,
  },
  pressed: { backgroundColor: colors.surfaceMuted },
  disabled: { opacity: 0.6 },
  logoWrap: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 24, height: 24 },
});
