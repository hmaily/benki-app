import { useRouter } from 'expo-router';
import { Check, ChevronLeft, UserPlus, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { EmptyState, ErrorState, TopBar } from '@/components/features';
import { Avatar, Badge, Button, Divider, IconButton, SearchBar, Skeleton, Text } from '@/components/ui';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useFriends } from '@/lib/stores/friends';
import type { UserSearchResult } from '@/lib/types';
import { errorMessage } from '@/lib/utils/errors';
import { formatXP } from '@/lib/utils/format';
import { colors, spacing } from '@/theme';

type SearchState = 'idle' | 'searching' | 'done' | 'error';

const MIN_QUERY = 2;

export default function AddFriendsScreen() {
  const router = useRouter();
  const searchUsers = useFriends((s) => s.searchUsers);
  const sendRequest = useFriends((s) => s.sendRequest);
  const outgoingPendingIds = useFriends((s) => s.outgoingPendingIds);

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query);

  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const [searchError, setSearchError] = useState<string | null>(null);

  const [requestedIds, setRequestedIds] = useState<Set<string>>(new Set());
  const [sendingId, setSendingId] = useState<string | null>(null);

  // Pre-load people we already have a pending request to.
  useEffect(() => {
    outgoingPendingIds()
      .then((ids) => setRequestedIds(new Set(ids)))
      .catch(() => {
        /* non-fatal — the unique constraint still prevents duplicates */
      });
  }, [outgoingPendingIds]);

  // Run the (debounced) search.
  useEffect(() => {
    const q = debouncedQuery.trim();
    if (q.length < MIN_QUERY) {
      setResults([]);
      setSearchState('idle');
      return;
    }

    let cancelled = false;
    setSearchState('searching');
    setSearchError(null);
    searchUsers(q)
      .then((r) => {
        if (!cancelled) {
          setResults(r);
          setSearchState('done');
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setSearchError(errorMessage(e));
          setSearchState('error');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, searchUsers]);

  const dismiss = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/friends');
    }
  };

  const handleAdd = async (user: UserSearchResult) => {
    setSendingId(user.id);
    try {
      await sendRequest(user.id);
      setRequestedIds((prev) => new Set(prev).add(user.id));
    } catch (e) {
      Alert.alert('Could not send request', errorMessage(e));
    } finally {
      setSendingId(null);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <TopBar
        title="Add Friends"
        left={
          <IconButton accessibilityLabel="Back" variant="plain" size={36} onPress={dismiss}>
            <ChevronLeft size={22} color={colors.text} />
          </IconButton>
        }
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <SearchBar value={query} onChange={setQuery} placeholder="Search by name" />

        {searchState === 'idle' ? (
          <EmptyState
            icon={<UserPlus size={28} color={colors.primary} />}
            title="Find study partners"
            description="Search for someone by name to send them a friend request."
          />
        ) : searchState === 'searching' ? (
          <View style={styles.list}>
            <Skeleton height={56} rounded={12} />
            <Skeleton height={56} rounded={12} />
            <Skeleton height={56} rounded={12} />
          </View>
        ) : searchState === 'error' ? (
          <ErrorState
            message={searchError ?? undefined}
            onRetry={() => setQuery((q) => `${q} `.trimEnd())}
          />
        ) : results.length === 0 ? (
          <EmptyState
            icon={<Users size={28} color={colors.primary} />}
            title="No one found"
            description="Try a different name."
          />
        ) : (
          <View style={styles.list}>
            {results.map((user, idx) => (
              <View key={user.id}>
                <ResultRow
                  user={user}
                  requested={requestedIds.has(user.id)}
                  sending={sendingId === user.id}
                  onAdd={() => handleAdd(user)}
                />
                {idx < results.length - 1 ? <Divider /> : null}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ResultRow({
  user,
  requested,
  sending,
  onAdd,
}: {
  user: UserSearchResult;
  requested: boolean;
  sending: boolean;
  onAdd: () => void;
}) {
  return (
    <View style={styles.row}>
      <Avatar
        name={user.name}
        seed={user.id}
        size={44}
        source={user.avatarUrl ? { uri: user.avatarUrl } : undefined}
      />
      <View style={styles.rowBody}>
        <Text variant="titleSm">{user.name}</Text>
        <Text variant="bodySm" color={colors.textMuted}>
          {formatXP(user.xp)} XP
        </Text>
      </View>
      {requested ? (
        <Badge
          tone="success"
          label="Requested"
          leftIcon={<Check size={12} color={colors.success} />}
        />
      ) : (
        <Button
          label="Add"
          size="sm"
          loading={sending}
          onPress={onAdd}
          leftIcon={<UserPlus size={14} color={colors.white} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.base, paddingTop: spacing.base, gap: spacing.base },
  list: { gap: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  rowBody: { flex: 1, gap: 2 },
});
