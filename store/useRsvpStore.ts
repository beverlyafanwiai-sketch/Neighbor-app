import { create } from 'zustand';

import { EVENTS } from '../data/mock';
import { useEventsStore } from './useEventsStore';
import { useNotificationsStore } from './useNotificationsStore';
import { useSettingsStore } from './useSettingsStore';

const WAITLIST_PROMOTION_DELAY_MS = 4000;

type RsvpState = {
  going: Record<string, boolean>;
  waitlisted: Record<string, boolean>;
  toggle: (eventId: string) => void;
  joinWaitlist: (eventId: string) => void;
  leaveWaitlist: (eventId: string) => void;
};

const initialGoing: Record<string, boolean> = Object.fromEntries(
  EVENTS.filter((e) => e.status === 'upcoming').map((e) => [e.id, true])
);

export const useRsvpStore = create<RsvpState>((set, get) => ({
  going: initialGoing,
  waitlisted: {},

  toggle: (eventId) => {
    const event = useEventsStore.getState().getEvent(eventId);
    if (!event) return;

    const currentlyGoing = get().going[eventId] ?? false;
    if (!currentlyGoing && event.spotsTaken >= event.spotsTotal) {
      return;
    }

    set((s) => ({ going: { ...s.going, [eventId]: !currentlyGoing } }));
  },

  joinWaitlist: (eventId) => {
    set((s) => ({ waitlisted: { ...s.waitlisted, [eventId]: true } }));

    setTimeout(() => {
      const event = useEventsStore.getState().getEvent(eventId);
      if (!event) return;
      const stillWaitlisted = get().waitlisted[eventId];
      const alreadyGoing = get().going[eventId];
      if (!stillWaitlisted || alreadyGoing) return;

      useEventsStore.getState().decrementSpotsTaken(eventId);
      set((s) => ({
        going: { ...s.going, [eventId]: true },
        waitlisted: { ...s.waitlisted, [eventId]: false },
      }));

      if (useSettingsStore.getState().notificationPrefs.eventReminders) {
        useNotificationsStore.getState().addNotification({
          type: 'event',
          text: `A spot opened up for ${event.title} — you're in!`,
          time: 'Just now',
          target: { kind: 'event', id: eventId },
        });
      }
    }, WAITLIST_PROMOTION_DELAY_MS);
  },

  leaveWaitlist: (eventId) =>
    set((s) => ({ waitlisted: { ...s.waitlisted, [eventId]: false } })),
}));

// event.spotsTaken is the baseline count of attendees *not including* the
// current user (ME). Effective totals fold in ME's own RSVP on top of that.
export function getEffectiveSpots(eventId: string, going: boolean) {
  const event = useEventsStore.getState().getEvent(eventId);
  if (!event) return { spotsTaken: 0, spotsTotal: 0, isFull: false };
  return {
    spotsTaken: event.spotsTaken + (going ? 1 : 0),
    spotsTotal: event.spotsTotal,
    isFull: !going && event.spotsTaken >= event.spotsTotal,
  };
}
