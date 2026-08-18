import { create } from 'zustand';

type DismissedDiscoverState = {
  dismissedIds: Record<string, boolean>;
  dismiss: (userId: string) => void;
};

export const useDismissedDiscoverStore = create<DismissedDiscoverState>((set) => ({
  dismissedIds: {},

  dismiss: (userId) => set((s) => ({ dismissedIds: { ...s.dismissedIds, [userId]: true } })),
}));
