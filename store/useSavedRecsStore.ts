import { create } from 'zustand';

type SavedRecsState = {
  savedIds: Record<string, boolean>;
  toggleSave: (entryId: string) => void;
};

export const useSavedRecsStore = create<SavedRecsState>((set) => ({
  savedIds: {},

  toggleSave: (entryId) =>
    set((s) => ({ savedIds: { ...s.savedIds, [entryId]: !s.savedIds[entryId] } })),
}));
