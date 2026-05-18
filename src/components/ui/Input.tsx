import { useState } from 'react';
import { StyleSheet, TextInput, type TextInputProps, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

import { Text } from './Text';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightAccessory?: React.ReactNode;
  multiline?: boolean;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightAccessory,
  multiline,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const borderColor = error
    ? colors.danger
    : focused
      ? colors.primary
      : colors.border;

  return (
    <View style={styles.wrap}>
      {label ? (
        <Text variant="label" color={colors.textMuted} style={styles.label}>
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.fieldRow,
          multiline && styles.fieldRowMultiline,
          { borderColor, backgroundColor: colors.surface },
        ]}
      >
        {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}
        <TextInput
          {...rest}
          multiline={multiline}
          placeholderTextColor={colors.textSubtle}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            typography.body,
            styles.input,
            multiline && styles.inputMultiline,
            { color: colors.text },
          ]}
        />
        {rightAccessory ? <View style={styles.iconRight}>{rightAccessory}</View> : null}
      </View>
      {error ? (
        <Text variant="caption" color={colors.danger} style={styles.helper}>
          {error}
        </Text>
      ) : helperText ? (
        <Text variant="caption" color={colors.textSubtle} style={styles.helper}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.xs },
  label: { marginBottom: 2 },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  fieldRowMultiline: { alignItems: 'flex-start', paddingVertical: spacing.sm, minHeight: 96 },
  iconLeft: { marginRight: spacing.sm },
  iconRight: { marginLeft: spacing.sm },
  input: { flex: 1, paddingVertical: 0 },
  inputMultiline: { textAlignVertical: 'top', minHeight: 80 },
  helper: { marginTop: 2 },
});
