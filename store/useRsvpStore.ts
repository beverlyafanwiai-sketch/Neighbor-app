import { create } from 'zustand';

import { EVENTS, getEvent } from '../data/mock';

type RsvpState = {
  going: Record<string, boolean>;
  toggle: (eventId: string) => void;
};

const initialGoing: Record<string, boolean> = Object.fromEntries(
  EVENTS.filter((e) => e.status === 'upcoming').map((e) => [e.id, true])
);

export const useRsvpStore = create<RsvpState>((set, get) => ({
  going: initialGoing,

  toggle: (eventId) => {
    const event = getEvent(eventId);
    if (!event) return;

    const currentlyGoing = get().going[eventId] ?? false;
    if (!currentlyGoing && event.spotsTaken >= event.spotsTotal) {
      return;
    }

    set((s) => ({ going: { ...s.going, [eventId]: !currentlyGoing } }));
  },
}));

// event.spotsTaken is the baseline count of attendees *not including* the
// current user (ME). Effective totals fold in ME's own RSVP on top of that.
export function getEffectiveSpots(eventId: string, going: boolean) {
  const event = getEvent(eventId);
  if (!event) return { spotsTaken: 0, spotsTotal: 0, isFull: false };
  return {
    spotsTaken: event.spotsTaken + (going ? 1 : 0),
    spotsTotal: event.spotsTotal,
    isFull: !going && event.spotsTaken >= event.spotsTotal,
  };
}
