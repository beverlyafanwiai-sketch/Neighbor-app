import { create } from 'zustand';

export type SavedLendSearch = {
  id: string;
  name: string;
  query: string;
  sortBy: string;
  kindFilter: string;
  hideUnavailable: boolean;
};

type SavedLendSearchesState = {
  searches: SavedLendSearch[];
  saveSearch: (input: Omit<SavedLendSearch, 'id'>) => void;
  deleteSearch: (id: string) => void;
};

export const useSavedLendSearchesStore = create<SavedLendSearchesState>((set) => ({
  searches: [],

  saveSearch: (input) =>
    set((s) => ({ searches: [{ ...input, id: `lend-search-${Date.now()}` }, ...s.searches] })),

  deleteSearch: (id) => set((s) => ({ searches: s.searches.filter((sr) => sr.id !== id) })),
}));
