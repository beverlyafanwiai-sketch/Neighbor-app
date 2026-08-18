import { create } from 'zustand';

type EventNotesState = {
  notes: Record<string, string>;
  setNote: (eventId: string, note: string) => void;
};

export const useEventNotesStore = create<EventNotesState>((set) => ({
  notes: {},

  setNote: (eventId, note) => set((s) => ({ notes: { ...s.notes, [eventId]: note.trim() } })),
}));
