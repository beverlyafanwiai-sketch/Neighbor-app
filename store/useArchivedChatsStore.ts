import { create } from 'zustand';

type ArchivedChatsState = {
  archivedIds: Record<string, boolean>;
  toggleArchive: (id: string) => void;
};

export const useArchivedChatsStore = create<ArchivedChatsState>((set) => ({
  archivedIds: {},

  toggleArchive: (id) =>
    set((s) => ({ archivedIds: { ...s.archivedIds, [id]: !s.archivedIds[id] } })),
}));
