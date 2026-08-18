import { create } from 'zustand';

type DismissedListingsState = {
  dismissedSaleIds: Record<string, boolean>;
  dismissSaleItem: (itemId: string) => void;
  dismissedLendIds: Record<string, boolean>;
  dismissLendItem: (itemId: string) => void;
};

export const useDismissedListingsStore = create<DismissedListingsState>((set) => ({
  dismissedSaleIds: {},
  dismissedLendIds: {},

  dismissSaleItem: (itemId) =>
    set((s) => ({ dismissedSaleIds: { ...s.dismissedSaleIds, [itemId]: true } })),

  dismissLendItem: (itemId) =>
    set((s) => ({ dismissedLendIds: { ...s.dismissedLendIds, [itemId]: true } })),
}));
