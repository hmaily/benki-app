import { addHours, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DatePickerInline, TopBar } from '@/components/features';
import { Button, IconButton, Input, Stepper, Text } from '@/components/ui';
import { useTasks } from '@/lib/stores/tasks';
import { errorMessage } from '@/lib/utils/errors';
import { colors, spacing } from '@/theme';

const XP_STEP = 25;
const XP_MIN = 25;
const XP_MAX = 500;
const DEFAULT_XP = 50;

function defaultDue(): Date {
  // Today at 8pm — or 24h from now if it's already past 8pm.
  const today8pm = setMilliseconds(setSeconds(setMinutes(setHours(new Date(), 20), 0), 0), 0);
  return today8pm.getTime() > Date.now() ? today8pm : addHours(new Date(), 24);
}

export default function NewTaskScreen() {
  const router = useRouter();
  const addTask = useTasks((s) => s.add);
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [due, setDue] = useState<Date>(defaultDue);
  const [xp, setXp] = useState(DEFAULT_XP);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const trimmedTitle = title.trim();
  const errors = useMemo(() => {
    const e: { title?: string; due?: string } = {};
    if (!trimmedTitle) e.title = 'Give your task a clear title.';
    else if (trimmedTitle.length > 80) e.title = 'Keep it under 80 characters.';
    if (due.getTime() < Date.now() - 60_000) e.due = 'Due date is in the past.';
    return e;
  }, [trimmedTitle, due]);

  const canSubmit = Object.keys(errors).length === 0;

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!canSubmit) return;
    setSaving(true);
    try {
      await addTask({
        title: trimmedTitle,
        notes: notes.trim() || undefined,
        dueAt: due.toISOString(),
        xp,
      });
      router.back();
    } catch (e) {
      Alert.alert('Could not add task', errorMessage(e));
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <TopBar
        title="New Task"
        left={
          <IconButton
            accessibilityLabel="Back"
            variant="plain"
            size={36}
            onPress={() => router.back()}
          >
            <ChevronLeft size={22} color={colors.text} />
          </IconButton>
        }
      />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 120 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label="Title"
          placeholder="e.g. Kanji review · set 12"
          value={title}
          onChangeText={setTitle}
          autoFocus
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
          label="Add Task"
          size="lg"
          fullWidth
          loading={saving}
          onPress={handleSubmit}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
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
