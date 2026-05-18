import { MessageSquare, UserPlus } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Avatar } from '../ui/Avatar';
import { IconButton } from '../ui/IconButton';
import { Text } from '../ui/Text';
import { colors, spacing } from '@/theme';
import { formatXP } from '@/lib/utils/format';
import type { Friend } from '@/lib/types';

interface FriendRowProps {
  friend: Friend;
  onMessage?: (id: string) => void;
  onAdd?: (id: string) => void;
}

export function FriendRow({ friend, onMessage, onAdd }: FriendRowProps) {
  return (
    <View style={styles.row}>
      <Avatar name={friend.name} seed={friend.avatarSeed} size={44} online={friend.online} />
      <View style={styles.body}>
        <Text variant="titleSm">{friend.name}</Text>
        <Text variant="bodySm" color={colors.textMuted}>
          {formatXP(friend.xp)} XP
        </Text>
      </View>
      <View style={styles.actions}>
        <IconButton
          variant="tinted"
          size={36}
          accessibilityLabel={`Message ${friend.name}`}
          onPress={() => onMessage?.(friend.id)}
        >
          <MessageSquare size={18} color={colors.text} />
        </IconButton>
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
  actions: { flexDirection: 'row', gap: spacing.sm },
});
