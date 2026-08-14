import { create } from 'zustand';

type SavedSaleState = {
  savedIds: Record<string, boolean>;
  toggleSave: (itemId: string) => void;
};

export const useSavedSaleStore = create<SavedSaleState>((set) => ({
  savedIds: {},

  toggleSave: (itemId) =>
    set((s) => ({ savedIds: { ...s.savedIds, [itemId]: !s.savedIds[itemId] } })),
}));
