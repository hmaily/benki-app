import { Check, Clock, RotateCcw } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Badge } from '../ui/Badge';
import { PressableCard } from '../ui/Card';
import { Text } from '../ui/Text';
import { colors, radius, spacing } from '@/theme';
import { formatDueDate } from '@/lib/utils/format';
import type { Task } from '@/lib/types';

interface TaskCardProps {
  task: Task;
  onToggleComplete?: (id: string) => void;
  onReschedule?: (id: string) => void;
  onPress?: (id: string) => void;
}

export function TaskCard({ task, onToggleComplete, onReschedule, onPress }: TaskCardProps) {
  const isMissed = task.status === 'missed';
  const isCompleted = task.status === 'completed';

  return (
    <PressableCard
      onPress={onPress ? () => onPress(task.id) : undefined}
      tone={isMissed ? 'muted' : 'surface'}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`${task.title}, ${formatDueDate(task.dueAt)}, ${task.xp} XP`}
    >
      <View style={styles.row}>
        <Pressable
          hitSlop={8}
          onPress={() => onToggleComplete?.(task.id)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isCompleted }}
          accessibilityLabel={isCompleted ? 'Mark as not done' : 'Mark as done'}
          style={[
            styles.checkbox,
            isCompleted && styles.checkboxChecked,
            isMissed && styles.checkboxMissed,
          ]}
        >
          {isCompleted ? <Check size={14} color={colors.white} strokeWidth={3} /> : null}
        </Pressable>

        <View style={styles.body}>
          <Text
            variant="titleSm"
            numberOfLines={2}
            style={isCompleted ? styles.strike : undefined}
          >
            {task.title}
          </Text>
          {task.notes ? (
            <Text variant="bodySm" color={colors.textMuted} numberOfLines={2}>
              {task.notes}
            </Text>
          ) : null}
          <View style={styles.metaRow}>
            <Badge
              tone={isMissed ? 'danger' : 'neutral'}
              leftIcon={<Clock size={12} color={isMissed ? colors.danger : colors.textMuted} />}
              label={formatDueDate(task.dueAt)}
            />
            <Badge tone="xp" label={`+${task.xp} XP`} />
            {isMissed && onReschedule ? (
              <Pressable
                hitSlop={6}
                onPress={() => onReschedule(task.id)}
                accessibilityRole="button"
                style={styles.rescheduleBtn}
              >
                <RotateCcw size={12} color={colors.primary} />
                <Text variant="caption" color={colors.primary}>
                  Reschedule
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </PressableCard>
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: spacing.md, paddingHorizontal: spacing.base },
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  body: { flex: 1, gap: spacing.xs },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: { backgroundColor: colors.success, borderColor: colors.success },
  checkboxMissed: { borderColor: colors.danger },
  strike: { textDecorationLine: 'line-through', color: colors.textMuted },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs, alignItems: 'center' },
  rescheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.xpBg,
  },
});
