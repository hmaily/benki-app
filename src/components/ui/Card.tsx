import { Pressable, type PressableProps, StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radius, shadow, spacing } from '@/theme';

interface BaseProps {
  padding?: keyof typeof spacing | 0;
  tone?: 'surface' | 'muted' | 'flat';
  style?: ViewStyle;
}

interface CardProps extends BaseProps {
  children: React.ReactNode;
}

export function Card({ children, padding = 'base', tone = 'surface', style }: CardProps) {
  return (
    <View style={[styles.base, TONE[tone], padding !== 0 && { padding: spacing[padding] }, style]}>
      {children}
    </View>
  );
}

interface PressableCardProps extends BaseProps, Omit<PressableProps, 'style' | 'children'> {
  children: React.ReactNode;
}

export function PressableCard({
  children,
  padding = 'base',
  tone = 'surface',
  style,
  ...rest
}: PressableCardProps) {
  return (
    <Pressable
      {...rest}
      style={({ pressed }) => [
        styles.base,
        TONE[tone],
        padding !== 0 && { padding: spacing[padding] },
        pressed && styles.pressed,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const TONE: Record<'surface' | 'muted' | 'flat', ViewStyle> = {
  surface: { backgroundColor: colors.surface, ...shadow.sm },
  muted: { backgroundColor: colors.surfaceMuted },
  flat: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
};

const styles = StyleSheet.create({
  base: { borderRadius: radius.lg },
  pressed: { opacity: 0.85 },
});
