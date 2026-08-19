import { create } from 'zustand';

type PhotoCaptionsState = {
  captions: Record<string, string>;
  setCaption: (key: string, text: string) => void;
};

export const usePhotoCaptionsStore = create<PhotoCaptionsState>((set) => ({
  captions: {},
  setCaption: (key, text) => set((s) => ({ captions: { ...s.captions, [key]: text.trim() } })),
}));

// Keyed by photo URI rather than index — removing an earlier photo while
// editing a listing shifts every later index, which would otherwise
// silently reattach a caption to the wrong photo.
export function photoCaptionKey(itemId: string, uri: string) {
  return `${itemId}:${uri}`;
}
