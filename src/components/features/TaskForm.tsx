import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Stepper } from '../ui/Stepper';
import { Text } from '../ui/Text';
import { colors, spacing } from '@/theme';

import { DatePickerInline } from './DatePickerInline';

const XP_STEP = 25;
const XP_MIN = 25;
const XP_MAX = 500;

export interface TaskFormSubmit {
  title: string;
  notes?: string;
  dueAt: string; // ISO timestamp
  xp: number;
}

export interface TaskFormInitial {
  title: string;
  notes: string;
  due: Date;
  xp: number;
}

interface TaskFormProps {
  initial: TaskFormInitial;
  submitLabel: string;
  submitting: boolean;
  onSubmit: (values: TaskFormSubmit) => void;
  autoFocusTitle?: boolean;
}

/**
 * Shared create/edit form for a task. Owns its field state and validation;
 * the parent screen supplies the TopBar and handles the submit result.
 */
export function TaskForm({
  initial,
  submitLabel,
  submitting,
  onSubmit,
  autoFocusTitle,
}: TaskFormProps) {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState(initial.title);
  const [notes, setNotes] = useState(initial.notes);
  const [due, setDue] = useState<Date>(initial.due);
  const [xp, setXp] = useState(initial.xp);
  const [submitted, setSubmitted] = useState(false);

  const trimmedTitle = title.trim();
  const errors = useMemo(() => {
    const e: { title?: string; due?: string } = {};
    if (!trimmedTitle) e.title = 'Give your task a clear title.';
    else if (trimmedTitle.length > 80) e.title = 'Keep it under 80 characters.';
    if (due.getTime() < Date.now() - 60_000) e.due = 'Due date is in the past.';
    return e;
  }, [trimmedTitle, due]);

  const handlePress = () => {
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;
    onSubmit({
      title: trimmedTitle,
      notes: notes.trim() || undefined,
      dueAt: due.toISOString(),
      xp,
    });
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 120 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label="Title"
          placeholder="e.g. Kanji review · set 12"
          value={title}
          onChangeText={setTitle}
          autoFocus={autoFocusTitle}
          maxLength={120}
          error={submitted ? errors.title : undefined}
          returnKeyType="next"
        />

        <View style={styles.section}>
          <Text variant="label" color={colors.textMuted}>
            Due
          </Text>
          <DatePickerInline value={due} onChange={setDue} />
          {submitted && errors.due ? (
            <Text variant="caption" color={colors.danger}>
              {errors.due}
            </Text>
          ) : null}
        </View>

        <Input
          label="Notes"
          placeholder="Optional · what's the goal?"
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <Stepper
          value={xp}
          onChange={setXp}
          step={XP_STEP}
          min={XP_MIN}
          max={XP_MAX}
          label="Set XP"
          suffix="XP on completion"
        />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: spacing.base + insets.bottom }]}>
        <Button
          label={submitLabel}
          size="lg"
          fullWidth
          loading={submitting}
          onPress={handlePress}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.base, paddingTop: spacing.base, gap: spacing.lg },
  section: { gap: spacing.sm },
  footer: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
