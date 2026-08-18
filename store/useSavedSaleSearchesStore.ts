import { create } from 'zustand';

export type SavedSaleSearch = {
  id: string;
  name: string;
  query: string;
  sortBy: string;
  hideSold: boolean;
  minPrice: string;
  maxPrice: string;
  conditionFilter: string;
  flexibilityFilter: string;
};

type SavedSaleSearchesState = {
  searches: SavedSaleSearch[];
  saveSearch: (input: Omit<SavedSaleSearch, 'id'>) => void;
  renameSearch: (id: string, name: string) => void;
  deleteSearch: (id: string) => void;
};

export const useSavedSaleSearchesStore = create<SavedSaleSearchesState>((set) => ({
  searches: [],

  saveSearch: (input) =>
    set((s) => ({ searches: [{ ...input, id: `sale-search-${Date.now()}` }, ...s.searches] })),

  renameSearch: (id, name) => {
    const clean = name.trim();
    if (!clean) return;
    set((s) => ({
      searches: s.searches.map((sr) => (sr.id === id ? { ...sr, name: clean } : sr)),
    }));
  },

  deleteSearch: (id) => set((s) => ({ searches: s.searches.filter((sr) => sr.id !== id) })),
}));
