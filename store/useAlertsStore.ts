import { create } from 'zustand';

import { ME, NEIGHBORHOOD_ALERTS, type AlertCategoryValue, type NeighborhoodAlert } from '../data/mock';

export type AlertDraft = {
  id: string;
  category: AlertCategoryValue;
  text: string;
  durationHours: number;
  updatedAt: number;
};

type AlertDraftInput = Omit<AlertDraft, 'updatedAt' | 'id'> & { id?: string };

type AlertsState = {
  alerts: NeighborhoodAlert[];
  drafts: AlertDraft[];
  pinnedAlertId: string | null;
  myConfirmed: Record<string, boolean>;
  postAlert: (input: { category: AlertCategoryValue; text: string; durationHours: number }) => void;
  updateAlert: (
    id: string,
    input: { category: AlertCategoryValue; text: string; durationHours: number }
  ) => void;
  deleteAlert: (id: string) => void;
  pinAlert: (id: string) => void;
  unpinAlert: () => void;
  toggleConfirm: (id: string) => void;
  resolveAlert: (id: string) => void;
  reopenAlert: (id: string) => void;
  saveDraft: (input: AlertDraftInput) => string;
  deleteDraft: (id: string) => void;
};

let alertDraftSeq = 0;

export const useAlertsStore = create<AlertsState>((set) => ({
  alerts: NEIGHBORHOOD_ALERTS,
  drafts: [],
  pinnedAlertId: null,
  myConfirmed: {},

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

  updateAlert: (id, { category, text, durationHours }) =>
    set((s) => ({
      alerts: s.alerts.map((a) =>
        a.id === id
          ? { ...a, category, text, expiresAt: Date.now() + durationHours * 60 * 60 * 1000 }
          : a
      ),
    })),

  deleteAlert: (id) =>
    set((s) => ({
      alerts: s.alerts.filter((a) => a.id !== id),
      pinnedAlertId: s.pinnedAlertId === id ? null : s.pinnedAlertId,
    })),

  pinAlert: (id) => set({ pinnedAlertId: id }),

  unpinAlert: () => set({ pinnedAlertId: null }),

  toggleConfirm: (id) =>
    set((s) => ({ myConfirmed: { ...s.myConfirmed, [id]: !s.myConfirmed[id] } })),

  resolveAlert: (id) =>
    set((s) => ({ alerts: s.alerts.map((a) => (a.id === id ? { ...a, resolved: true } : a)) })),

  reopenAlert: (id) =>
    set((s) => ({ alerts: s.alerts.map((a) => (a.id === id ? { ...a, resolved: false } : a)) })),

  saveDraft: (input) => {
    const draftId = input.id ?? `alert-draft-${++alertDraftSeq}`;
    const updatedAt = Date.now();
    set((s) => {
      const draft: AlertDraft = { ...input, id: draftId, updatedAt };
      const exists = s.drafts.some((d) => d.id === draftId);
      return {
        drafts: exists
          ? s.drafts.map((d) => (d.id === draftId ? draft : d))
          : [draft, ...s.drafts],
      };
    });
    return draftId;
  },

  deleteDraft: (id) => set((s) => ({ drafts: s.drafts.filter((d) => d.id !== id) })),
}));

// alert.confirmedByIds is the baseline list of other neighbors *not including*
// ME who've confirmed the alert is still happening. Effective totals fold in
// ME's own confirmation on top of that.
export function getEffectiveConfirmedIds(alert: NeighborhoodAlert, confirmed: boolean): string[] {
  const base = alert.confirmedByIds ?? [];
  return confirmed ? [...base, ME.id] : base;
}

export function getEffectiveConfirmCount(alert: NeighborhoodAlert, confirmed: boolean) {
  return getEffectiveConfirmedIds(alert, confirmed).length;
}

export function getActiveAlerts(
  alerts: NeighborhoodAlert[],
  now: number,
  pinnedId?: string | null
) {
  return alerts
    .filter((a) => a.expiresAt > now)
    .sort((a, b) => {
      if (pinnedId) {
        const diff = Number(b.id === pinnedId) - Number(a.id === pinnedId);
        if (diff !== 0) return diff;
      }
      return a.expiresAt - b.expiresAt;
    });
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
