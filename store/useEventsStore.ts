import { create } from 'zustand';

import { EVENTS, ME, USERS, type EventCategory, type EventItem } from '../data/mock';
import { useNotificationsStore } from './useNotificationsStore';
import { useSettingsStore } from './useSettingsStore';

const RSVP_DELAY_MS = 2500;

export type NewEventInput = {
  title: string;
  day: string;
  month: string;
  time: string;
  date: string;
  location: string;
  description: string;
  category: EventCategory;
  spotsTotal: number;
  coverImageUri?: string;
};

type EventsState = {
  events: EventItem[];
  getEvent: (id: string) => EventItem | undefined;
  createEvent: (input: NewEventInput) => string;
  updateEvent: (id: string, updates: Partial<NewEventInput>) => void;
  deleteEvent: (id: string) => void;
  decrementSpotsTaken: (id: string) => void;
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
      category: input.category,
      hostLabel: `Hosted by ${ME.name}`,
      hostId: ME.id,
      spotsTaken: 0,
      spotsTotal: input.spotsTotal,
      attendeeIds: [],
      status: 'upcoming',
      coverImageUri: input.coverImageUri,
    };
    set((s) => ({ events: [event, ...s.events] }));

    setTimeout(() => {
      const current = get().events.find((e) => e.id === id);
      if (!current) return;
      const attendee = USERS.find((u) => !current.attendeeIds.includes(u.id));
      if (!attendee || current.spotsTaken >= current.spotsTotal) return;

      set((s) => ({
        events: s.events.map((e) =>
          e.id === id
            ? { ...e, attendeeIds: [...e.attendeeIds, attendee.id], spotsTaken: e.spotsTaken + 1 }
            : e
        ),
      }));

      if (useSettingsStore.getState().notificationPrefs.eventReminders) {
        useNotificationsStore.getState().addNotification({
          type: 'event',
          actorId: attendee.id,
          text: `${attendee.name} RSVP'd to ${input.title}`,
          time: 'Just now',
          target: { kind: 'event', id },
        });
      }
    }, RSVP_DELAY_MS);

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

  decrementSpotsTaken: (id) =>
    set((s) => ({
      events: s.events.map((e) =>
        e.id === id ? { ...e, spotsTaken: Math.max(0, e.spotsTaken - 1) } : e
      ),
    })),
}));
