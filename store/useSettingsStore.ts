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
  carpoolUpdates: boolean;
};

export type QuietHours = {
  enabled: boolean;
  startHour: number;
  endHour: number;
};

type SettingsState = {
  notificationPrefs: NotificationPrefs;
  quietHours: QuietHours;
  readReceipts: boolean;
  toggleNotificationPref: (key: keyof NotificationPrefs) => void;
  toggleQuietHours: () => void;
  setQuietHoursRange: (startHour: number, endHour: number) => void;
  toggleReadReceipts: () => void;
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
    carpoolUpdates: true,
  },
  quietHours: { enabled: false, startHour: 22, endHour: 7 },
  readReceipts: true,

  toggleNotificationPref: (key) =>
    set((s) => ({
      notificationPrefs: { ...s.notificationPrefs, [key]: !s.notificationPrefs[key] },
    })),

  toggleQuietHours: () =>
    set((s) => ({ quietHours: { ...s.quietHours, enabled: !s.quietHours.enabled } })),

  setQuietHoursRange: (startHour, endHour) =>
    set((s) => ({ quietHours: { ...s.quietHours, startHour, endHour } })),

  toggleReadReceipts: () => set((s) => ({ readReceipts: !s.readReceipts })),
}));

// Handles the overnight wraparound case (e.g. 10 PM to 7 AM spans midnight).
export function isQuietHoursActive(quietHours: QuietHours, now: Date): boolean {
  if (!quietHours.enabled || quietHours.startHour === quietHours.endHour) return false;
  const hour = now.getHours();
  const { startHour, endHour } = quietHours;
  if (startHour < endHour) return hour >= startHour && hour < endHour;
  return hour >= startHour || hour < endHour;
}
