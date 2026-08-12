import { create } from 'zustand';

export type NotificationPrefs = {
  messages: boolean;
  eventReminders: boolean;
  groupActivity: boolean;
  friendRequests: boolean;
  mentions: boolean;
  lendUpdates: boolean;
  recsActivity: boolean;
  welcomeNotes: boolean;
  saleUpdates: boolean;
};

type SettingsState = {
  notificationPrefs: NotificationPrefs;
  toggleNotificationPref: (key: keyof NotificationPrefs) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  notificationPrefs: {
    messages: true,
    eventReminders: true,
    groupActivity: true,
    friendRequests: true,
    mentions: true,
    lendUpdates: true,
    recsActivity: true,
    welcomeNotes: true,
    saleUpdates: true,
  },

  toggleNotificationPref: (key) =>
    set((s) => ({
      notificationPrefs: { ...s.notificationPrefs, [key]: !s.notificationPrefs[key] },
    })),
}));
