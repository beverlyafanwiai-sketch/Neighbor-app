import { create } from 'zustand';

import { ME, type User } from '../data/mock';

type EditableFields = Pick<User, 'name' | 'avatar' | 'tagline' | 'interests' | 'values'>;

type ProfileState = {
  profile: User;
  updateProfile: (updates: Partial<EditableFields>) => void;
  updatePrompt: (index: number, answer: string) => void;
};

export const useProfileStore = create<ProfileState>((set) => ({
  profile: ME,

  updateProfile: (updates) => set((s) => ({ profile: { ...s.profile, ...updates } })),

  updatePrompt: (index, answer) =>
    set((s) => {
      const prompts = [...s.profile.prompts];
      if (!prompts[index]) return s;
      prompts[index] = { ...prompts[index], a: answer };
      return { profile: { ...s.profile, prompts } };
    }),
}));
