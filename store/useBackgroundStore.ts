import { create } from 'zustand';

export type PresetId = 'neighbor' | 'resort';

export type Background = { kind: 'preset'; id: PresetId } | { kind: 'custom'; uri: string };

type BackgroundState = {
  background: Background;
  setPreset: (id: PresetId) => void;
  setCustom: (uri: string) => void;
};

export const useBackgroundStore = create<BackgroundState>((set) => ({
  background: { kind: 'preset', id: 'resort' },

  setPreset: (id) => set({ background: { kind: 'preset', id } }),

  setCustom: (uri) => set({ background: { kind: 'custom', uri } }),
}));
