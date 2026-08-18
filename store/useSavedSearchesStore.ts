import { create } from 'zustand';

export type SavedSearch = {
  id: string;
  name: string;
  mode: string;
  query: string;
  sortBy: string;
  recKindFilter: string;
  recCategoryFilter: string;
  hideSold: boolean;
  hideUnavailable: boolean;
  hidePast: boolean;
  eventCategoryFilter: string;
  hideResolved: boolean;
  onlyFriends: boolean;
};

type SavedSearchesState = {
  searches: SavedSearch[];
  saveSearch: (input: Omit<SavedSearch, 'id'>) => void;
  renameSearch: (id: string, name: string) => void;
  deleteSearch: (id: string) => void;
};

export const useSavedSearchesStore = create<SavedSearchesState>((set) => ({
  searches: [],

  saveSearch: (input) =>
    set((s) => ({ searches: [{ ...input, id: `saved-search-${Date.now()}` }, ...s.searches] })),

  renameSearch: (id, name) => {
    const clean = name.trim();
    if (!clean) return;
    set((s) => ({
      searches: s.searches.map((sr) => (sr.id === id ? { ...sr, name: clean } : sr)),
    }));
  },

  deleteSearch: (id) => set((s) => ({ searches: s.searches.filter((sr) => sr.id !== id) })),
}));
