import { create } from 'zustand';

import { useFriendsStore } from './useFriendsStore';

type BlockedState = {
  blockedIds: Record<string, boolean>;
  isBlocked: (userId: string) => boolean;
  toggle: (userId: string) => void;
};

export const useBlockedStore = create<BlockedState>((set, get) => ({
  blockedIds: {},

  isBlocked: (userId) => get().blockedIds[userId] ?? false,

  toggle: (userId) => {
    const blocking = !get().blockedIds[userId];
    set((s) => ({ blockedIds: { ...s.blockedIds, [userId]: blocking } }));

    if (blocking && useFriendsStore.getState().getStatus(userId) !== 'none') {
      useFriendsStore.getState().unfriend(userId);
    }
  },
}));
