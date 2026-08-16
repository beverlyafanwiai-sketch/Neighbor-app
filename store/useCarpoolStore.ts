import { create } from 'zustand';

import { getUser, ME } from '../data/mock';
import { useEventsStore } from './useEventsStore';
import { useNotificationsStore } from './useNotificationsStore';
import { useSettingsStore } from './useSettingsStore';

const INBOUND_SEAT_REQUEST_DELAY_MS = 4000;

export type CarpoolOffer = {
  id: string;
  eventId: string;
  driverId: string;
  seats: number;
  note: string;
  riderIds: string[];
};

export type CarpoolRequest = {
  id: string;
  eventId: string;
  riderId: string;
  note: string;
};

type CarpoolState = {
  offers: CarpoolOffer[];
  requests: CarpoolRequest[];
  offerRide: (eventId: string, seats: number, note: string) => void;
  updateOffer: (eventId: string, seats: number, note: string) => void;
  cancelOffer: (eventId: string) => void;
  requestSeat: (offerId: string) => void;
  leaveSeat: (offerId: string) => void;
  removeRider: (offerId: string, riderId: string) => void;
  offerSeatTo: (eventId: string, riderId: string) => void;
  requestRide: (eventId: string, note: string) => void;
  updateRequest: (eventId: string, note: string) => void;
  cancelRideRequest: (eventId: string) => void;
};

const SEED_OFFERS: CarpoolOffer[] = [
  {
    id: 'carpool-theo-sunset',
    eventId: 'sunset-ridge-hike',
    driverId: 'theo',
    seats: 3,
    note: 'Leaving from the Old Town lot around 8:40.',
    riderIds: ['sam'],
  },
];

const SEED_REQUESTS: CarpoolRequest[] = [
  {
    id: 'carpool-req-maya-sunset',
    eventId: 'sunset-ridge-hike',
    riderId: 'maya',
    note: '',
  },
];

export const useCarpoolStore = create<CarpoolState>((set, get) => ({
  offers: SEED_OFFERS,
  requests: SEED_REQUESTS,

  offerRide: (eventId, seats, note) => {
    const offerId = `carpool-${Date.now()}`;
    set((s) => ({
      offers: [
        ...s.offers.filter((o) => !(o.eventId === eventId && o.driverId === ME.id)),
        { id: offerId, eventId, driverId: ME.id, seats, note, riderIds: [] },
      ],
    }));

    setTimeout(() => {
      const offer = get().offers.find((o) => o.id === offerId);
      if (!offer || offer.riderIds.length >= offer.seats) return;

      const rider = getUser(
        ['maya', 'theo', 'priya', 'sam', 'nia'].find((uid) => uid !== ME.id)!
      );
      if (!rider) return;

      set((s) => ({
        offers: s.offers.map((o) =>
          o.id === offerId ? { ...o, riderIds: [...o.riderIds, rider.id] } : o
        ),
      }));

      if (useSettingsStore.getState().notificationPrefs.carpoolUpdates) {
        const event = useEventsStore.getState().getEvent(eventId);
        useNotificationsStore.getState().addNotification({
          type: 'carpool',
          actorId: rider.id,
          text: `${rider.name} claimed a seat in your carpool for ${event?.title ?? 'your event'}`,
          time: 'Just now',
          target: { kind: 'event', id: eventId },
        });
      }
    }, INBOUND_SEAT_REQUEST_DELAY_MS);
  },

  updateOffer: (eventId, seats, note) =>
    set((s) => ({
      offers: s.offers.map((o) =>
        o.eventId === eventId && o.driverId === ME.id ? { ...o, seats, note } : o
      ),
    })),

  cancelOffer: (eventId) =>
    set((s) => ({
      offers: s.offers.filter((o) => !(o.eventId === eventId && o.driverId === ME.id)),
    })),

  requestSeat: (offerId) =>
    set((s) => ({
      offers: s.offers.map((o) =>
        o.id === offerId && !o.riderIds.includes(ME.id) && o.riderIds.length < o.seats
          ? { ...o, riderIds: [...o.riderIds, ME.id] }
          : o
      ),
    })),

  leaveSeat: (offerId) =>
    set((s) => ({
      offers: s.offers.map((o) =>
        o.id === offerId ? { ...o, riderIds: o.riderIds.filter((id) => id !== ME.id) } : o
      ),
    })),

  removeRider: (offerId, riderId) =>
    set((s) => ({
      offers: s.offers.map((o) =>
        o.id === offerId && o.driverId === ME.id
          ? { ...o, riderIds: o.riderIds.filter((id) => id !== riderId) }
          : o
      ),
    })),

  offerSeatTo: (eventId, riderId) => {
    const offer = get().offers.find((o) => o.eventId === eventId && o.driverId === ME.id);
    if (!offer || offer.riderIds.includes(riderId) || offer.riderIds.length >= offer.seats) return;
    set((s) => ({
      offers: s.offers.map((o) =>
        o.id === offer.id ? { ...o, riderIds: [...o.riderIds, riderId] } : o
      ),
      requests: s.requests.filter((r) => !(r.eventId === eventId && r.riderId === riderId)),
    }));
  },

  requestRide: (eventId, note) =>
    set((s) => ({
      requests: [
        ...s.requests.filter((r) => !(r.eventId === eventId && r.riderId === ME.id)),
        { id: `carpool-req-${Date.now()}`, eventId, riderId: ME.id, note },
      ],
    })),

  updateRequest: (eventId, note) =>
    set((s) => ({
      requests: s.requests.map((r) =>
        r.eventId === eventId && r.riderId === ME.id ? { ...r, note } : r
      ),
    })),

  cancelRideRequest: (eventId) =>
    set((s) => ({
      requests: s.requests.filter((r) => !(r.eventId === eventId && r.riderId === ME.id)),
    })),
}));
