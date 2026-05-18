import { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading,
  leftIcon,
  rightIcon,
  fullWidth,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const sizing = useMemo(() => SIZE[size], [size]);

  return (
    <Pressable
      {...rest}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        sizing.box,
        VARIANT[variant].box,
        fullWidth && styles.fullWidth,
        pressed && VARIANT[variant].pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={VARIANT[variant].fg} size="small" />
      ) : (
        <View style={styles.content}>
          {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
          <Text
            style={[typography.button, { color: VARIANT[variant].fg, fontSize: sizing.font }]}
          >
            {label}
          </Text>
          {rightIcon ? <View style={styles.iconRight}>{rightIcon}</View> : null}
        </View>
      )}
    </Pressable>
  );
}

const VARIANT: Record<Variant, { box: ViewStyle; pressed: ViewStyle; fg: string }> = {
  primary: {
    box: { backgroundColor: colors.primary },
    pressed: { backgroundColor: colors.primaryPressed },
    fg: colors.primaryText,
  },
  secondary: {
    box: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.borderStrong,
    },
    pressed: { backgroundColor: colors.surfaceMuted },
    fg: colors.text,
  },
  ghost: {
    box: { backgroundColor: 'transparent' },
    pressed: { backgroundColor: colors.surfaceMuted },
    fg: colors.text,
  },
  destructive: {
    box: { backgroundColor: colors.danger },
    pressed: { backgroundColor: '#b94f4f' },
    fg: colors.white,
  },
};

const SIZE: Record<Size, { box: ViewStyle; font: number }> = {
  sm: { box: { height: 36, paddingHorizontal: spacing.base, borderRadius: radius.md }, font: 14 },
  md: { box: { height: 48, paddingHorizontal: spacing.lg, borderRadius: radius.lg }, font: 16 },
  lg: { box: { height: 56, paddingHorizontal: spacing.xl, borderRadius: radius.lg }, font: 17 },
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: { alignSelf: 'stretch' },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  iconLeft: { marginRight: spacing.sm },
  iconRight: { marginLeft: spacing.sm },
  disabled: { opacity: 0.5 },
});
