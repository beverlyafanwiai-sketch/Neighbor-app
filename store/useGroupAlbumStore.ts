import { create } from 'zustand';

import { GROUP_PHOTOS, ME, type GroupPhoto } from '../data/mock';

type GroupAlbumState = {
  photos: GroupPhoto[];
  addPhotos: (groupId: string, uris: string[]) => void;
  removePhoto: (photoId: string) => void;
};

export const useGroupAlbumStore = create<GroupAlbumState>((set) => ({
  photos: GROUP_PHOTOS,

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

  removePhoto: (photoId) => set((s) => ({ photos: s.photos.filter((p) => p.id !== photoId) })),
}));

export function getGroupPhotos(groupId: string, photos: GroupPhoto[]) {
  return photos.filter((p) => p.groupId === groupId);
}
