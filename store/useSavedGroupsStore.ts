import { create } from 'zustand';

type SavedGroupsState = {
  savedIds: Record<string, boolean>;
  toggleSave: (groupId: string) => void;
};

export const useSavedGroupsStore = create<SavedGroupsState>((set) => ({
  savedIds: {},

  toggleSave: (groupId) =>
    set((s) => ({ savedIds: { ...s.savedIds, [groupId]: !s.savedIds[groupId] } })),
}));
