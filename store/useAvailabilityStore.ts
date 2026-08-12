import { create } from 'zustand';

import { ME, type User } from '../data/mock';

type AvailabilityState = {
  myAvailable: boolean;
  setAvailable: (available: boolean) => void;
};

export const useAvailabilityStore = create<AvailabilityState>((set) => ({
  myAvailable: false,

  setAvailable: (available) => set({ myAvailable: available }),
}));

export function isAvailable(user: User, myAvailable: boolean) {
  return user.id === ME.id ? myAvailable : (user.available ?? false);
}
