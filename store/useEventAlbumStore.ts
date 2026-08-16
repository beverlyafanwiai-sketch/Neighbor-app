import { create } from 'zustand';

import { EVENT_PHOTOS, ME, type EventPhoto } from '../data/mock';

type EventAlbumState = {
  photos: EventPhoto[];
  captions: Record<string, string>;
  addPhotos: (eventId: string, uris: string[]) => void;
  removePhoto: (photoId: string) => void;
  setCaption: (photoId: string, caption: string) => void;
};

export const useEventAlbumStore = create<EventAlbumState>((set) => ({
  photos: EVENT_PHOTOS,
  captions: {},

  addPhotos: (eventId, uris) =>
    set((s) => ({
      photos: [
        ...s.photos,
        ...uris.map((uri, i) => ({
          id: `ep-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          eventId,
          uploaderId: ME.id,
          uri,
        })),
      ],
    })),

  removePhoto: (photoId) =>
    set((s) => {
      const { [photoId]: _removed, ...captions } = s.captions;
      return { photos: s.photos.filter((p) => p.id !== photoId), captions };
    }),

  setCaption: (photoId, caption) =>
    set((s) => ({ captions: { ...s.captions, [photoId]: caption.trim() } })),
}));

export function getEventPhotos(eventId: string, photos: EventPhoto[]) {
  return photos.filter((p) => p.eventId === eventId);
}
