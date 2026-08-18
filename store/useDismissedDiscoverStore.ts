import { create } from 'zustand';

type DismissedDiscoverState = {
  dismissedIds: Record<string, boolean>;
  dismiss: (userId: string) => void;
  dismissedGroupIds: Record<string, boolean>;
  dismissGroup: (groupId: string) => void;
};

export const useDismissedDiscoverStore = create<DismissedDiscoverState>((set) => ({
  dismissedIds: {},
  dismissedGroupIds: {},

  dismiss: (userId) => set((s) => ({ dismissedIds: { ...s.dismissedIds, [userId]: true } })),

  dismissGroup: (groupId) =>
    set((s) => ({ dismissedGroupIds: { ...s.dismissedGroupIds, [groupId]: true } })),
}));
