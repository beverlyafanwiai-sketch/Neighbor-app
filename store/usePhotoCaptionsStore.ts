import { create } from 'zustand';

type PhotoCaptionsState = {
  captions: Record<string, string>;
  setCaption: (key: string, text: string) => void;
};

export const usePhotoCaptionsStore = create<PhotoCaptionsState>((set) => ({
  captions: {},
  setCaption: (key, text) => set((s) => ({ captions: { ...s.captions, [key]: text.trim() } })),
}));

export function photoCaptionKey(itemId: string, index: number) {
  return `${itemId}:${index}`;
}
