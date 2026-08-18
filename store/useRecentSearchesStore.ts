import { create } from 'zustand';

const MAX_RECENT_SEARCHES = 8;

type RecentSearchesState = {
  queries: string[];
  addSearch: (query: string) => void;
  removeSearch: (query: string) => void;
  clear: () => void;
};

export const useRecentSearchesStore = create<RecentSearchesState>((set) => ({
  queries: [],

  addSearch: (query) => {
    const clean = query.trim();
    if (!clean) return;
    set((s) => ({
      queries: [
        clean,
        ...s.queries.filter((q) => q.toLowerCase() !== clean.toLowerCase()),
      ].slice(0, MAX_RECENT_SEARCHES),
    }));
  },

  removeSearch: (query) => set((s) => ({ queries: s.queries.filter((q) => q !== query) })),

  clear: () => set({ queries: [] }),
}));
