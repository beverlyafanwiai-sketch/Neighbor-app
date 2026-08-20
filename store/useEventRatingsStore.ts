import { create } from 'zustand';

import { ME } from '../data/mock';
import { useEventsStore } from './useEventsStore';

export type EventRating = { stars: number; comment: string };
export type EventRatingEntry = { userId: string; stars: number; comment: string };

type EventRatingsState = {
  myRatings: Record<string, EventRating>;
  rateEvent: (eventId: string, stars: number, comment: string) => void;
};

export const useEventRatingsStore = create<EventRatingsState>((set) => ({
  myRatings: {},

  rateEvent: (eventId, stars, comment) =>
    set((s) => ({ myRatings: { ...s.myRatings, [eventId]: { stars, comment } } })),
}));

// event.ratingBaseline is the list of individual ratings from other
// neighbors, *not including* ME -- same "baseline + mine" pattern as
// spotsTaken/helperCount.
export function getEffectiveRatings(
  eventId: string,
  myRating: EventRating | undefined,
  blockedIds: Record<string, boolean> = {}
): EventRatingEntry[] {
  const event = useEventsStore.getState().getEvent(eventId);
  const baseline = (event?.ratingBaseline ?? []).filter((r) => !blockedIds[r.userId]);
  return myRating
    ? [...baseline, { userId: ME.id, stars: myRating.stars, comment: myRating.comment }]
    : baseline;
}

export function getEffectiveRatingSummary(
  eventId: string,
  myRating: EventRating | undefined,
  blockedIds: Record<string, boolean> = {}
) {
  const ratings = getEffectiveRatings(eventId, myRating, blockedIds);
  const count = ratings.length;
  const total = ratings.reduce((sum, r) => sum + r.stars, 0);
  return { avg: count > 0 ? total / count : 0, count };
}
