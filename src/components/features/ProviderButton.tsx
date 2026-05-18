import { Image } from 'expo-image';
import { Mail } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '../ui/Text';
import { colors, radius, shadow, spacing } from '@/theme';
import type { AuthProvider } from '@/lib/types';

interface ProviderButtonProps {
  provider: AuthProvider;
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const LOGO: Partial<Record<AuthProvider, ReturnType<typeof require>>> = {
  google: require('../../../assets/oauth/google.png'),
  notion: require('../../../assets/oauth/notion.png'),
  onenote: require('../../../assets/oauth/onenote.png'),
};

export function ProviderButton({ provider, label, onPress, loading, disabled }: ProviderButtonProps) {
  const isDisabled = disabled || loading;
  const logo = LOGO[provider];

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
        {logo ? (
          <Image source={logo} style={styles.logo} contentFit="contain" />
        ) : (
          <Mail size={20} color={colors.text} />
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
