import { create } from 'zustand';

export type SavedEventSearch = {
  id: string;
  name: string;
  query: string;
  categoryFilter: string;
  onlyOpen: boolean;
  onlyGoing: boolean;
  onlyFriends: boolean;
  sortBy: string;
};

type SavedEventSearchesState = {
  searches: SavedEventSearch[];
  saveSearch: (input: Omit<SavedEventSearch, 'id'>) => void;
  renameSearch: (id: string, name: string) => void;
  deleteSearch: (id: string) => void;
};

export const useSavedEventSearchesStore = create<SavedEventSearchesState>((set) => ({
  searches: [],

  saveSearch: (input) =>
    set((s) => ({ searches: [{ ...input, id: `event-search-${Date.now()}` }, ...s.searches] })),

  renameSearch: (id, name) => {
    const clean = name.trim();
    if (!clean) return;
    set((s) => ({
      searches: s.searches.map((sr) => (sr.id === id ? { ...sr, name: clean } : sr)),
    }));
  },

  deleteSearch: (id) => set((s) => ({ searches: s.searches.filter((sr) => sr.id !== id) })),
}));
