import { Pressable, type PressableProps, StyleSheet, type ViewStyle } from 'react-native';

import { colors, radius } from '@/theme';

interface IconButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  children: React.ReactNode;
  size?: number;
  variant?: 'plain' | 'tinted' | 'solid';
  accessibilityLabel: string;
  style?: ViewStyle;
}

export function IconButton({
  children,
  size = 40,
  variant = 'plain',
  style,
  ...rest
}: IconButtonProps) {
  return (
    <Pressable
      {...rest}
      accessibilityRole="button"
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        VARIANT[variant],
        { width: size, height: size, borderRadius: radius.pill },
        pressed && styles.pressed,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const VARIANT: Record<'plain' | 'tinted' | 'solid', ViewStyle> = {
  plain: { backgroundColor: 'transparent' },
  tinted: { backgroundColor: colors.surfaceMuted },
  solid: { backgroundColor: colors.brandSurface },
};

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.65 },
});
