import { create } from 'zustand';

import { ME } from '../data/mock';

export type RecComment = {
  id: string;
  authorId: string;
  text: string;
  time: string;
};

type RecCommentsState = {
  comments: Record<string, RecComment[]>;
  addComment: (entryId: string, text: string) => void;
  deleteComment: (entryId: string, commentId: string) => void;
};

const SEED: Record<string, RecComment[]> = {
  'rosas-plumbing': [
    {
      id: 'rc-seed-1',
      authorId: 'theo',
      text: 'Good to know — did she also handle a slow leak, or mostly bigger jobs?',
      time: '1d ago',
    },
  ],
};

export const useRecCommentsStore = create<RecCommentsState>((set) => ({
  comments: SEED,

  addComment: (entryId, text) => {
    const clean = text.trim();
    if (!clean) return;
    const comment: RecComment = {
      id: `rc-${Date.now()}`,
      authorId: ME.id,
      text: clean,
      time: 'Just now',
    };
    set((s) => ({
      comments: { ...s.comments, [entryId]: [...(s.comments[entryId] ?? []), comment] },
    }));
  },

  deleteComment: (entryId, commentId) =>
    set((s) => ({
      comments: {
        ...s.comments,
        [entryId]: (s.comments[entryId] ?? []).filter((c) => c.id !== commentId),
      },
    })),
}));
