import { create } from 'zustand';

import { ME, type Prompt, type User } from '../data/mock';

type EditableFields = Pick<
  User,
  | 'name'
  | 'pronouns'
  | 'link'
  | 'avatar'
  | 'coverImageUri'
  | 'tagline'
  | 'bio'
  | 'interests'
  | 'values'
  | 'tags'
  | 'neighborhood'
  | 'crossStreets'
  | 'yearsInArea'
  | 'verifications'
  | 'conversationStarters'
>;

type ProfileState = {
  profile: User;
  updateProfile: (updates: Partial<EditableFields>) => void;
  setPrompts: (prompts: Prompt[]) => void;
};

export const useProfileStore = create<ProfileState>((set) => ({
  profile: ME,

  updateProfile: (updates) => set((s) => ({ profile: { ...s.profile, ...updates } })),

  setPrompts: (prompts) => set((s) => ({ profile: { ...s.profile, prompts } })),
}));
