import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, FileQuestion, Trash2 } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { EmptyState, TaskForm, type TaskFormSubmit, TopBar } from '@/components/features';
import { IconButton, Skeleton } from '@/components/ui';
import { useTasks } from '@/lib/stores/tasks';
import { errorMessage } from '@/lib/utils/errors';
import { colors, spacing } from '@/theme';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const items = useTasks((s) => s.items);
  const status = useTasks((s) => s.status);
  const load = useTasks((s) => s.load);
  const update = useTasks((s) => s.update);
  const remove = useTasks((s) => s.remove);

  const [saving, setSaving] = useState(false);

  // Tasks may not be loaded yet (cold start / deep link into this route).
  useFocusEffect(
    useCallback(() => {
      if (status === 'idle') void load();
    }, [status, load]),
  );

  const task = items.find((t) => t.id === id);

  const dismiss = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleSave = async (values: TaskFormSubmit) => {
    if (!id) return;
    setSaving(true);
    try {
      await update(id, values);
      dismiss();
    } catch (e) {
      Alert.alert('Could not save changes', errorMessage(e));
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert('Delete task', 'This task will be removed permanently.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await remove(id);
            dismiss();
          } catch (e) {
            Alert.alert('Could not delete task', errorMessage(e));
          }
        },
      },
    ]);
  };

  const stillLoading = !task && (status === 'idle' || status === 'loading');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <TopBar
        title="Edit Task"
        left={
          <IconButton accessibilityLabel="Back" variant="plain" size={36} onPress={dismiss}>
            <ChevronLeft size={22} color={colors.text} />
          </IconButton>
        }
        right={
          task ? (
            <IconButton
              accessibilityLabel="Delete task"
              variant="plain"
              size={36}
              onPress={handleDelete}
            >
              <Trash2 size={20} color={colors.danger} />
            </IconButton>
          ) : undefined
        }
      />

      {task ? (
        <TaskForm
          initial={{
            title: task.title,
            notes: task.notes ?? '',
            due: new Date(task.dueAt),
            xp: task.xp,
          }}
          submitLabel="Save Changes"
          submitting={saving}
          onSubmit={handleSave}
        />
      ) : stillLoading ? (
        <View style={styles.placeholder}>
          <Skeleton height={52} rounded={12} />
          <Skeleton height={120} rounded={12} />
          <Skeleton height={96} rounded={12} />
        </View>
      ) : (
        <EmptyState
          icon={<FileQuestion size={28} color={colors.primary} />}
          title="Task not found"
          description="It may have been deleted."
          actionLabel="Back to Home"
          onAction={dismiss}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  placeholder: { padding: spacing.base, gap: spacing.base },
});
