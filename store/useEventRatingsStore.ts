import { create } from 'zustand';

import { useEventsStore } from './useEventsStore';

export type EventRating = { stars: number; comment: string };

type EventRatingsState = {
  myRatings: Record<string, EventRating>;
  rateEvent: (eventId: string, stars: number, comment: string) => void;
};

export const useEventRatingsStore = create<EventRatingsState>((set) => ({
  myRatings: {},

  rateEvent: (eventId, stars, comment) =>
    set((s) => ({ myRatings: { ...s.myRatings, [eventId]: { stars, comment } } })),
}));

// event.ratingBaseline is the average/count from other neighbors, *not
// including* ME -- same "baseline + mine" pattern as spotsTaken/helperCount.
export function getEffectiveRatingSummary(eventId: string, myRating: EventRating | undefined) {
  const event = useEventsStore.getState().getEvent(eventId);
  const baseline = event?.ratingBaseline;
  const baseCount = baseline?.count ?? 0;
  const baseTotal = (baseline?.avg ?? 0) * baseCount;
  const count = baseCount + (myRating ? 1 : 0);
  const total = baseTotal + (myRating ? myRating.stars : 0);
  return { avg: count > 0 ? total / count : 0, count };
}
