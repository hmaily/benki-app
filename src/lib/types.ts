export type TaskStatus = 'upcoming' | 'completed' | 'missed';

export interface Task {
  id: string;
  title: string;
  notes?: string;
  dueAt: string; // ISO timestamp
  xp: number;
  status: TaskStatus; // derived from completedAt + dueAt, not stored
  completedAt?: string;
}

export interface Friend {
  id: string;
  name: string;
  xp: number;
  avatarUrl: string | null;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  name: string;
  avatarUrl: string | null;
}

/** A profile surfaced by friend search — not yet a friend. */
export interface UserSearchResult {
  id: string;
  name: string;
  avatarUrl: string | null;
  xp: number;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  xp: number;
  isMe: boolean;
  avatarUrl: string | null;
}

export type LeaderboardRange = 'weekly' | 'allTime';

export type LeagueKey = 'espresso' | 'latte' | 'cappuccino' | 'mocha';

export type League = {
  key: LeagueKey;
  label: string;
  minXP: number;
};

export interface Profile {
  id: string;
  name: string;
  email: string | null;
  avatarUrl: string | null;
  xp: number;
  league: LeagueKey;
  joinedAt: string;
}

export type AuthProvider = 'google' | 'apple' | 'email';
