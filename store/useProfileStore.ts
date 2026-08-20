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
  resetProfile: () => void;
};

// What "Delete account" reverts to — keeps the same id (so the rest of the
// app's ME.id comparisons keep working) but clears every customizable field,
// so a deleted profile actually reads as removed rather than still showing
// the original seed bio.
const BLANK_PROFILE: User = {
  id: ME.id,
  name: '',
  avatar: 'https://i.pravatar.cc/300?img=1',
  tagline: '',
  bio: '',
  interests: '',
  values: '',
  prompts: [],
  tags: [],
  neighborhood: '',
  crossStreets: '',
  yearsInArea: '',
  verifications: [],
  conversationStarters: { askMeAbout: '', skillsToShare: '', neighborhoodLove: '' },
};

export const useProfileStore = create<ProfileState>((set) => ({
  profile: ME,

  updateProfile: (updates) => set((s) => ({ profile: { ...s.profile, ...updates } })),

  setPrompts: (prompts) => set((s) => ({ profile: { ...s.profile, prompts } })),

  resetProfile: () => set({ profile: BLANK_PROFILE }),
}));
