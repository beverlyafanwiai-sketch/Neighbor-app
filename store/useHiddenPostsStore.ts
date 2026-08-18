import { create } from 'zustand';

type HiddenPostsState = {
  hiddenIds: Record<string, boolean>;
  hide: (postId: string) => void;
};

export const useHiddenPostsStore = create<HiddenPostsState>((set) => ({
  hiddenIds: {},

  hide: (postId) => set((s) => ({ hiddenIds: { ...s.hiddenIds, [postId]: true } })),
}));
