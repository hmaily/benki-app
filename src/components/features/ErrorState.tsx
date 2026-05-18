import { AlertTriangle } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Button } from '../ui/Button';
import { Text } from '../ui/Text';
import { colors, spacing } from '@/theme';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Something went wrong.', onRetry }: ErrorStateProps) {
  return (
    <View style={styles.wrap}>
      <AlertTriangle size={28} color={colors.danger} />
      <Text variant="titleSm" center>
        {message}
      </Text>
      {onRetry ? <Button label="Try again" variant="secondary" size="sm" onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.xxl },
});
