import { create } from 'zustand';

type DismissedEventsState = {
  dismissedIds: Record<string, boolean>;
  dismissEvent: (eventId: string) => void;
};

export const useDismissedEventsStore = create<DismissedEventsState>((set) => ({
  dismissedIds: {},

  dismissEvent: (eventId) =>
    set((s) => ({ dismissedIds: { ...s.dismissedIds, [eventId]: true } })),
}));
