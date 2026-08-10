import { create } from 'zustand';

import { NOTIFICATIONS, type NotificationItem } from '../data/mock';

type NotificationsState = {
  notifications: NotificationItem[];
  markRead: (id: string) => void;
  markAllRead: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'read'>) => void;
};

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: NOTIFICATIONS,

  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),

  markAllRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

  addNotification: (item) => {
    const notification: NotificationItem = { id: `${Date.now()}`, read: false, ...item };
    set((s) => ({ notifications: [notification, ...s.notifications] }));
  },
}));
