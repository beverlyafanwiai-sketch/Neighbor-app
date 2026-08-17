import { create } from 'zustand';

type SavedNotesState = {
  notes: Record<string, string>;
  setNote: (key: string, note: string) => void;
};

export const useSavedNotesStore = create<SavedNotesState>((set) => ({
  notes: {},

  setNote: (key, note) => set((s) => ({ notes: { ...s.notes, [key]: note.trim() } })),
}));

export function savedNoteKey(type: string, itemId: string) {
  return `${type}:${itemId}`;
}
