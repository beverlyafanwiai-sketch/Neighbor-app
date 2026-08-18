import { create } from 'zustand';

import { NOTIFICATIONS, type NotificationItem } from '../data/mock';
import { isQuietHoursActive, useSettingsStore } from './useSettingsStore';

type NotificationsState = {
  notifications: NotificationItem[];
  toast: NotificationItem | null;
  snoozedUntil: Record<string, number>;
  pinnedId: string | null;
  markRead: (id: string) => void;
  markAllRead: () => void;
  addNotification: (item: Omit<NotificationItem, 'id' | 'read' | 'createdAt'>) => void;
  dismissToast: () => void;
  deleteNotification: (id: string) => void;
  snoozeNotification: (id: string, delayMs: number) => void;
  unsnoozeNotification: (id: string) => void;
  togglePin: (id: string) => void;
};

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: NOTIFICATIONS,
  toast: null,
  snoozedUntil: {},
  pinnedId: null,

  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),

  markAllRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

  addNotification: (item) => {
    const notification: NotificationItem = {
      id: `${Date.now()}`,
      read: false,
      createdAt: Date.now(),
      ...item,
    };
    const quietNow = isQuietHoursActive(useSettingsStore.getState().quietHours, new Date());
    set((s) => ({
      notifications: [notification, ...s.notifications],
      toast: quietNow ? s.toast : notification,
    }));
  },

  dismissToast: () => set({ toast: null }),

  deleteNotification: (id) =>
    set((s) => {
      const { [id]: _removed, ...snoozedUntil } = s.snoozedUntil;
      return {
        notifications: s.notifications.filter((n) => n.id !== id),
        snoozedUntil,
        pinnedId: s.pinnedId === id ? null : s.pinnedId,
      };
    }),

  snoozeNotification: (id, delayMs) => {
    const until = Date.now() + delayMs;
    set((s) => ({ snoozedUntil: { ...s.snoozedUntil, [id]: until } }));

    setTimeout(() => {
      if (get().snoozedUntil[id] !== until) return;
      set((s) => {
        const { [id]: _removed, ...snoozedUntil } = s.snoozedUntil;
        return { snoozedUntil };
      });
    }, delayMs);
  },

  unsnoozeNotification: (id) =>
    set((s) => {
      const { [id]: _removed, ...snoozedUntil } = s.snoozedUntil;
      return { snoozedUntil };
    }),

  togglePin: (id) => set((s) => ({ pinnedId: s.pinnedId === id ? null : id })),
}));
