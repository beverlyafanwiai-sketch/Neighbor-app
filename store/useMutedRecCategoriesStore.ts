import { create } from 'zustand';

type MutedRecCategoriesState = {
  muted: Record<string, boolean>;
  toggle: (category: string) => void;
};

export const useMutedRecCategoriesStore = create<MutedRecCategoriesState>((set) => ({
  muted: {},

  toggle: (category) =>
    set((s) => ({ muted: { ...s.muted, [category]: !s.muted[category] } })),
}));
