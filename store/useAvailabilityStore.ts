import { create } from 'zustand';

import { ME, type User } from '../data/mock';

type AvailabilityState = {
  myAvailable: boolean;
  myAvailableNote: string;
  setAvailable: (available: boolean) => void;
  setAvailableNote: (note: string) => void;
};

export const useAvailabilityStore = create<AvailabilityState>((set) => ({
  myAvailable: false,
  myAvailableNote: '',

  setAvailable: (available) =>
    set((s) => ({ myAvailable: available, myAvailableNote: available ? s.myAvailableNote : '' })),

  setAvailableNote: (note) => set({ myAvailableNote: note.trim() }),
}));

export function isAvailable(user: User, myAvailable: boolean) {
  return user.id === ME.id ? myAvailable : (user.available ?? false);
}

export function getAvailableNote(user: User, myAvailableNote: string) {
  return user.id === ME.id ? myAvailableNote : (user.availableNote ?? '');
}
