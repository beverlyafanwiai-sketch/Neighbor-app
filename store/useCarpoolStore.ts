import { create } from 'zustand';

import { ME } from '../data/mock';

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
  cancelOffer: (eventId: string) => void;
  requestSeat: (offerId: string) => void;
  leaveSeat: (offerId: string) => void;
  requestRide: (eventId: string, note: string) => void;
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

export const useCarpoolStore = create<CarpoolState>((set) => ({
  offers: SEED_OFFERS,
  requests: SEED_REQUESTS,

  offerRide: (eventId, seats, note) =>
    set((s) => ({
      offers: [
        ...s.offers.filter((o) => !(o.eventId === eventId && o.driverId === ME.id)),
        { id: `carpool-${Date.now()}`, eventId, driverId: ME.id, seats, note, riderIds: [] },
      ],
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

  requestRide: (eventId, note) =>
    set((s) => ({
      requests: [
        ...s.requests.filter((r) => !(r.eventId === eventId && r.riderId === ME.id)),
        { id: `carpool-req-${Date.now()}`, eventId, riderId: ME.id, note },
      ],
    })),

  cancelRideRequest: (eventId) =>
    set((s) => ({
      requests: s.requests.filter((r) => !(r.eventId === eventId && r.riderId === ME.id)),
    })),
}));
