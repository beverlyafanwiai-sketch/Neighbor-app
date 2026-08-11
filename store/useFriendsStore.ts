import { create } from 'zustand';

import { MY_FRIEND_IDS, getUser } from '../data/mock';
import { useNotificationsStore } from './useNotificationsStore';
import { useSettingsStore } from './useSettingsStore';

export type FriendStatus = 'none' | 'pending_out' | 'pending_in' | 'friends';

const ACCEPT_DELAY_MS = 3000;

export const FRIEND_LABEL: Record<FriendStatus, string> = {
  none: 'Add friend',
  pending_out: 'Requested',
  pending_in: 'Respond',
  friends: 'Friends',
};

type FriendsState = {
  statuses: Record<string, FriendStatus>;
  getStatus: (userId: string) => FriendStatus;
  isFriend: (userId: string) => boolean;
  sendRequest: (userId: string) => void;
  cancelRequest: (userId: string) => void;
  acceptRequest: (userId: string) => void;
  declineRequest: (userId: string) => void;
  unfriend: (userId: string) => void;
  respond: (userId: string) => void;
};

const initialStatuses: Record<string, FriendStatus> = {
  ...Object.fromEntries(MY_FRIEND_IDS.map((id) => [id, 'friends' as const])),
  nia: 'pending_in',
};

export const useFriendsStore = create<FriendsState>((set, get) => ({
  statuses: initialStatuses,

  getStatus: (userId) => get().statuses[userId] ?? 'none',

  isFriend: (userId) => get().statuses[userId] === 'friends',

  sendRequest: (userId) => {
    const current = get().statuses[userId] ?? 'none';
    if (current !== 'none') return;
    set((s) => ({ statuses: { ...s.statuses, [userId]: 'pending_out' } }));

    setTimeout(() => {
      if (get().statuses[userId] !== 'pending_out') return;
      set((s) => ({ statuses: { ...s.statuses, [userId]: 'friends' } }));

      if (useSettingsStore.getState().notificationPrefs.friendRequests) {
        const user = getUser(userId);
        if (user) {
          useNotificationsStore.getState().addNotification({
            type: 'friend',
            actorId: userId,
            text: `${user.name} accepted your friend request`,
            time: 'Just now',
            target: { kind: 'profile', id: userId },
          });
        }
      }
    }, ACCEPT_DELAY_MS);
  },

  cancelRequest: (userId) =>
    set((s) => ({ statuses: { ...s.statuses, [userId]: 'none' } })),

  acceptRequest: (userId) => {
    set((s) => ({ statuses: { ...s.statuses, [userId]: 'friends' } }));

    if (useSettingsStore.getState().notificationPrefs.friendRequests) {
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

  declineRequest: (userId) =>
    set((s) => ({ statuses: { ...s.statuses, [userId]: 'none' } })),

  unfriend: (userId) => set((s) => ({ statuses: { ...s.statuses, [userId]: 'none' } })),

  respond: (userId) => {
    const status = get().statuses[userId] ?? 'none';
    if (status === 'none') get().sendRequest(userId);
    else if (status === 'pending_out') get().cancelRequest(userId);
    else if (status === 'pending_in') get().acceptRequest(userId);
    else if (status === 'friends') get().unfriend(userId);
  },
}));
