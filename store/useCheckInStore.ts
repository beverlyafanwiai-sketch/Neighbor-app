import { create } from 'zustand';

import { ME, type EventItem } from '../data/mock';

type CheckInState = {
  myCheckIns: Record<string, boolean>;
  toggleCheckIn: (eventId: string) => void;
};

export const useCheckInStore = create<CheckInState>((set) => ({
  myCheckIns: {},

  toggleCheckIn: (eventId) =>
    set((s) => ({ myCheckIns: { ...s.myCheckIns, [eventId]: !s.myCheckIns[eventId] } })),
}));

// event.checkedInIds is the baseline list of other attendees who've checked
// in — ME's own check-in folds in on top, same pattern as spotsTaken/going.
export function getEffectiveCheckedInIds(event: EventItem, myCheckedIn: boolean): string[] {
  const base = event.checkedInIds ?? [];
  return myCheckedIn ? [...base, ME.id] : base;
}
