import { create } from 'zustand';

type SavedPinsState = {
  pinned: Record<string, boolean>;
  togglePin: (key: string) => void;
};

export const useSavedPinsStore = create<SavedPinsState>((set) => ({
  pinned: {},

  togglePin: (key) => set((s) => ({ pinned: { ...s.pinned, [key]: !s.pinned[key] } })),
}));
