import { Search, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type ViewStyle } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  style?: ViewStyle;
}

export function SearchBar({ value, onChange, placeholder = 'Search', style }: SearchBarProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View
      style={[
        styles.wrap,
        { borderColor: focused ? colors.primary : colors.border },
        style,
      ]}
    >
      <Search size={18} color={colors.iconMuted} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textSubtle}
        autoCorrect={false}
        returnKeyType="search"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[typography.body, styles.input, { color: colors.text }]}
      />
      {value.length > 0 ? (
        <Pressable
          hitSlop={8}
          onPress={() => onChange('')}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <X size={18} color={colors.iconMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
  },
  input: { flex: 1, paddingVertical: 0 },
});
