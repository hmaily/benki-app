import { format, isToday, isYesterday } from 'date-fns';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, MessageSquare, Send } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Skeleton, Text } from '@/components/ui';
import { EmptyState, ErrorState, TopBar } from '@/components/features';
import { currentUserId } from '@/lib/stores/auth';
import { useChat } from '@/lib/stores/chat';
import { supabase } from '@/lib/supabase';
import type { Message } from '@/lib/types';
import { errorMessage } from '@/lib/utils/errors';
import { colors, radius, spacing, typography } from '@/theme';

interface FriendHeader {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export default function ChatScreen() {
  const { friendId } = useLocalSearchParams<{ friendId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const messages = useChat((s) => (friendId ? s.messagesByThread[friendId] : undefined)) ?? [];
  const status = useChat((s) => (friendId ? s.threadStatus[friendId] : undefined)) ?? 'idle';
  const error = useChat((s) => (friendId ? s.threadError[friendId] : undefined)) ?? null;
  const loadThread = useChat((s) => s.loadThread);
  const sendMessage = useChat((s) => s.sendMessage);
  const markThreadRead = useChat((s) => s.markThreadRead);
  const setActiveThread = useChat((s) => s.setActiveThread);

  const [friend, setFriend] = useState<FriendHeader | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Fetch friend header (name, avatar) — RLS allows reading friend profiles.
  useEffect(() => {
    if (!friendId) return;
    supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .eq('id', friendId)
      .single()
      .then(({ data }) => {
        if (data) setFriend({ id: data.id, name: data.name, avatarUrl: data.avatar_url });
      });
  }, [friendId]);

  // Set active thread + mark read on focus.
  useFocusEffect(
    useCallback(() => {
      if (!friendId) return;
      setActiveThread(friendId);
      if (status === 'idle') void loadThread(friendId);
      void markThreadRead(friendId);
      return () => setActiveThread(null);
    }, [friendId, status, loadThread, markThreadRead, setActiveThread]),
  );

  // Whenever the messages length changes, scroll to bottom.
  useEffect(() => {
    if (messages.length > 0) {
      requestAnimationFrame(() =>
        scrollRef.current?.scrollToEnd({ animated: true }),
      );
    }
  }, [messages.length]);

  const grouped = useMemo(() => groupByDay(messages), [messages]);
  const myId = currentUserId();

  const dismiss = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/friends');
  };

  const handleSend = async () => {
    if (!friendId) return;
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setText('');
    try {
      await sendMessage(friendId, body);
    } catch (e) {
      setText(body); // restore on failure so nothing is lost
      Alert.alert('Could not send', errorMessage(e));
    } finally {
      setSending(false);
    }
  };

  const canSend = text.trim().length > 0 && !sending;
  const isInitialLoading = status === 'loading' && messages.length === 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
      keyboardVerticalOffset={0}
    >
      <TopBar
        title={friend?.name ?? 'Chat'}
        left={
          <Pressable
            onPress={dismiss}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={8}
            style={styles.backBtn}
          >
            <ChevronLeft size={22} color={colors.text} />
          </Pressable>
        }
        right={
          friend ? (
            <Avatar
              name={friend.name}
              seed={friend.id}
              size={32}
              source={friend.avatarUrl ? { uri: friend.avatarUrl } : undefined}
            />
          ) : undefined
        }
      />

      {status === 'error' ? (
        <ErrorState
          message={error ?? undefined}
          onRetry={() => friendId && loadThread(friendId)}
        />
      ) : isInitialLoading ? (
        <View style={styles.loading}>
          <Skeleton height={44} rounded={radius.md} width="60%" />
          <Skeleton height={44} rounded={radius.md} width="70%" style={{ alignSelf: 'flex-end' }} />
          <Skeleton height={44} rounded={radius.md} width="50%" />
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.flex}>
          <EmptyState
            icon={<MessageSquare size={28} color={colors.primary} />}
            title="No messages yet"
            description={friend ? `Say hi to ${friend.name} to start the thread.` : 'Say hi to start the thread.'}
          />
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {grouped.map((group) => (
            <View key={group.date} style={styles.dayGroup}>
              <Text variant="caption" color={colors.textSubtle} center style={styles.dayLabel}>
                {group.label}
              </Text>
              {group.items.map((m) => (
                <MessageBubble key={m.id} message={m} isMine={m.senderId === myId} />
              ))}
            </View>
          ))}
        </ScrollView>
      )}

      <View style={[styles.composer, { paddingBottom: spacing.sm + insets.bottom }]}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Message…"
          placeholderTextColor={colors.textSubtle}
          style={[typography.body, styles.input, { color: colors.text }]}
          multiline
          maxLength={2000}
        />
        <Pressable
          onPress={handleSend}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel="Send message"
          style={({ pressed }) => [
            styles.sendBtn,
            !canSend && styles.sendBtnDisabled,
            pressed && canSend && styles.sendBtnPressed,
          ]}
        >
          <Send size={18} color={colors.white} strokeWidth={2.4} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({ message, isMine }: { message: Message; isMine: boolean }) {
  return (
    <View style={[styles.bubbleRow, isMine ? styles.bubbleRowMine : styles.bubbleRowOther]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
        <Text
          variant="body"
          color={isMine ? colors.white : colors.text}
          style={styles.bubbleBody}
        >
          {message.body}
        </Text>
        <Text
          variant="caption"
          color={isMine ? 'rgba(255,255,255,0.75)' : colors.textSubtle}
          style={styles.bubbleTime}
        >
          {format(new Date(message.createdAt), 'h:mm a')}
        </Text>
      </View>
    </View>
  );
}

interface Group {
  date: string;
  label: string;
  items: Message[];
}

function groupByDay(messages: Message[]): Group[] {
  const groups: Group[] = [];
  for (const m of messages) {
    const d = new Date(m.createdAt);
    const key = d.toISOString().slice(0, 10);
    const last = groups[groups.length - 1];
    if (last && last.date === key) {
      last.items.push(m);
    } else {
      groups.push({ date: key, label: dayLabel(d), items: [m] });
    }
  }
  return groups;
}

function dayLabel(d: Date): string {
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'EEEE, MMM d');
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  backBtn: { padding: spacing.xs },
  loading: { padding: spacing.base, gap: spacing.md },
  scroll: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
    gap: spacing.lg,
  },
  dayGroup: { gap: spacing.xs },
  dayLabel: { marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  bubbleRow: { flexDirection: 'row' },
  bubbleRowMine: { justifyContent: 'flex-end' },
  bubbleRowOther: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    gap: 2,
  },
  bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: radius.xs },
  bubbleOther: { backgroundColor: colors.surface, borderBottomLeftRadius: radius.xs },
  bubbleBody: {},
  bubbleTime: { alignSelf: 'flex-end' },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: colors.borderStrong },
  sendBtnPressed: { backgroundColor: colors.primaryPressed },
});
