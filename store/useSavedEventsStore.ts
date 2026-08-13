import { create } from 'zustand';

type SavedEventsState = {
  savedIds: Record<string, boolean>;
  toggleSave: (eventId: string) => void;
};

export const useSavedEventsStore = create<SavedEventsState>((set) => ({
  savedIds: {},

  toggleSave: (eventId) =>
    set((s) => ({ savedIds: { ...s.savedIds, [eventId]: !s.savedIds[eventId] } })),
}));
