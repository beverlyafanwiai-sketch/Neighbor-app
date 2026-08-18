import { create } from 'zustand';

type RecNotesState = {
  notes: Record<string, string>;
  setNote: (entryId: string, note: string) => void;
};

export const useRecNotesStore = create<RecNotesState>((set) => ({
  notes: {},

  setNote: (entryId, note) => set((s) => ({ notes: { ...s.notes, [entryId]: note.trim() } })),
}));
