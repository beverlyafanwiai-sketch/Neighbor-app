import { create } from 'zustand';

import { getUser, ME, SALE_ITEMS, type SaleCondition, type SaleItem } from '../data/mock';
import { useNotificationsStore } from './useNotificationsStore';
import { useSettingsStore } from './useSettingsStore';

const INBOUND_INTEREST_DELAY_MS = 4000;
const INTEREST_THANKS_DELAY_MS = 2000;
const PRICE_DROP_NOTICE_DELAY_MS = 3000;

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
};

export type SaleDraft = {
  id: string;
  emoji: string;
  title: string;
  price: string;
  note: string;
  imageUris?: string[];
  condition?: SaleCondition;
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
  counterOffers: Record<string, Record<string, string>>;
  drafts: SaleDraft[];
  createItem: (input: NewSaleItemInput) => string;
  updateItem: (itemId: string, updates: Partial<NewSaleItemInput>) => void;
  toggleInterest: (itemId: string) => void;
  makeOffer: (itemId: string, price: string) => void;
  withdrawOffer: (itemId: string) => void;
  acceptOffer: (itemId: string, userId: string) => void;
  declineOffer: (itemId: string, userId: string) => void;
  counterOffer: (itemId: string, userId: string, price: string) => void;
  dropPrice: (itemId: string, newPrice: string) => void;
  markFree: (itemId: string) => void;
  markSold: (itemId: string) => void;
  relistItem: (itemId: string) => void;
  deleteItem: (itemId: string) => void;
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

export const useSaleStore = create<SaleState>((set, get) => ({
  items: SALE_ITEMS,
  sold: {},
  myInterest: {},
  myOffers: {},
  acceptedOffers: {},
  declinedOffers: {},
  counterOffers: {},
  drafts: [],

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
    }));
    if (alreadyInterested) return;
    scheduleThanks(get, itemId, item);
  },

  withdrawOffer: (itemId) =>
    set((s) => ({ myOffers: { ...s.myOffers, [itemId]: '' } })),

  acceptOffer: (itemId, userId) => {
    const price = getOfferFor(itemId, userId);
    if (!price) return;
    set((s) => ({
      sold: { ...s.sold, [itemId]: true },
      acceptedOffers: { ...s.acceptedOffers, [itemId]: { userId, price } },
    }));
  },

  declineOffer: (itemId, userId) =>
    set((s) => ({
      declinedOffers: {
        ...s.declinedOffers,
        [itemId]: { ...s.declinedOffers[itemId], [userId]: true },
      },
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

  markSold: (itemId) => set((s) => ({ sold: { ...s.sold, [itemId]: true } })),

  relistItem: (itemId) =>
    set((s) => {
      const { [itemId]: _removed, ...rest } = s.acceptedOffers;
      const { [itemId]: _removedDeclines, ...restDeclines } = s.declinedOffers;
      const { [itemId]: _removedCounters, ...restCounters } = s.counterOffers;
      return {
        sold: { ...s.sold, [itemId]: false },
        acceptedOffers: rest,
        declinedOffers: restDeclines,
        counterOffers: restCounters,
      };
    }),

  updateItem: (itemId, updates) =>
    set((s) => ({
      items: s.items.map((i) => (i.id === itemId ? { ...i, ...updates } : i)),
    })),

  deleteItem: (itemId) => set((s) => ({ items: s.items.filter((i) => i.id !== itemId) })),

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
  const base = item?.interestedByIds ?? [];
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
