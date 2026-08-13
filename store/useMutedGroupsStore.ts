import { create } from 'zustand';

type MutedGroupsState = {
  mutedGroupIds: Record<string, boolean>;
  isMuted: (groupId: string) => boolean;
  toggle: (groupId: string) => void;
};

export const useMutedGroupsStore = create<MutedGroupsState>((set, get) => ({
  mutedGroupIds: {},

  isMuted: (groupId) => get().mutedGroupIds[groupId] ?? false,

  toggle: (groupId) =>
    set((s) => ({ mutedGroupIds: { ...s.mutedGroupIds, [groupId]: !s.mutedGroupIds[groupId] } })),
}));
