import { create } from 'zustand';

type ProfileNotesState = {
  notes: Record<string, string>;
  setNote: (userId: string, note: string) => void;
};

export const useProfileNotesStore = create<ProfileNotesState>((set) => ({
  notes: {},

  setNote: (userId, note) => set((s) => ({ notes: { ...s.notes, [userId]: note.trim() } })),
}));
