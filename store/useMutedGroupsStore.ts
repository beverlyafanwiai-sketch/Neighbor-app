import { create } from 'zustand';

type MutedGroupsState = {
  // Timestamp the mute expires at — Infinity means muted until manually
  // unmuted. Absent (or in the past) means not muted.
  mutedUntil: Record<string, number>;
  isMuted: (groupId: string) => boolean;
  toggle: (groupId: string) => void;
  muteFor: (groupId: string, ms: number) => void;
};

export const useMutedGroupsStore = create<MutedGroupsState>((set, get) => ({
  mutedUntil: {},

  isMuted: (groupId) => (get().mutedUntil[groupId] ?? 0) > Date.now(),

  toggle: (groupId) =>
    set((s) => {
      if ((s.mutedUntil[groupId] ?? 0) > Date.now()) {
        const { [groupId]: _removed, ...mutedUntil } = s.mutedUntil;
        return { mutedUntil };
      }
      return { mutedUntil: { ...s.mutedUntil, [groupId]: Infinity } };
    }),

  muteFor: (groupId, ms) =>
    set((s) => ({ mutedUntil: { ...s.mutedUntil, [groupId]: Date.now() + ms } })),
}));

export function formatMutedUntil(until: number): string {
  if (until === Infinity) return 'Muted';
  const diffMs = until - Date.now();
  const diffHours = Math.round(diffMs / (60 * 60 * 1000));
  if (diffHours < 1) return 'Muted for less than 1h';
  if (diffHours < 24) return `Muted for ${diffHours}h`;
  const diffDays = Math.round(diffHours / 24);
  return `Muted for ${diffDays}d`;
}
