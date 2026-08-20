import { create } from 'zustand';

import { getUser, ME, SALE_ITEMS, type SaleCondition, type SaleItem } from '../data/mock';
import { useBlockedStore } from './useBlockedStore';
import { useNotificationsStore } from './useNotificationsStore';
import { useSettingsStore } from './useSettingsStore';

const INBOUND_INTEREST_DELAY_MS = 4000;
const INTEREST_THANKS_DELAY_MS = 2000;
const PRICE_DROP_NOTICE_DELAY_MS = 3000;
const OFFER_RESPONSE_DELAY_MS = 5000;

function parsePriceValue(price: string) {
  const n = parseFloat(price.replace(/[^0-9.]/g, ''));
  return Number.isNaN(n) ? Infinity : n;
}

export type NewSaleItemInput = {
  emoji: string;
  title: string;
  price: string;
  note: string;
  imageUris?: string[];
  condition?: SaleCondition;
  pickupLocation?: string;
  priceFlexibility?: 'Firm' | 'Negotiable';
};

export type SaleDraft = {
  id: string;
  emoji: string;
  title: string;
  price: string;
  note: string;
  imageUris?: string[];
  condition?: SaleCondition;
  pickupLocation?: string;
  priceFlexibility?: 'Firm' | 'Negotiable';
  updatedAt: number;
};

type SaleDraftInput = Omit<SaleDraft, 'updatedAt' | 'id'> & { id?: string };

type AcceptedOffer = { userId: string; price: string };

type SaleState = {
  items: SaleItem[];
  sold: Record<string, boolean>;
  myInterest: Record<string, boolean>;
  myOffers: Record<string, string>;
  acceptedOffers: Record<string, AcceptedOffer>;
  declinedOffers: Record<string, Record<string, boolean>>;
  declineNotes: Record<string, Record<string, string>>;
  counterOffers: Record<string, Record<string, string>>;
  reservedForId: Record<string, string>;
  reserveNotes: Record<string, string>;
  offerVersion: Record<string, number>;
  drafts: SaleDraft[];
  pinnedItemId: string | null;
  createItem: (input: NewSaleItemInput) => string;
  updateItem: (itemId: string, updates: Partial<NewSaleItemInput>) => void;
  toggleInterest: (itemId: string) => void;
  makeOffer: (itemId: string, price: string) => void;
  withdrawOffer: (itemId: string) => void;
  acceptOffer: (itemId: string, userId: string) => void;
  declineOffer: (itemId: string, userId: string, note?: string) => void;
  counterOffer: (itemId: string, userId: string, price: string) => void;
  dropPrice: (itemId: string, newPrice: string) => void;
  markFree: (itemId: string) => void;
  markSold: (itemId: string) => void;
  relistItem: (itemId: string) => void;
  reserveFor: (itemId: string, userId: string, note?: string) => void;
  unreserve: (itemId: string) => void;
  deleteItem: (itemId: string) => void;
  pinItem: (itemId: string) => void;
  unpinItem: () => void;
  saveDraft: (input: SaleDraftInput) => string;
  deleteDraft: (id: string) => void;
};

let saleDraftSeq = 0;

function scheduleThanks(get: () => SaleState, itemId: string, item: SaleItem) {
  setTimeout(() => {
    if (!get().myInterest[itemId]) return;
    const owner = getUser(item.ownerId);
    if (useSettingsStore.getState().notificationPrefs.saleUpdates) {
      useNotificationsStore.getState().addNotification({
        type: 'sale',
        actorId: owner?.id,
        text: `${owner?.name ?? 'They'} said thanks — they'll reach out about the ${item.title.toLowerCase()}`,
        time: 'Just now',
        target: { kind: 'sale', id: itemId },
      });
    }
  }, INTEREST_THANKS_DELAY_MS);
}

