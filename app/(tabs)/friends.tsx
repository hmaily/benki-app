import { UserPlus, Users } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  EmptyState,
  FriendRequestCard,
  FriendRow,
  SectionHeader,
  TopBar,
} from '@/components/features';
import { Divider, IconButton, SearchBar } from '@/components/ui';
import { useFriends } from '@/lib/stores/friends';
import { colors, spacing } from '@/theme';

export default function FriendsScreen() {
  const friends = useFriends((s) => s.friends);
  const requests = useFriends((s) => s.requests);
  const accept = useFriends((s) => s.acceptRequest);
  const decline = useFriends((s) => s.declineRequest);
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter((f) => f.name.toLowerCase().includes(q));
  }, [friends, query]);

  return (
    <View style={styles.flex}>
      <TopBar
        title="Friends"
        right={
          <IconButton accessibilityLabel="Invite a friend" variant="plain" size={36}>
            <UserPlus size={20} color={colors.text} />
          </IconButton>
        }
      />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 96 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
      >
        <SearchBar value={query} onChange={setQuery} placeholder="Search friends" />

        {requests.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title={`Requests (${requests.length})`} />
            <View style={styles.list}>
              {requests.map((r) => (
                <FriendRequestCard key={r.id} request={r} onAccept={accept} onDecline={decline} />
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <SectionHeader
            title="Friends"
            caption={`${friends.length} total · ${friends.filter((f) => f.online).length} active`}
          />
          {filtered.length === 0 ? (
            <EmptyState
              icon={<Users size={28} color={colors.primary} />}
              title={query ? 'No matches' : 'Your dojo is empty'}
              description={
                query
                  ? 'Try a different name.'
                  : 'Invite a friend and study together.'
              }
            />
          ) : (
            <View style={styles.list}>
              {filtered.map((f, idx) => (
                <View key={f.id}>
                  <FriendRow friend={f} />
                  {idx < filtered.length - 1 ? <Divider /> : null}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    gap: spacing.xl,
  },
  section: { gap: spacing.sm },
  list: { gap: spacing.xs },
});
