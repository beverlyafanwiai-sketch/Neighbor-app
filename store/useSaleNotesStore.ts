import { create } from 'zustand';

type SaleNotesState = {
  notes: Record<string, string>;
  setNote: (itemId: string, note: string) => void;
};

export const useSaleNotesStore = create<SaleNotesState>((set) => ({
  notes: {},

  setNote: (itemId, note) => set((s) => ({ notes: { ...s.notes, [itemId]: note.trim() } })),
}));
