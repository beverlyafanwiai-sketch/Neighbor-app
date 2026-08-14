import { create } from 'zustand';

type SavedLendState = {
  savedIds: Record<string, boolean>;
  toggleSave: (itemId: string) => void;
};

export const useSavedLendStore = create<SavedLendState>((set) => ({
  savedIds: {},

  toggleSave: (itemId) =>
    set((s) => ({ savedIds: { ...s.savedIds, [itemId]: !s.savedIds[itemId] } })),
}));
