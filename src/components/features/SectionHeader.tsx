import { Pressable, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';

import { Text } from '../ui/Text';

interface SectionHeaderProps {
  title: string;
  caption?: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export function SectionHeader({ title, caption, actionLabel, onActionPress }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text variant="titleSm">{title}</Text>
        {caption ? (
          <Text variant="caption" color={colors.textMuted}>
            {caption}
          </Text>
        ) : null}
      </View>
      {actionLabel ? (
        <Pressable hitSlop={8} onPress={onActionPress} accessibilityRole="button">
          <Text variant="label" color={colors.primary}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  left: { flexShrink: 1, gap: 2 },
});
