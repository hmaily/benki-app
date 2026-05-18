import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '../ui/Text';
import { colors, spacing } from '@/theme';

interface TopBarProps {
  title: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  style?: ViewStyle;
  variant?: 'brand' | 'plain';
}

export function TopBar({ title, left, right, style, variant = 'brand' }: TopBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.wrap,
        variant === 'brand' ? styles.wrapBrand : styles.wrapPlain,
        { paddingTop: insets.top + spacing.sm },
        style,
      ]}
    >
      <View style={styles.slot}>{left}</View>
      <Text
        variant="titleMd"
        color={variant === 'brand' ? colors.textOnBrand : colors.text}
        numberOfLines={1}
        style={styles.title}
      >
        {title}
      </Text>
      <View style={[styles.slot, styles.slotRight]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
  },
  wrapBrand: { backgroundColor: colors.brandSurface },
  wrapPlain: { backgroundColor: colors.background },
  slot: { width: 44, alignItems: 'flex-start' },
  slotRight: { alignItems: 'flex-end' },
  title: { flex: 1, textAlign: 'center' },
});
