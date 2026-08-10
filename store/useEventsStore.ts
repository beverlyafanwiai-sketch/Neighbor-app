import { create } from 'zustand';

import { EVENTS, ME, type EventItem } from '../data/mock';

export type NewEventInput = {
  title: string;
  day: string;
  month: string;
  time: string;
  date: string;
  location: string;
  description: string;
  spotsTotal: number;
};

type EventsState = {
  events: EventItem[];
  getEvent: (id: string) => EventItem | undefined;
  createEvent: (input: NewEventInput) => string;
  updateEvent: (id: string, updates: Partial<NewEventInput>) => void;
  deleteEvent: (id: string) => void;
};

function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'event'
  );
}

export const useEventsStore = create<EventsState>((set, get) => ({
  events: EVENTS,

  getEvent: (id) => get().events.find((e) => e.id === id),

  createEvent: (input) => {
    const id = `${slugify(input.title)}-${Math.random().toString(36).slice(2, 7)}`;
    const event: EventItem = {
      id,
      title: input.title,
      day: input.day,
      month: input.month.toUpperCase(),
      time: input.time,
      date: input.date,
      location: input.location,
      description: input.description,
      hostLabel: `Hosted by ${ME.name}`,
      hostId: ME.id,
      spotsTaken: 0,
      spotsTotal: input.spotsTotal,
      attendeeIds: [],
      status: 'upcoming',
    };
    set((s) => ({ events: [event, ...s.events] }));
    return id;
  },

  updateEvent: (id, updates) =>
    set((s) => ({
      events: s.events.map((e) =>
        e.id === id
          ? { ...e, ...updates, ...(updates.month ? { month: updates.month.toUpperCase() } : {}) }
          : e
      ),
    })),

  deleteEvent: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),
}));
