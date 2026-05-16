import { create } from 'zustand';
import { seedFriendRequests, seedFriends } from '../seed';
import type { Friend, FriendRequest } from '../types';

interface FriendsState {
  friends: Friend[];
  requests: FriendRequest[];
  acceptRequest: (id: string) => void;
  declineRequest: (id: string) => void;
}

export const useFriends = create<FriendsState>((set, get) => ({
  friends: seedFriends,
  requests: seedFriendRequests,
  acceptRequest: (id) => {
    const req = get().requests.find((r) => r.id === id);
    if (!req) return;
    set({
      requests: get().requests.filter((r) => r.id !== id),
      friends: [
        { id: req.id, name: req.name, xp: 0, avatarSeed: req.avatarSeed },
        ...get().friends,
      ],
    });
  },
  declineRequest: (id) =>
    set({ requests: get().requests.filter((r) => r.id !== id) }),
}));
