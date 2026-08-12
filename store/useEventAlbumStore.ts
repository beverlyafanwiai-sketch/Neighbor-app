import { create } from 'zustand';

import { EVENT_PHOTOS, ME, type EventPhoto } from '../data/mock';

type EventAlbumState = {
  photos: EventPhoto[];
  addPhotos: (eventId: string, uris: string[]) => void;
  removePhoto: (photoId: string) => void;
};

export const useEventAlbumStore = create<EventAlbumState>((set) => ({
  photos: EVENT_PHOTOS,

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

  removePhoto: (photoId) => set((s) => ({ photos: s.photos.filter((p) => p.id !== photoId) })),
}));

export function getEventPhotos(eventId: string, photos: EventPhoto[]) {
  return photos.filter((p) => p.eventId === eventId);
}
