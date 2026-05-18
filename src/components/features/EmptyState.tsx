import { StyleSheet, View } from 'react-native';

import { Button } from '../ui/Button';
import { Text } from '../ui/Text';
import { colors, spacing } from '@/theme';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

export function EmptyState({ icon, title, description, actionLabel, onAction, compact }: EmptyStateProps) {
  return (
    <View style={[styles.wrap, compact ? styles.wrapCompact : styles.wrapPadded]}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text variant="titleSm" center>
        {title}
      </Text>
      {description ? (
        <Text variant="bodySm" color={colors.textMuted} center>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} variant="secondary" size="sm" style={{ marginTop: spacing.sm }} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  wrapCompact: { paddingVertical: spacing.base },
  wrapPadded: { paddingVertical: spacing.xxl },
  icon: { marginBottom: spacing.xs },
});
