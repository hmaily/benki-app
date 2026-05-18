import { Minus, Plus } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { IconButton } from './IconButton';
import { Text } from './Text';

interface StepperProps {
  value: number;
  onChange: (next: number) => void;
  step?: number;
  min?: number;
  max?: number;
  label?: string;
  suffix?: string;
}

export function Stepper({
  value,
  onChange,
  step = 25,
  min = 0,
  max = 500,
  label,
  suffix,
}: StepperProps) {
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  return (
    <View style={styles.wrap}>
      {label ? (
        <Text variant="label" color={colors.textMuted}>
          {label}
        </Text>
      ) : null}
      <View style={styles.row}>
        <IconButton
          accessibilityLabel="Decrease"
          variant="tinted"
          onPress={() => onChange(clamp(value - step))}
          disabled={value <= min}
        >
          <Minus size={18} color={colors.text} />
        </IconButton>
        <View style={styles.valueWrap}>
          <Text variant="titleMd">{value}</Text>
          {suffix ? (
            <Text variant="label" color={colors.textMuted} style={styles.suffix}>
              {suffix}
            </Text>
          ) : null}
        </View>
        <IconButton
          accessibilityLabel="Increase"
          variant="tinted"
          onPress={() => onChange(clamp(value + step))}
          disabled={value >= max}
        >
          <Plus size={18} color={colors.text} />
        </IconButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  valueWrap: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
  suffix: {},
});
