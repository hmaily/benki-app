import type { Friend, FriendRequest, LeaderboardEntry, Profile, Task } from './types';

const now = Date.now();
const hours = (n: number) => new Date(now + n * 60 * 60 * 1000).toISOString();
const days = (n: number) => new Date(now + n * 24 * 60 * 60 * 1000).toISOString();

export const seedProfile: Profile = {
  id: 'me',
  name: 'Your Name',
  email: 'you@benki.app',
  xp: 1480,
  league: 'latte',
  joinedAt: days(-42),
};

export const seedTasks: Task[] = [
  {
    id: 't1',
    title: 'Kanji review · set 12',
    notes: 'Anki deck, 30 cards',
    dueAt: hours(3),
    xp: 50,
    status: 'upcoming',
  },
  {
    id: 't2',
    title: 'Read chapter 4 of Genki II',
    notes: undefined,
    dueAt: hours(20),
    xp: 75,
    status: 'upcoming',
  },
  {
    id: 't3',
    title: 'Listening practice · NHK Easy',
    notes: '2 articles, take notes in Notion',
    dueAt: days(2),
    xp: 100,
    status: 'upcoming',
  },
  {
    id: 't4',
    title: 'Vocab quiz · week 6',
    notes: undefined,
    dueAt: hours(-30),
    xp: 50,
    status: 'missed',
  },
  {
    id: 't5',
    title: 'Write 3 sentences with て-form',
    notes: undefined,
    dueAt: hours(-72),
    xp: 25,
    status: 'missed',
  },
];

export const seedFriends: Friend[] = [
  { id: 'f1', name: 'Jennie', xp: 2380, avatarSeed: 'jennie', online: true },
  { id: 'f2', name: 'John', xp: 2105, avatarSeed: 'john' },
  { id: 'f3', name: 'Grace', xp: 1820, avatarSeed: 'grace', online: true },
  { id: 'f4', name: 'Mei Sue', xp: 1610, avatarSeed: 'meisue' },
  { id: 'f5', name: 'Aryan', xp: 1390, avatarSeed: 'aryan' },
  { id: 'f6', name: 'Apple', xp: 980, avatarSeed: 'apple' },
];

export const seedFriendRequests: FriendRequest[] = [
  { id: 'r1', name: 'Kenji', mutualCount: 3, avatarSeed: 'kenji' },
];

export const seedLeaderboard: LeaderboardEntry[] = [
  { id: 'l1', rank: 1, name: 'Jennie', xp: 2380, avatarSeed: 'jennie' },
  { id: 'l2', rank: 2, name: 'John', xp: 2105, avatarSeed: 'john' },
  { id: 'l3', rank: 3, name: 'Grace', xp: 1820, avatarSeed: 'grace' },
  { id: 'l4', rank: 4, name: 'Mei Sue', xp: 1610, avatarSeed: 'meisue' },
  { id: 'l5', rank: 5, name: 'You', xp: 1480, avatarSeed: 'me', isMe: true },
  { id: 'l6', rank: 6, name: 'Aryan', xp: 1390, avatarSeed: 'aryan' },
  { id: 'l7', rank: 7, name: 'Apple', xp: 980, avatarSeed: 'apple' },
  { id: 'l8', rank: 8, name: 'Kenji', xp: 740, avatarSeed: 'kenji' },
];
