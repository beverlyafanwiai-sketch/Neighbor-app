import { create } from 'zustand';

export type SavedCollection = { id: string; name: string };

type SavedCollectionsState = {
  collections: SavedCollection[];
  // Maps a savedNoteKey (e.g. "post:abc123") to the collection ids it belongs to.
  itemCollectionIds: Record<string, string[]>;
  createCollection: (name: string) => string;
  renameCollection: (id: string, name: string) => void;
  deleteCollection: (id: string) => void;
  toggleItemInCollection: (itemKey: string, collectionId: string) => void;
};

export const useSavedCollectionsStore = create<SavedCollectionsState>((set) => ({
  collections: [],
  itemCollectionIds: {},

  createCollection: (name) => {
    const clean = name.trim();
    if (!clean) return '';
    const id = `collection-${Date.now()}`;
    set((s) => ({ collections: [...s.collections, { id, name: clean }] }));
    return id;
  },

  renameCollection: (id, name) => {
    const clean = name.trim();
    if (!clean) return;
    set((s) => ({
      collections: s.collections.map((c) => (c.id === id ? { ...c, name: clean } : c)),
    }));
  },

  deleteCollection: (id) =>
    set((s) => ({
      collections: s.collections.filter((c) => c.id !== id),
      itemCollectionIds: Object.fromEntries(
        Object.entries(s.itemCollectionIds).map(([key, ids]) => [
          key,
          ids.filter((cid) => cid !== id),
        ])
      ),
    })),

  toggleItemInCollection: (itemKey, collectionId) =>
    set((s) => {
      const current = s.itemCollectionIds[itemKey] ?? [];
      const next = current.includes(collectionId)
        ? current.filter((id) => id !== collectionId)
        : [...current, collectionId];
      return { itemCollectionIds: { ...s.itemCollectionIds, [itemKey]: next } };
    }),
}));
