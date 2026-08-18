import { create } from 'zustand';

type PostNotesState = {
  notes: Record<string, string>;
  setNote: (postId: string, note: string) => void;
};

export const usePostNotesStore = create<PostNotesState>((set) => ({
  notes: {},

  setNote: (postId, note) => set((s) => ({ notes: { ...s.notes, [postId]: note.trim() } })),
}));
