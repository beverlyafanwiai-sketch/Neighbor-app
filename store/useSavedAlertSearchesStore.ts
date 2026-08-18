import { create } from 'zustand';

export type SavedAlertSearch = {
  id: string;
  name: string;
  query: string;
  categoryFilter: string;
  sortBy: string;
  onlyFriends: boolean;
};

type SavedAlertSearchesState = {
  searches: SavedAlertSearch[];
  saveSearch: (input: Omit<SavedAlertSearch, 'id'>) => void;
  renameSearch: (id: string, name: string) => void;
  deleteSearch: (id: string) => void;
};

export const useSavedAlertSearchesStore = create<SavedAlertSearchesState>((set) => ({
  searches: [],

  saveSearch: (input) =>
    set((s) => ({ searches: [{ ...input, id: `alert-search-${Date.now()}` }, ...s.searches] })),

  renameSearch: (id, name) => {
    const clean = name.trim();
    if (!clean) return;
    set((s) => ({
      searches: s.searches.map((sr) => (sr.id === id ? { ...sr, name: clean } : sr)),
    }));
  },

  deleteSearch: (id) => set((s) => ({ searches: s.searches.filter((sr) => sr.id !== id) })),
}));
