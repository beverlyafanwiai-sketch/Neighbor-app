import { create } from 'zustand';

type LendNotesState = {
  notes: Record<string, string>;
  setNote: (itemId: string, note: string) => void;
};

export const useLendNotesStore = create<LendNotesState>((set) => ({
  notes: {},

  setNote: (itemId, note) => set((s) => ({ notes: { ...s.notes, [itemId]: note.trim() } })),
}));
