import { create } from 'zustand';

export type EventUpdate = {
  id: string;
  text: string;
  time: string;
};

type EventUpdatesState = {
  updates: Record<string, EventUpdate[]>;
  postUpdate: (eventId: string, text: string) => void;
};

const SEED: Record<string, EventUpdate[]> = {
  'sunset-ridge-hike': [
    {
      id: 'eu-seed-1',
      text: "Trailhead parking lot is small — carpool if you can, or park along Ridge Rd.",
      time: '1d ago',
    },
  ],
};

export const useEventUpdatesStore = create<EventUpdatesState>((set) => ({
  updates: SEED,

  postUpdate: (eventId, text) => {
    const clean = text.trim();
    if (!clean) return;
    const update: EventUpdate = { id: `eu-${Date.now()}`, text: clean, time: 'Just now' };
    set((s) => ({
      updates: { ...s.updates, [eventId]: [...(s.updates[eventId] ?? []), update] },
    }));
  },
}));
