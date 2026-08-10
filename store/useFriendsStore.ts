import { create } from 'zustand';

import { MY_FRIEND_IDS, getUser } from '../data/mock';
import { useNotificationsStore } from './useNotificationsStore';
import { useSettingsStore } from './useSettingsStore';

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

  toggle: (userId) => {
    const becomingFriends = !get().friendIds[userId];
    set((s) => ({ friendIds: { ...s.friendIds, [userId]: becomingFriends } }));

    if (becomingFriends && useSettingsStore.getState().notificationPrefs.friendRequests) {
      const user = getUser(userId);
      if (user) {
        useNotificationsStore.getState().addNotification({
          type: 'friend',
          actorId: userId,
          text: `You and ${user.name} are now friends`,
          time: 'Just now',
          target: { kind: 'profile', id: userId },
        });
      }
    }
  },
}));
