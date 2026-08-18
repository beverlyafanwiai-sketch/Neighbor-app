import { create } from 'zustand';

export type SavedSaleSearch = {
  id: string;
  name: string;
  query: string;
  sortBy: string;
  hideSold: boolean;
};

type SavedSaleSearchesState = {
  searches: SavedSaleSearch[];
  saveSearch: (input: Omit<SavedSaleSearch, 'id'>) => void;
  deleteSearch: (id: string) => void;
};

export const useSavedSaleSearchesStore = create<SavedSaleSearchesState>((set) => ({
  searches: [],

  saveSearch: (input) =>
    set((s) => ({ searches: [{ ...input, id: `sale-search-${Date.now()}` }, ...s.searches] })),

  deleteSearch: (id) => set((s) => ({ searches: s.searches.filter((sr) => sr.id !== id) })),
}));
