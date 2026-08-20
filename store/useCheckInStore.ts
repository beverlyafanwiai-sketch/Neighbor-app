import { create } from 'zustand';

import { ME, type EventItem } from '../data/mock';
import { useBlockedStore } from './useBlockedStore';

type CheckInState = {
  myCheckIns: Record<string, boolean>;
  checkInNotes: Record<string, string>;
  toggleCheckIn: (eventId: string, note?: string) => void;
};

export const useCheckInStore = create<CheckInState>((set) => ({
  myCheckIns: {},
  checkInNotes: {},

  toggleCheckIn: (eventId, note) =>
    set((s) => {
      const checkingIn = !s.myCheckIns[eventId];
      const { [eventId]: _removed, ...restNotes } = s.checkInNotes;
      return {
        myCheckIns: { ...s.myCheckIns, [eventId]: checkingIn },
        checkInNotes:
          checkingIn && note?.trim() ? { ...restNotes, [eventId]: note.trim() } : restNotes,
      };
    }),
}));

// event.checkedInIds is the baseline list of other attendees who've checked
// in — ME's own check-in folds in on top, same pattern as spotsTaken/going.
export function getEffectiveCheckedInIds(event: EventItem, myCheckedIn: boolean): string[] {
  const blockedIds = useBlockedStore.getState().blockedIds;
  const base = (event.checkedInIds ?? []).filter((id) => !blockedIds[id]);
  return myCheckedIn ? [...base, ME.id] : base;
}
