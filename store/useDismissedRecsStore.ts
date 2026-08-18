import { create } from 'zustand';

type DismissedRecsState = {
  dismissedIds: Record<string, boolean>;
  dismissEntry: (entryId: string) => void;
};

export const useDismissedRecsStore = create<DismissedRecsState>((set) => ({
  dismissedIds: {},

  dismissEntry: (entryId) =>
    set((s) => ({ dismissedIds: { ...s.dismissedIds, [entryId]: true } })),
}));
