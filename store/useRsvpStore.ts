import { create } from 'zustand';

import { EVENTS } from '../data/mock';
import { useEventsStore } from './useEventsStore';
import { useNotificationsStore } from './useNotificationsStore';
import { useSettingsStore } from './useSettingsStore';

const WAITLIST_PROMOTION_DELAY_MS = 4000;

type RsvpState = {
  going: Record<string, boolean>;
  waitlisted: Record<string, boolean>;
  plusOne: Record<string, boolean>;
  toggle: (eventId: string) => void;
  togglePlusOne: (eventId: string) => void;
  joinWaitlist: (eventId: string) => void;
  leaveWaitlist: (eventId: string) => void;
};

const initialGoing: Record<string, boolean> = Object.fromEntries(
  EVENTS.filter((e) => e.status === 'upcoming').map((e) => [e.id, true])
);

export const useRsvpStore = create<RsvpState>((set, get) => ({
  going: initialGoing,
  waitlisted: {},
  plusOne: {},

  toggle: (eventId) => {
    const event = useEventsStore.getState().getEvent(eventId);
    if (!event) return;

    const currentlyGoing = get().going[eventId] ?? false;
    if (!currentlyGoing && event.spotsTaken >= event.spotsTotal) {
      return;
    }

    set((s) => ({
      going: { ...s.going, [eventId]: !currentlyGoing },
      // Bringing a guest only makes sense while you're going.
      plusOne: currentlyGoing ? { ...s.plusOne, [eventId]: false } : s.plusOne,
    }));
  },

  togglePlusOne: (eventId) => {
    const event = useEventsStore.getState().getEvent(eventId);
    if (!event) return;
    if (!(get().going[eventId] ?? false)) return;

    const currentlyBringing = get().plusOne[eventId] ?? false;
    if (!currentlyBringing && event.spotsTaken + 1 >= event.spotsTotal) {
      return;
    }

    set((s) => ({ plusOne: { ...s.plusOne, [eventId]: !currentlyBringing } }));
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

// event.waitlistBaseline is the baseline list of other neighbors already
// waitlisted ahead of ME — ME's position is simply their count plus one,
// since ME joins at the back of the line.
export function getWaitlistPosition(eventId: string, waitlisted: boolean): number | null {
  if (!waitlisted) return null;
  const event = useEventsStore.getState().getEvent(eventId);
  const ahead = event?.waitlistBaseline?.length ?? 0;
  return ahead + 1;
}

// event.spotsTaken is the baseline count of attendees *not including* the
// current user (ME). Effective totals fold in ME's own RSVP (and optional
// +1 guest) on top of that.
export function getEffectiveSpots(eventId: string, going: boolean, plusOne = false) {
  const event = useEventsStore.getState().getEvent(eventId);
  if (!event) return { spotsTaken: 0, spotsTotal: 0, isFull: false };
  const mine = going ? 1 + (plusOne ? 1 : 0) : 0;
  return {
    spotsTaken: event.spotsTaken + mine,
    spotsTotal: event.spotsTotal,
    isFull: !going && event.spotsTaken >= event.spotsTotal,
  };
}
