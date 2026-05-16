export type TaskStatus = 'upcoming' | 'completed' | 'missed';

export interface Task {
  id: string;
  title: string;
  notes?: string;
  dueAt: string; // ISO timestamp
  xp: number;
  status: TaskStatus;
  completedAt?: string;
}

export interface Friend {
  id: string;
  name: string;
  xp: number;
  avatarSeed: string; // for deterministic initials/color
  online?: boolean;
}

export interface FriendRequest {
  id: string;
  name: string;
  mutualCount?: number;
  avatarSeed: string;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  xp: number;
  isMe?: boolean;
  avatarSeed: string;
}

export type LeaderboardRange = 'weekly' | 'allTime';

export type League = {
  key: 'espresso' | 'latte' | 'cappuccino' | 'mocha';
  label: string;
  minXP: number;
};

export interface Profile {
  id: string;
  name: string;
  email: string;
  xp: number;
  league: League['key'];
  joinedAt: string;
}

export type AuthProvider = 'google' | 'notion' | 'onenote' | 'email';
