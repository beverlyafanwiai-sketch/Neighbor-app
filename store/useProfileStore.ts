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
  deletedSnapshot: User | null;
  updateProfile: (updates: Partial<EditableFields>) => void;
  setPrompts: (prompts: Prompt[]) => void;
  resetProfile: () => void;
  deleteProfile: () => void;
  reactivateProfile: () => void;
  dismissDeletedSnapshot: () => void;
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

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: ME,
  deletedSnapshot: null,

  updateProfile: (updates) => set((s) => ({ profile: { ...s.profile, ...updates } })),

  setPrompts: (prompts) => set((s) => ({ profile: { ...s.profile, prompts } })),

  // Used when starting a brand-new signup — nothing to preserve, so no
  // snapshot is kept (there's nothing to "reactivate" for a fresh account).
  resetProfile: () => set({ profile: BLANK_PROFILE }),

  // Used by "Delete account" — keeps a snapshot so signing back in can offer
  // to restore it, matching the reactivation window most real apps give you
  // instead of destroying everything the instant you tap delete.
  deleteProfile: () => set((s) => ({ profile: BLANK_PROFILE, deletedSnapshot: s.profile })),

  reactivateProfile: () => {
    const snapshot = get().deletedSnapshot;
    if (!snapshot) return;
    set({ profile: snapshot, deletedSnapshot: null });
  },

  dismissDeletedSnapshot: () => set({ deletedSnapshot: null }),
}));