function scheduleOfferResponse(
  set: (fn: (s: SaleState) => Partial<SaleState>) => void,
  get: () => SaleState,
  itemId: string,
  item: SaleItem
) {
  if (item.ownerId === ME.id) return;
  const version = get().offerVersion[itemId];
  setTimeout(() => {
    if (get().offerVersion[itemId] !== version) return;
    if (get().sold[itemId]) return;
    const myOffer = get().myOffers[itemId];
    if (!myOffer) return;
    const owner = getUser(item.ownerId);
    if (!owner) return;

    const roll = Math.random();
    if (roll < 0.4) {
      set((s) => ({
        sold: { ...s.sold, [itemId]: true },
        acceptedOffers: { ...s.acceptedOffers, [itemId]: { userId: ME.id, price: myOffer } },
      }));
      if (useSettingsStore.getState().notificationPrefs.saleUpdates) {
        useNotificationsStore.getState().addNotification({
          type: 'sale',
          actorId: owner.id,
          text: `${owner.name} accepted your offer on the ${item.title.toLowerCase()}`,
          time: 'Just now',
          target: { kind: 'sale', id: itemId },
        });
      }
    } else if (roll < 0.75) {
      const offerValue = parsePriceValue(myOffer);
      const askValue = parsePriceValue(item.price);
      const counterPrice =
        Number.isFinite(offerValue) && Number.isFinite(askValue)
          ? `$${Math.round((offerValue + askValue) / 2)}`
          : item.price;
      set((s) => ({
        counterOffers: {
          ...s.counterOffers,
          [itemId]: { ...s.counterOffers[itemId], [ME.id]: counterPrice },
        },
      }));
      if (useSettingsStore.getState().notificationPrefs.saleUpdates) {
        useNotificationsStore.getState().addNotification({
          type: 'sale',
          actorId: owner.id,
          text: `${owner.name} countered your offer on the ${item.title.toLowerCase()}: ${counterPrice}`,
          time: 'Just now',
          target: { kind: 'sale', id: itemId },
        });
      }
    } else {
      set((s) => ({
        declinedOffers: {
          ...s.declinedOffers,
          [itemId]: { ...s.declinedOffers[itemId], [ME.id]: true },
        },
      }));
      if (useSettingsStore.getState().notificationPrefs.saleUpdates) {
        useNotificationsStore.getState().addNotification({
          type: 'sale',
          actorId: owner.id,
          text: `${owner.name} passed on your offer for the ${item.title.toLowerCase()}`,
          time: 'Just now',
          target: { kind: 'sale', id: itemId },
        });
      }
    }
  }, OFFER_RESPONSE_DELAY_MS);
}

