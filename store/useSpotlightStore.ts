import { create } from 'zustand';

type SpotlightState = {
  index: number;
  next: () => void;
};

export const useSpotlightStore = create<SpotlightState>((set) => ({
  index: 0,
  next: () => set((s) => ({ index: s.index + 1 })),
}));
