import { Check, X } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';
import { colors, spacing } from '@/theme';
import type { FriendRequest } from '@/lib/types';

interface FriendRequestCardProps {
  request: FriendRequest;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}

export function FriendRequestCard({ request, onAccept, onDecline }: FriendRequestCardProps) {
  return (
    <Card padding="md" tone="flat">
      <View style={styles.row}>
        <Avatar
          name={request.name}
          seed={request.fromUserId}
          size={40}
          source={request.avatarUrl ? { uri: request.avatarUrl } : undefined}
        />
        <View style={styles.body}>
          <Text variant="titleSm">{request.name}</Text>
          <Text variant="caption" color={colors.textMuted}>
            wants to study with you
          </Text>
        </View>
        <View style={styles.actions}>
          <Button
            label="Accept"
            size="sm"
            onPress={() => onAccept(request.id)}
            leftIcon={<Check size={14} color={colors.white} />}
          />
          <Button
            label="Decline"
            variant="secondary"
            size="sm"
            onPress={() => onDecline(request.id)}
            leftIcon={<X size={14} color={colors.text} />}
          />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' },
  body: { flex: 1, minWidth: 120 },
  actions: { flexDirection: 'row', gap: spacing.sm },
});
