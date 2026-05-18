import { addDays, format, isSameDay, set as setTimeParts, startOfDay } from 'date-fns';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '../ui/Text';
import { colors, radius, spacing } from '@/theme';

const TIME_PRESETS: ReadonlyArray<{ label: string; hour: number; minute: number }> = [
  { label: '9 AM', hour: 9, minute: 0 },
  { label: '12 PM', hour: 12, minute: 0 },
  { label: '3 PM', hour: 15, minute: 0 },
  { label: '6 PM', hour: 18, minute: 0 },
  { label: '9 PM', hour: 21, minute: 0 },
];

interface DatePickerInlineProps {
  value: Date;
  onChange: (next: Date) => void;
  daysAhead?: number;
}

export function DatePickerInline({ value, onChange, daysAhead = 14 }: DatePickerInlineProps) {
  const today = startOfDay(new Date());
  const days = Array.from({ length: daysAhead }, (_, i) => addDays(today, i));
  const valHour = value.getHours();

  const setDate = (d: Date) => {
    onChange(setTimeParts(d, { hours: valHour, minutes: value.getMinutes(), seconds: 0, milliseconds: 0 }));
  };

  const setTime = (hour: number, minute: number) => {
    onChange(setTimeParts(value, { hours: hour, minutes: minute, seconds: 0, milliseconds: 0 }));
  };

  return (
    <View style={styles.wrap}>
      <Text variant="caption" color={colors.textMuted}>
        Date
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {days.map((d, idx) => {
          const selected = isSameDay(d, value);
          return (
            <Pressable
              key={d.toISOString()}
              onPress={() => setDate(d)}
              style={[styles.dayPill, selected && styles.dayPillSelected]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text
                variant="caption"
                color={selected ? colors.textInverse : colors.textMuted}
              >
                {idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : format(d, 'EEE')}
              </Text>
              <Text variant="titleSm" color={selected ? colors.textInverse : colors.text}>
                {format(d, 'MMM d')}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text variant="caption" color={colors.textMuted} style={styles.timeLabel}>
        Time
      </Text>
      <View style={styles.timeRow}>
        {TIME_PRESETS.map((t) => {
          const selected = value.getHours() === t.hour;
          return (
            <Pressable
              key={t.label}
              onPress={() => setTime(t.hour, t.minute)}
              style={[styles.timePill, selected && styles.timePillSelected]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text
                variant="label"
                color={selected ? colors.textInverse : colors.text}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  row: { gap: spacing.sm, paddingVertical: spacing.xs },
  dayPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 70,
  },
  dayPillSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  timeLabel: { marginTop: spacing.xs },
  timeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  timePill: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timePillSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
});
