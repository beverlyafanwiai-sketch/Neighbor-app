import { create } from 'zustand';

type PinnedChatsState = {
  pinnedIds: Record<string, boolean>;
  togglePin: (id: string) => void;
};

export const usePinnedChatsStore = create<PinnedChatsState>((set) => ({
  pinnedIds: {},

  togglePin: (id) =>
    set((s) => ({ pinnedIds: { ...s.pinnedIds, [id]: !s.pinnedIds[id] } })),
}));
