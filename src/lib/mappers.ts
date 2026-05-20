/**
 * Mappers from Supabase row shapes to the app's domain types.
 * Keeping these in one place means screens and stores never touch
 * snake_case DB columns directly.
 */
import type { Database } from './database.types';
import type {
  Friend,
  FriendRequest,
  LeaderboardEntry,
  LeagueKey,
  Profile,
  Task,
  UserSearchResult,
} from './types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type TaskRow = Database['public']['Tables']['tasks']['Row'];
type LeaderboardRow = Database['public']['Functions']['get_leaderboard']['Returns'][number];
type SearchRow = Database['public']['Functions']['search_profiles']['Returns'][number];

const LEAGUE_KEYS: readonly LeagueKey[] = ['espresso', 'latte', 'cappuccino', 'mocha'];

function toLeagueKey(value: string | null): LeagueKey {
  return value && (LEAGUE_KEYS as readonly string[]).includes(value)
    ? (value as LeagueKey)
    : 'espresso';
}

export function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatarUrl: row.avatar_url,
    xp: row.xp,
    league: toLeagueKey(row.league),
    joinedAt: row.created_at,
  };
}

/** Derive upcoming / missed / completed from completed_at and due_at. */
export function toTask(row: TaskRow): Task {
  const status: Task['status'] = row.completed_at
    ? 'completed'
    : new Date(row.due_at).getTime() < Date.now()
      ? 'missed'
      : 'upcoming';

  return {
    id: row.id,
    title: row.title,
    notes: row.notes ?? undefined,
    dueAt: row.due_at,
    xp: row.xp,
    status,
    completedAt: row.completed_at ?? undefined,
  };
}

export function toLeaderboardEntry(row: LeaderboardRow): LeaderboardEntry {
  return {
    id: row.id,
    rank: row.rank,
    name: row.name,
    xp: row.xp,
    isMe: row.is_me,
    avatarUrl: row.avatar_url,
  };
}

/** A friends row joined with the friend's profile. */
export function toFriend(profile: Pick<ProfileRow, 'id' | 'name' | 'xp' | 'avatar_url'>): Friend {
  return {
    id: profile.id,
    name: profile.name,
    xp: profile.xp,
    avatarUrl: profile.avatar_url,
  };
}

export function toUserSearchResult(row: SearchRow): UserSearchResult {
  return {
    id: row.id,
    name: row.name,
    avatarUrl: row.avatar_url,
    xp: row.xp,
  };
}

/** A friend_requests row joined with the sender's profile. */
export function toFriendRequest(
  requestId: string,
  sender: Pick<ProfileRow, 'id' | 'name' | 'avatar_url'>,
): FriendRequest {
  return {
    id: requestId,
    fromUserId: sender.id,
    name: sender.name,
    avatarUrl: sender.avatar_url,
  };
}
