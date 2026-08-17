import { create } from 'zustand';

import type { AlertCategoryValue } from '../data/mock';

type MutedAlertCategoriesState = {
  muted: Record<string, boolean>;
  toggle: (category: AlertCategoryValue) => void;
};

export const useMutedAlertCategoriesStore = create<MutedAlertCategoriesState>((set) => ({
  muted: {},

  toggle: (category) =>
    set((s) => ({ muted: { ...s.muted, [category]: !s.muted[category] } })),
}));
