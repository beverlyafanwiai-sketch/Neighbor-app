import { create } from 'zustand';

export type SavedRecSearch = {
  id: string;
  name: string;
  query: string;
  categoryFilter: string;
  kindFilter: string;
  sortBy: string;
  onlyUrgent: boolean;
};

type SavedRecSearchesState = {
  searches: SavedRecSearch[];
  saveSearch: (input: Omit<SavedRecSearch, 'id'>) => void;
  renameSearch: (id: string, name: string) => void;
  deleteSearch: (id: string) => void;
};

export const useSavedRecSearchesStore = create<SavedRecSearchesState>((set) => ({
  searches: [],

  saveSearch: (input) =>
    set((s) => ({ searches: [{ ...input, id: `rec-search-${Date.now()}` }, ...s.searches] })),

  renameSearch: (id, name) => {
    const clean = name.trim();
    if (!clean) return;
    set((s) => ({
      searches: s.searches.map((sr) => (sr.id === id ? { ...sr, name: clean } : sr)),
    }));
  },

  deleteSearch: (id) => set((s) => ({ searches: s.searches.filter((sr) => sr.id !== id) })),
}));