export const useSaleStore = create<SaleState>((set, get) => ({
  items: SALE_ITEMS,
  sold: {},
  myInterest: {},
  myOffers: {},
  acceptedOffers: {},
  declinedOffers: {},
  declineNotes: {},
  counterOffers: {},
  reservedForId: {},
  reserveNotes: {},
  offerVersion: {},
  drafts: [],
  pinnedItemId: null,

  createItem: (input) => {
    const id = `sale-${Math.random().toString(36).slice(2, 9)}`;
    const item: SaleItem = {
      id,
      ownerId: ME.id,
      emoji: input.emoji,
      title: input.title,
      price: input.price,
      note: input.note,
      imageUris: input.imageUris,
      condition: input.condition,
      pickupLocation: input.pickupLocation,
      priceFlexibility: input.priceFlexibility,
    };
    set((s) => ({ items: [item, ...s.items] }));

    setTimeout(() => {
      const current = get().items.find((i) => i.id === id);
      if (!current || get().sold[id]) return;

      const interested = getUser(['maya', 'theo', 'priya', 'sam', 'nia'].find((uid) => uid !== ME.id)!);
      if (!interested) return;

      set((s) => ({
        items: s.items.map((i) =>
          i.id === id
            ? { ...i, interestedByIds: [...(i.interestedByIds ?? []), interested.id] }
            : i
        ),
      }));

      if (useSettingsStore.getState().notificationPrefs.saleUpdates) {
        useNotificationsStore.getState().addNotification({
          type: 'sale',
          actorId: interested.id,
          text: `${interested.name} is interested in your ${current.title.toLowerCase()}`,
          time: 'Just now',
          target: { kind: 'sale', id },
        });
      }
    }, INBOUND_INTEREST_DELAY_MS);

    return id;
  },

  toggleInterest: (itemId) => {
    const item = get().items.find((i) => i.id === itemId);
    if (!item) return;
    const alreadyInterested = get().myInterest[itemId] ?? false;
    set((s) => ({
      myInterest: { ...s.myInterest, [itemId]: !alreadyInterested },
      // Withdrawing interest withdraws any offer too.
      myOffers: alreadyInterested ? { ...s.myOffers, [itemId]: '' } : s.myOffers,
    }));
    if (alreadyInterested) return;
    scheduleThanks(get, itemId, item);
  },

  makeOffer: (itemId, price) => {
    const clean = price.trim();
    if (!clean) return;
    const item = get().items.find((i) => i.id === itemId);
    if (!item) return;
    const alreadyInterested = get().myInterest[itemId] ?? false;
    set((s) => ({
      myInterest: { ...s.myInterest, [itemId]: true },
      myOffers: { ...s.myOffers, [itemId]: clean },
      declinedOffers: {
        ...s.declinedOffers,
        [itemId]: { ...s.declinedOffers[itemId], [ME.id]: false },
      },
      counterOffers: {
        ...s.counterOffers,
        [itemId]: { ...s.counterOffers[itemId], [ME.id]: '' },
      },
      offerVersion: { ...s.offerVersion, [itemId]: (s.offerVersion[itemId] ?? 0) + 1 },
    }));
    if (!alreadyInterested) scheduleThanks(get, itemId, item);
    scheduleOfferResponse(set, get, itemId, item);
  },

  withdrawOffer: (itemId) =>
    set((s) => ({
      myOffers: { ...s.myOffers, [itemId]: '' },
      declinedOffers: {
        ...s.declinedOffers,
        [itemId]: { ...s.declinedOffers[itemId], [ME.id]: false },
      },
      counterOffers: {
        ...s.counterOffers,
        [itemId]: { ...s.counterOffers[itemId], [ME.id]: '' },
      },
    })),

  acceptOffer: (itemId, userId) => {
    const price = getOfferFor(itemId, userId);
    if (!price) return;
    set((s) => {
      const { [itemId]: _removedReservation, ...reservedForId } = s.reservedForId;
      return {
        sold: { ...s.sold, [itemId]: true },
        acceptedOffers: { ...s.acceptedOffers, [itemId]: { userId, price } },
        reservedForId,
      };
    });
  },

  declineOffer: (itemId, userId, note) =>
    set((s) => ({
      declinedOffers: {
        ...s.declinedOffers,
        [itemId]: { ...s.declinedOffers[itemId], [userId]: true },
      },
      declineNotes: note?.trim()
        ? {
            ...s.declineNotes,
            [itemId]: { ...s.declineNotes[itemId], [userId]: note.trim() },
          }
        : s.declineNotes,
      counterOffers: {
        ...s.counterOffers,
        [itemId]: { ...s.counterOffers[itemId], [userId]: '' },
      },
    })),

  counterOffer: (itemId, userId, price) => {
    const clean = price.trim();
    if (!clean) return;
    set((s) => ({
      counterOffers: {
        ...s.counterOffers,
        [itemId]: { ...s.counterOffers[itemId], [userId]: clean },
      },
      declinedOffers: {
        ...s.declinedOffers,
        [itemId]: { ...s.declinedOffers[itemId], [userId]: false },
      },
    }));
  },

  dropPrice: (itemId, newPrice) => {
    const clean = newPrice.trim();
    if (!clean) return;
    const item = get().items.find((i) => i.id === itemId);
    if (!item) return;
    if (parsePriceValue(clean) >= parsePriceValue(item.price)) return;

    set((s) => ({
      items: s.items.map((i) =>
        i.id === itemId ? { ...i, price: clean, originalPrice: i.originalPrice ?? i.price } : i
      ),
    }));

    const noticerId = item.interestedByIds?.[0];
    const noticer = noticerId ? getUser(noticerId) : undefined;
    if (!noticer) return;
    setTimeout(() => {
      const current = get().items.find((i) => i.id === itemId);
      if (!current || get().sold[itemId]) return;
      if (useSettingsStore.getState().notificationPrefs.saleUpdates) {
        useNotificationsStore.getState().addNotification({
          type: 'sale',
          actorId: noticer.id,
          text: `${noticer.name} noticed the price drop on your ${current.title.toLowerCase()}`,
          time: 'Just now',
          target: { kind: 'sale', id: itemId },
        });
      }
    }, PRICE_DROP_NOTICE_DELAY_MS);
  },

  markFree: (itemId) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.id === itemId && i.price.toLowerCase() !== 'free'
          ? { ...i, price: 'Free', originalPrice: i.originalPrice ?? i.price }
          : i
      ),
    })),

  markSold: (itemId) =>
    set((s) => {
      const { [itemId]: _removedReservation, ...reservedForId } = s.reservedForId;
      return { sold: { ...s.sold, [itemId]: true }, reservedForId };
    }),

  relistItem: (itemId) =>
    set((s) => {
      const { [itemId]: _removed, ...rest } = s.acceptedOffers;
      const { [itemId]: _removedDeclines, ...restDeclines } = s.declinedOffers;
      const { [itemId]: _removedCounters, ...restCounters } = s.counterOffers;
      const { [itemId]: _removedReservation, ...reservedForId } = s.reservedForId;
      return {
        sold: { ...s.sold, [itemId]: false },
        acceptedOffers: rest,
        declinedOffers: restDeclines,
        counterOffers: restCounters,
        reservedForId,
      };
    }),

  reserveFor: (itemId, userId, note) =>
    set((s) => ({
      reservedForId: { ...s.reservedForId, [itemId]: userId },
      reserveNotes: note?.trim()
        ? { ...s.reserveNotes, [itemId]: note.trim() }
        : s.reserveNotes,
    })),

  unreserve: (itemId) =>
    set((s) => {
      const { [itemId]: _removed, ...reservedForId } = s.reservedForId;
      const { [itemId]: _removedNote, ...reserveNotes } = s.reserveNotes;
      return { reservedForId, reserveNotes };
    }),

  updateItem: (itemId, updates) =>
    set((s) => ({
      items: s.items.map((i) => (i.id === itemId ? { ...i, ...updates } : i)),
    })),

  deleteItem: (itemId) =>
    set((s) => ({
      items: s.items.filter((i) => i.id !== itemId),
      pinnedItemId: s.pinnedItemId === itemId ? null : s.pinnedItemId,
    })),

  pinItem: (itemId) => set({ pinnedItemId: itemId }),

  unpinItem: () => set({ pinnedItemId: null }),

  saveDraft: (input) => {
    const draftId = input.id ?? `sale-draft-${++saleDraftSeq}`;
    const updatedAt = Date.now();
    set((s) => {
      const draft: SaleDraft = { ...input, id: draftId, updatedAt };
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

export function isFreeItem(price: string) {
  return price.trim().toLowerCase() === 'free';
}

// item.interestedByIds is the baseline list of other neighbors already
// interested *not including* ME — mirrors LendItem.helperIds.
export function getEffectiveInterestedIds(itemId: string, interested: boolean): string[] {
  const item = useSaleStore.getState().items.find((i) => i.id === itemId);
  const blockedIds = useBlockedStore.getState().blockedIds;
  const base = (item?.interestedByIds ?? []).filter((id) => !blockedIds[id]);
  return interested ? [...base, ME.id] : base;
}

export function getEffectiveInterestCount(itemId: string, interested: boolean) {
  return getEffectiveInterestedIds(itemId, interested).length;
}

// Resolves the offer a given neighbor made on an item, if any — checks
// item.offerBaseline for others, or myOffers for ME.
export function getOfferFor(itemId: string, userId: string): string | undefined {
  const item = useSaleStore.getState().items.find((i) => i.id === itemId);
  if (!item) return undefined;
  if (userId === ME.id) return useSaleStore.getState().myOffers[itemId] || undefined;
  return item.offerBaseline?.[userId];
}
