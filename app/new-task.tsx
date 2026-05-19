import { addHours, setHours, setMilliseconds, setMinutes, setSeconds } from 'date-fns';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';

import { TaskForm, type TaskFormSubmit, TopBar } from '@/components/features';
import { IconButton } from '@/components/ui';
import { useTasks } from '@/lib/stores/tasks';
import { errorMessage } from '@/lib/utils/errors';
import { colors } from '@/theme';

function defaultDue(): Date {
  // Today at 8pm — or 24h from now if it's already past 8pm.
  const today8pm = setMilliseconds(setSeconds(setMinutes(setHours(new Date(), 20), 0), 0), 0);
  return today8pm.getTime() > Date.now() ? today8pm : addHours(new Date(), 24);
}

export default function NewTaskScreen() {
  const router = useRouter();
  const addTask = useTasks((s) => s.add);
  const [saving, setSaving] = useState(false);

  const dismiss = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleSubmit = async (values: TaskFormSubmit) => {
    setSaving(true);
    try {
      await addTask(values);
      dismiss();
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
          <IconButton accessibilityLabel="Back" variant="plain" size={36} onPress={dismiss}>
            <ChevronLeft size={22} color={colors.text} />
          </IconButton>
        }
      />
      <TaskForm
        initial={{ title: '', notes: '', due: defaultDue(), xp: 50 }}
        submitLabel="Add Task"
        submitting={saving}
        onSubmit={handleSubmit}
        autoFocusTitle
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
});
