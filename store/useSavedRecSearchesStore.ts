import { create } from 'zustand';

export type SavedRecSearch = {
  id: string;
  name: string;
  query: string;
  categoryFilter: string;
  kindFilter: string;
  sortBy: string;
};

type SavedRecSearchesState = {
  searches: SavedRecSearch[];
  saveSearch: (input: Omit<SavedRecSearch, 'id'>) => void;
  deleteSearch: (id: string) => void;
};

export const useSavedRecSearchesStore = create<SavedRecSearchesState>((set) => ({
  searches: [],

  saveSearch: (input) =>
    set((s) => ({ searches: [{ ...input, id: `rec-search-${Date.now()}` }, ...s.searches] })),

  deleteSearch: (id) => set((s) => ({ searches: s.searches.filter((sr) => sr.id !== id) })),
}));
