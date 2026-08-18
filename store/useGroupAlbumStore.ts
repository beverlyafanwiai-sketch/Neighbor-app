import { create } from 'zustand';

import { GROUP_PHOTOS, ME, type GroupPhoto } from '../data/mock';

type GroupAlbumState = {
  photos: GroupPhoto[];
  captions: Record<string, string>;
  addPhotos: (groupId: string, uris: string[]) => void;
  removePhoto: (photoId: string) => void;
  setCaption: (photoId: string, caption: string) => void;
};

export const useGroupAlbumStore = create<GroupAlbumState>((set) => ({
  photos: GROUP_PHOTOS,
  captions: {},

  addPhotos: (groupId, uris) =>
    set((s) => ({
      photos: [
        ...s.photos,
        ...uris.map((uri, i) => ({
          id: `gp-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          groupId,
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

export function getGroupPhotos(groupId: string, photos: GroupPhoto[]) {
  return photos.filter((p) => p.groupId === groupId);
}
