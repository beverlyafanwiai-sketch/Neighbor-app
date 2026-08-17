import { create } from 'zustand';

type GroupNotesState = {
  notes: Record<string, string>;
  setNote: (groupId: string, note: string) => void;
};

export const useGroupNotesStore = create<GroupNotesState>((set) => ({
  notes: {},

  setNote: (groupId, note) => set((s) => ({ notes: { ...s.notes, [groupId]: note.trim() } })),
}));
