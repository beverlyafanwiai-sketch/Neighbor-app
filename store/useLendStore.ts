import { create } from 'zustand';

import { getUser, LEND_ITEMS, ME, type LendItem, type LendItemKind } from '../data/mock';
import { useNotificationsStore } from './useNotificationsStore';
import { useSettingsStore } from './useSettingsStore';

const BORROW_APPROVAL_DELAY_MS = 2500;
const INBOUND_REQUEST_DELAY_MS = 4000;
const OFFER_THANKS_DELAY_MS = 2000;
const DUE_IN_DAYS = 5;

export type BorrowStatus = 'available' | 'requested' | 'lent';

export type NewLendItemInput = {
  kind: LendItemKind;
  emoji: string;
  title: string;
  note: string;
  imageUris?: string[];
};

type LendState = {
  items: LendItem[];
  status: Record<string, BorrowStatus>;
  borrowerId: Record<string, string>;
  dueLabel: Record<string, string>;
  pendingRequesterId: Record<string, string>;
  myOffers: Record<string, boolean>;
  createItem: (input: NewLendItemInput) => string;
  updateItem: (itemId: string, updates: Partial<NewLendItemInput>) => void;
  requestToBorrow: (itemId: string) => void;
  cancelRequest: (itemId: string) => void;
  approveRequest: (itemId: string, days?: number) => void;
  declineRequest: (itemId: string) => void;
  markReturned: (itemId: string) => void;
  offerToHelp: (itemId: string) => void;
  deleteItem: (itemId: string) => void;
};

function dueLabelFromNow(days: number = DUE_IN_DAYS) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString(undefined, { weekday: 'short' });
}

export const useLendStore = create<LendState>((set, get) => ({
  items: LEND_ITEMS,
  status: {},
  borrowerId: {},
  dueLabel: {},
  pendingRequesterId: {},
  myOffers: {},

  createItem: (input) => {
    const id = `${input.kind}-${Math.random().toString(36).slice(2, 9)}`;
    const item: LendItem = {
      id,
      ownerId: ME.id,
      kind: input.kind,
      emoji: input.emoji,
      title: input.title,
      note: input.note,
      imageUris: input.imageUris,
    };
    set((s) => ({ items: [item, ...s.items] }));

    if (input.kind === 'have') {
      setTimeout(() => {
        const current = get().items.find((i) => i.id === id);
        if (!current) return;
        if (get().status[id] !== undefined && get().status[id] !== 'available') return;

        const requester = getUser(['maya', 'theo', 'priya', 'sam', 'nia'].find((uid) => uid !== ME.id)!);
        if (!requester) return;

        set((s) => ({ pendingRequesterId: { ...s.pendingRequesterId, [id]: requester.id } }));

        if (useSettingsStore.getState().notificationPrefs.lendUpdates) {
          useNotificationsStore.getState().addNotification({
            type: 'lend',
            actorId: requester.id,
            text: `${requester.name} wants to borrow your ${current.title.toLowerCase()}`,
            time: 'Just now',
            target: { kind: 'lend', id },
          });
        }
      }, INBOUND_REQUEST_DELAY_MS);
    }

    return id;
  },

  requestToBorrow: (itemId) => {
    const item = get().items.find((i) => i.id === itemId);
    if (!item) return;

    set((s) => ({ status: { ...s.status, [itemId]: 'requested' } }));

    setTimeout(() => {
      if (get().status[itemId] !== 'requested') return;

      const owner = getUser(item.ownerId);
      set((s) => ({
        status: { ...s.status, [itemId]: 'lent' },
        borrowerId: { ...s.borrowerId, [itemId]: ME.id },
        dueLabel: { ...s.dueLabel, [itemId]: dueLabelFromNow() },
      }));

      if (useSettingsStore.getState().notificationPrefs.lendUpdates) {
        useNotificationsStore.getState().addNotification({
          type: 'lend',
          actorId: owner?.id,
          text: `${owner?.name ?? 'They'} said yes — the ${item.title.toLowerCase()} is yours until ${get().dueLabel[itemId]}`,
          time: 'Just now',
          target: { kind: 'lend', id: itemId },
        });
      }
    }, BORROW_APPROVAL_DELAY_MS);
  },

  cancelRequest: (itemId) =>
    set((s) => ({ status: { ...s.status, [itemId]: 'available' } })),

  approveRequest: (itemId, days) => {
    const requesterId = get().pendingRequesterId[itemId];
    if (!requesterId) return;
    set((s) => ({
      status: { ...s.status, [itemId]: 'lent' },
      borrowerId: { ...s.borrowerId, [itemId]: requesterId },
      dueLabel: { ...s.dueLabel, [itemId]: dueLabelFromNow(days) },
      pendingRequesterId: { ...s.pendingRequesterId, [itemId]: '' },
    }));
  },

  declineRequest: (itemId) =>
    set((s) => ({ pendingRequesterId: { ...s.pendingRequesterId, [itemId]: '' } })),

  markReturned: (itemId) =>
    set((s) => ({
      status: { ...s.status, [itemId]: 'available' },
      borrowerId: { ...s.borrowerId, [itemId]: '' },
      dueLabel: { ...s.dueLabel, [itemId]: '' },
    })),

  offerToHelp: (itemId) => {
    const item = get().items.find((i) => i.id === itemId);
    if (!item) return;
    const alreadyOffered = get().myOffers[itemId] ?? false;
    set((s) => ({ myOffers: { ...s.myOffers, [itemId]: !alreadyOffered } }));
    if (alreadyOffered) return;

    setTimeout(() => {
      if (!get().myOffers[itemId]) return;
      const owner = getUser(item.ownerId);
      if (useSettingsStore.getState().notificationPrefs.lendUpdates) {
        useNotificationsStore.getState().addNotification({
          type: 'lend',
          actorId: owner?.id,
          text: `${owner?.name ?? 'They'} said thanks — they'll reach out about the ${item.title.toLowerCase()}`,
          time: 'Just now',
          target: { kind: 'lend', id: itemId },
        });
      }
    }, OFFER_THANKS_DELAY_MS);
  },

  updateItem: (itemId, updates) =>
    set((s) => ({
      items: s.items.map((i) => (i.id === itemId ? { ...i, ...updates } : i)),
    })),

  deleteItem: (itemId) => set((s) => ({ items: s.items.filter((i) => i.id !== itemId) })),
}));

// item.helperIds is the baseline list of other neighbors already offering
// to help *not including* ME. Effective totals/ids fold in ME's own offer on top.
export function getEffectiveHelperIds(itemId: string, offered: boolean): string[] {
  const item = useLendStore.getState().items.find((i) => i.id === itemId);
  const base = item?.helperIds ?? [];
  return offered ? [...base, ME.id] : base;
}

export function getEffectiveHelperCount(itemId: string, offered: boolean) {
  return getEffectiveHelperIds(itemId, offered).length;
}
