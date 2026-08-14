import { create } from 'zustand';

import { EVENTS, ME, USERS, type EventCategory, type EventItem, type EventRecurrence } from '../data/mock';
import { useGroupsStore } from './useGroupsStore';
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
  recurrence?: EventRecurrence;
  hostGroupId?: string;
};

export type EventDraft = {
  id: string;
  title: string;
  day: string;
  month: string;
  time: string;
  location: string;
  description: string;
  category: EventCategory;
  spotsTotal: number;
  coverImageUri?: string;
  recurrence?: EventRecurrence;
  groupId?: string;
  updatedAt: number;
};

type EventDraftInput = Omit<EventDraft, 'updatedAt' | 'id'> & { id?: string };

type EventsState = {
  events: EventItem[];
  drafts: EventDraft[];
  getEvent: (id: string) => EventItem | undefined;
  createEvent: (input: NewEventInput) => string;
  updateEvent: (id: string, updates: Partial<NewEventInput>) => void;
  deleteEvent: (id: string) => void;
  cancelEvent: (id: string) => void;
  reinstateEvent: (id: string) => void;
  promoteCoHost: (eventId: string, userId: string) => void;
  demoteCoHost: (eventId: string, userId: string) => void;
  decrementSpotsTaken: (id: string) => void;
  skipNextOccurrence: (id: string) => void;
  saveDraft: (input: EventDraftInput) => string;
  deleteDraft: (id: string) => void;
};

let eventDraftSeq = 0;

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
  drafts: [],

  getEvent: (id) => get().events.find((e) => e.id === id),

  createEvent: (input) => {
    const id = `${slugify(input.title)}-${Math.random().toString(36).slice(2, 7)}`;
    const hostGroup = input.hostGroupId
      ? useGroupsStore.getState().groups.find((g) => g.id === input.hostGroupId)
      : undefined;
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
      hostLabel: hostGroup ? hostGroup.name : `Hosted by ${ME.name}`,
      hostId: ME.id,
      hostGroupId: hostGroup?.id,
      spotsTaken: 0,
      spotsTotal: input.spotsTotal,
      attendeeIds: [],
      status: 'upcoming',
      coverImageUri: input.coverImageUri,
      recurrence: input.recurrence,
    };
    set((s) => ({ events: [event, ...s.events] }));

    setTimeout(() => {
      const current = get().events.find((e) => e.id === id);
      if (!current) return;

      const candidatePool = hostGroup
        ? hostGroup.memberIds.map((uid) => USERS.find((u) => u.id === uid)).filter((u): u is (typeof USERS)[number] => Boolean(u))
        : USERS;
      const attendee = candidatePool.find((u) => !current.attendeeIds.includes(u.id));
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
          text: hostGroup
            ? `${attendee.name} from ${hostGroup.name} RSVP'd to ${input.title}`
            : `${attendee.name} RSVP'd to ${input.title}`,
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

  cancelEvent: (id) =>
    set((s) => ({
      events: s.events.map((e) => (e.id === id ? { ...e, cancelled: true } : e)),
    })),

  reinstateEvent: (id) =>
    set((s) => ({
      events: s.events.map((e) => (e.id === id ? { ...e, cancelled: false } : e)),
    })),

  promoteCoHost: (eventId, userId) =>
    set((s) => ({
      events: s.events.map((e) =>
        e.id === eventId && !(e.coHostIds ?? []).includes(userId)
          ? { ...e, coHostIds: [...(e.coHostIds ?? []), userId] }
          : e
      ),
    })),

  demoteCoHost: (eventId, userId) =>
    set((s) => ({
      events: s.events.map((e) =>
        e.id === eventId
          ? { ...e, coHostIds: (e.coHostIds ?? []).filter((id) => id !== userId) }
          : e
      ),
    })),

  decrementSpotsTaken: (id) =>
    set((s) => ({
      events: s.events.map((e) =>
        e.id === id ? { ...e, spotsTaken: Math.max(0, e.spotsTaken - 1) } : e
      ),
    })),

  skipNextOccurrence: (id) =>
    set((s) => ({
      events: s.events.map((e) =>
        e.id === id ? { ...e, skipCount: (e.skipCount ?? 0) + 1 } : e
      ),
    })),

  saveDraft: (input) => {
    const draftId = input.id ?? `event-draft-${++eventDraftSeq}`;
    const updatedAt = Date.now();
    set((s) => {
      const draft: EventDraft = { ...input, id: draftId, updatedAt };
      const exists = s.drafts.some((d) => d.id === draftId);
      return {
        drafts: exists
          ? s.drafts.map((d) => (d.id === draftId ? draft : d))
          : [draft, ...s.drafts],
      };
    });
    return draftId;
  },

  deleteDraft: (id) => set((s) => ({ drafts: s.drafts.filter((d) => d.id !== id) })),
}));

export function canManageEvent(event: EventItem, userId: string): boolean {
  return event.hostId === userId || (event.coHostIds ?? []).includes(userId);
}
