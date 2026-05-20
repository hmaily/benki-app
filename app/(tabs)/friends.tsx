import { useFocusEffect, useRouter } from 'expo-router';
import { UserPlus, Users } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  EmptyState,
  ErrorState,
  FriendRequestCard,
  FriendRow,
  SectionHeader,
  TopBar,
} from '@/components/features';
import { Divider, IconButton, SearchBar, Skeleton } from '@/components/ui';
import { useFriends } from '@/lib/stores/friends';
import { errorMessage } from '@/lib/utils/errors';
import { colors, spacing } from '@/theme';

export default function FriendsScreen() {
  const friends = useFriends((s) => s.friends);
  const requests = useFriends((s) => s.requests);
  const status = useFriends((s) => s.status);
  const error = useFriends((s) => s.error);
  const load = useFriends((s) => s.load);
  const accept = useFriends((s) => s.acceptRequest);
  const decline = useFriends((s) => s.declineRequest);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [query, setQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (status === 'idle') void load();
    }, [status, load]),
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return friends;
    return friends.filter((f) => f.name.toLowerCase().includes(q));
  }, [friends, query]);

  const handleAccept = async (id: string) => {
    try {
      await accept(id);
    } catch (e) {
      Alert.alert('Could not accept request', errorMessage(e));
    }
  };

  const handleDecline = async (id: string) => {
    try {
      await decline(id);
    } catch (e) {
      Alert.alert('Could not decline request', errorMessage(e));
    }
  };

  const isInitialLoad = status === 'loading' && friends.length === 0 && requests.length === 0;

  return (
    <View style={styles.flex}>
      <TopBar
        title="Friends"
        right={
          <IconButton
            accessibilityLabel="Add friends"
            variant="plain"
            size={36}
            onPress={() => router.push('/add-friends')}
          >
            <UserPlus size={20} color={colors.text} />
          </IconButton>
        }
      />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 96 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={status === 'loading'}
            onRefresh={load}
            tintColor={colors.primary}
          />
        }
      >
        <SearchBar value={query} onChange={setQuery} placeholder="Search friends" />

        {status === 'error' ? (
          <ErrorState message={error ?? undefined} onRetry={load} />
        ) : isInitialLoad ? (
          <View style={styles.list}>
            <Skeleton height={56} rounded={12} />
            <Skeleton height={56} rounded={12} />
            <Skeleton height={56} rounded={12} />
          </View>
        ) : (
          <>
            {requests.length > 0 ? (
              <View style={styles.section}>
                <SectionHeader title={`Requests (${requests.length})`} />
                <View style={styles.list}>
                  {requests.map((r) => (
                    <FriendRequestCard
                      key={r.id}
                      request={r}
                      onAccept={handleAccept}
                      onDecline={handleDecline}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            <View style={styles.section}>
              <SectionHeader title="Friends" caption={`${friends.length} total`} />
              {filtered.length === 0 ? (
                <EmptyState
                  icon={<Users size={28} color={colors.primary} />}
                  title={query ? 'No matches' : 'Your dojo is empty'}
                  description={
                    query ? 'Try a different name.' : 'Find a study partner and grow together.'
                  }
                  actionLabel={query ? undefined : 'Find friends'}
                  onAction={query ? undefined : () => router.push('/add-friends')}
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
          </>
        )}
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
