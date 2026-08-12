import { create } from 'zustand';

type MutedState = {
  mutedIds: Record<string, boolean>;
  isMuted: (userId: string) => boolean;
  toggle: (userId: string) => void;
};

export const useMutedStore = create<MutedState>((set, get) => ({
  mutedIds: {},

  isMuted: (userId) => get().mutedIds[userId] ?? false,

  toggle: (userId) =>
    set((s) => ({ mutedIds: { ...s.mutedIds, [userId]: !s.mutedIds[userId] } })),
}));
