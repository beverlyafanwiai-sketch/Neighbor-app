import { create } from 'zustand';

import { ME, NEIGHBORHOOD_ALERTS, type AlertCategoryValue, type NeighborhoodAlert } from '../data/mock';

type AlertsState = {
  alerts: NeighborhoodAlert[];
  postAlert: (input: { category: AlertCategoryValue; text: string; durationHours: number }) => void;
  deleteAlert: (id: string) => void;
};

export const useAlertsStore = create<AlertsState>((set) => ({
  alerts: NEIGHBORHOOD_ALERTS,

  postAlert: ({ category, text, durationHours }) => {
    const now = Date.now();
    const alert: NeighborhoodAlert = {
      id: `alert-${now}`,
      authorId: ME.id,
      category,
      text,
      postedAt: now,
      expiresAt: now + durationHours * 60 * 60 * 1000,
    };
    set((s) => ({ alerts: [alert, ...s.alerts] }));
  },

  deleteAlert: (id) => set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),
}));

export function getActiveAlerts(alerts: NeighborhoodAlert[], now: number) {
  return alerts.filter((a) => a.expiresAt > now).sort((a, b) => a.expiresAt - b.expiresAt);
}

function formatDuration(ms: number): string {
  const hours = Math.round(ms / (60 * 60 * 1000));
  if (hours < 1) return 'less than 1h';
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  return `${days}d`;
}

export function formatPostedAgo(postedAt: number, now: number): string {
  return `${formatDuration(now - postedAt)} ago`;
}

export function formatExpiresIn(expiresAt: number, now: number): string {
  return `expires in ${formatDuration(expiresAt - now)}`;
}
