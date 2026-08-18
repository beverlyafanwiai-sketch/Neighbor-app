import { create } from 'zustand';

export type SavedDiscoverSearch = {
  id: string;
  name: string;
  mode: string;
  query: string;
  peopleSort: string;
  groupSort: string;
};

type SavedDiscoverSearchesState = {
  searches: SavedDiscoverSearch[];
  saveSearch: (input: Omit<SavedDiscoverSearch, 'id'>) => void;
  renameSearch: (id: string, name: string) => void;
  deleteSearch: (id: string) => void;
};

export const useSavedDiscoverSearchesStore = create<SavedDiscoverSearchesState>((set) => ({
  searches: [],

  saveSearch: (input) =>
    set((s) => ({
      searches: [{ ...input, id: `discover-search-${Date.now()}` }, ...s.searches],
    })),

  renameSearch: (id, name) => {
    const clean = name.trim();
    if (!clean) return;
    set((s) => ({
      searches: s.searches.map((sr) => (sr.id === id ? { ...sr, name: clean } : sr)),
    }));
  },

  deleteSearch: (id) => set((s) => ({ searches: s.searches.filter((sr) => sr.id !== id) })),
}));
