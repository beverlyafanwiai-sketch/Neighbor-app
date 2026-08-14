import { create } from 'zustand';

import { getUser, ME, SALE_ITEMS, type SaleItem } from '../data/mock';
import { useNotificationsStore } from './useNotificationsStore';
import { useSettingsStore } from './useSettingsStore';

const INBOUND_INTEREST_DELAY_MS = 4000;
const INTEREST_THANKS_DELAY_MS = 2000;

export type NewSaleItemInput = {
  emoji: string;
  title: string;
  price: string;
  note: string;
};

type SaleState = {
  items: SaleItem[];
  sold: Record<string, boolean>;
  myInterest: Record<string, boolean>;
  createItem: (input: NewSaleItemInput) => string;
  updateItem: (itemId: string, updates: Partial<NewSaleItemInput>) => void;
  toggleInterest: (itemId: string) => void;
  markSold: (itemId: string) => void;
  deleteItem: (itemId: string) => void;
};

export const useSaleStore = create<SaleState>((set, get) => ({
  items: SALE_ITEMS,
  sold: {},
  myInterest: {},

  createItem: (input) => {
    const id = `sale-${Math.random().toString(36).slice(2, 9)}`;
    const item: SaleItem = {
      id,
      ownerId: ME.id,
      emoji: input.emoji,
      title: input.title,
      price: input.price,
      note: input.note,
    };
    set((s) => ({ items: [item, ...s.items] }));

    setTimeout(() => {
      const current = get().items.find((i) => i.id === id);
      if (!current || get().sold[id]) return;

      const interested = getUser(['maya', 'theo', 'priya', 'sam', 'nia'].find((uid) => uid !== ME.id)!);
      if (!interested) return;

      set((s) => ({
        items: s.items.map((i) =>
          i.id === id ? { ...i, interestedCount: (i.interestedCount ?? 0) + 1 } : i
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
    set((s) => ({ myInterest: { ...s.myInterest, [itemId]: !alreadyInterested } }));
    if (alreadyInterested) return;

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
  },

  markSold: (itemId) => set((s) => ({ sold: { ...s.sold, [itemId]: true } })),

  updateItem: (itemId, updates) =>
    set((s) => ({
      items: s.items.map((i) => (i.id === itemId ? { ...i, ...updates } : i)),
    })),

  deleteItem: (itemId) => set((s) => ({ items: s.items.filter((i) => i.id !== itemId) })),
}));

// item.interestedCount is the baseline count of other neighbors already
// interested *not including* ME — mirrors LendItem.helperCount.
export function getEffectiveInterestCount(itemId: string, interested: boolean) {
  const item = useSaleStore.getState().items.find((i) => i.id === itemId);
  const base = item?.interestedCount ?? 0;
  return base + (interested ? 1 : 0);
}
