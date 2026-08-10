import { create } from 'zustand';

import { MY_FRIEND_IDS } from '../data/mock';

type FriendsState = {
  friendIds: Record<string, boolean>;
  isFriend: (userId: string) => boolean;
  toggle: (userId: string) => void;
};

const initialFriends: Record<string, boolean> = Object.fromEntries(
  MY_FRIEND_IDS.map((id) => [id, true])
);

export const useFriendsStore = create<FriendsState>((set, get) => ({
  friendIds: initialFriends,

  isFriend: (userId) => get().friendIds[userId] ?? false,

  toggle: (userId) =>
    set((s) => ({ friendIds: { ...s.friendIds, [userId]: !s.friendIds[userId] } })),
}));
