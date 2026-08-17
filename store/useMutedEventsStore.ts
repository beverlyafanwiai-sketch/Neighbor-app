import { create } from 'zustand';

type MutedEventsState = {
  mutedEventIds: Record<string, boolean>;
  toggle: (eventId: string) => void;
};

export const useMutedEventsStore = create<MutedEventsState>((set) => ({
  mutedEventIds: {},

  toggle: (eventId) =>
    set((s) => ({ mutedEventIds: { ...s.mutedEventIds, [eventId]: !s.mutedEventIds[eventId] } })),
}));
