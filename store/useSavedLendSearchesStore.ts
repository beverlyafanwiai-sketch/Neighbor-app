import { create } from 'zustand';

export type SavedLendSearch = {
  id: string;
  name: string;
  query: string;
  sortBy: string;
  kindFilter: string;
  hideUnavailable: boolean;
  onlyFriends: boolean;
};

type SavedLendSearchesState = {
  searches: SavedLendSearch[];
  saveSearch: (input: Omit<SavedLendSearch, 'id'>) => void;
  renameSearch: (id: string, name: string) => void;
  deleteSearch: (id: string) => void;
};

export const useSavedLendSearchesStore = create<SavedLendSearchesState>((set) => ({
  searches: [],

  saveSearch: (input) =>
    set((s) => ({ searches: [{ ...input, id: `lend-search-${Date.now()}` }, ...s.searches] })),

  renameSearch: (id, name) => {
    const clean = name.trim();
    if (!clean) return;
    set((s) => ({
      searches: s.searches.map((sr) => (sr.id === id ? { ...sr, name: clean } : sr)),
    }));
  },

  deleteSearch: (id) => set((s) => ({ searches: s.searches.filter((sr) => sr.id !== id) })),
}));
