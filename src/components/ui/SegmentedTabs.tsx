import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { colors, radius, shadow, spacing } from '@/theme';

import { Text } from './Text';

interface Item<V extends string> {
  value: V;
  label: string;
}

interface SegmentedTabsProps<V extends string> {
  items: ReadonlyArray<Item<V>>;
  value: V;
  onChange: (v: V) => void;
  style?: ViewStyle;
}

export function SegmentedTabs<V extends string>({ items, value, onChange, style }: SegmentedTabsProps<V>) {
  return (
    <View style={[styles.wrap, style]}>
      {items.map((it) => {
        const selected = it.value === value;
        return (
          <Pressable
            key={it.value}
            onPress={() => onChange(it.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={[styles.tab, selected && styles.tabSelected]}
          >
            <Text
              variant="tab"
              color={selected ? colors.text : colors.textMuted}
              style={styles.label}
            >
              {it.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  tabSelected: {
    backgroundColor: colors.surface,
    ...shadow.sm,
  },
  label: { textTransform: 'none' },
});
