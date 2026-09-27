import { MessageSquare, UserPlus } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Avatar } from '../ui/Avatar';
import { IconButton } from '../ui/IconButton';
import { Text } from '../ui/Text';
import type { Friend } from '@/lib/types';
import { formatXP } from '@/lib/utils/format';
import { colors, spacing } from '@/theme';

interface FriendRowProps {
  friend: Friend;
  unreadCount?: number;
  onMessage?: (id: string) => void;
  onAdd?: (id: string) => void;
}

export function FriendRow({ friend, unreadCount = 0, onMessage, onAdd }: FriendRowProps) {
  const messageLabel =
    unreadCount > 0
      ? `Message ${friend.name} (${unreadCount} unread)`
      : `Message ${friend.name}`;

  return (
    <View style={styles.row}>
      <Avatar
        name={friend.name}
        seed={friend.id}
        size={44}
        source={friend.avatarUrl ? { uri: friend.avatarUrl } : undefined}
      />
      <View style={styles.body}>
        <Text variant="titleSm">{friend.name}</Text>
        <Text variant="bodySm" color={colors.textMuted}>
          {formatXP(friend.xp)} XP
        </Text>
      </View>
      <View style={styles.actions}>
        <View>
          <IconButton
            variant="tinted"
            size={36}
            accessibilityLabel={messageLabel}
            onPress={() => onMessage?.(friend.id)}
          >
            <MessageSquare size={18} color={colors.text} />
          </IconButton>
          {unreadCount > 0 ? (
            <View style={styles.unreadDot}>
              <Text variant="caption" color={colors.white} style={styles.unreadCount}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          ) : null}
        </View>
        <IconButton
          variant="solid"
          size={36}
          accessibilityLabel={`Suggest a study group with ${friend.name}`}
          onPress={() => onAdd?.(friend.id)}
        >
          <UserPlus size={18} color={colors.text} />
        </IconButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  body: { flex: 1, gap: 2 },
  actions: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  unreadDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.background,
  },
  unreadCount: { fontSize: 10, lineHeight: 12 },
});
