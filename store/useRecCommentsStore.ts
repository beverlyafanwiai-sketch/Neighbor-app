import { create } from 'zustand';

import { ME, type ReactionType } from '../data/mock';

export type RecComment = {
  id: string;
  authorId: string;
  text: string;
  time: string;
  edited?: boolean;
  reactions?: Record<string, ReactionType>;
};

export function recCommentKey(entryId: string, commentId: string) {
  return `${entryId}:${commentId}`;
}

type RecCommentsState = {
  comments: Record<string, RecComment[]>;
  myReactions: Record<string, ReactionType | undefined>;
  bestAnswerId: Record<string, string | undefined>;
  addComment: (entryId: string, text: string) => void;
  updateComment: (entryId: string, commentId: string, text: string) => void;
  deleteComment: (entryId: string, commentId: string) => void;
  tapReaction: (entryId: string, commentId: string) => void;
  setReaction: (entryId: string, commentId: string, type: ReactionType) => void;
  markBestAnswer: (entryId: string, commentId: string) => void;
  unmarkBestAnswer: (entryId: string) => void;
};

const SEED: Record<string, RecComment[]> = {
  'rosas-plumbing': [
    {
      id: 'rc-seed-1',
      authorId: 'theo',
      text: 'Good to know — did she also handle a slow leak, or mostly bigger jobs?',
      time: '1d ago',
      reactions: { maya: 'love' },
    },
  ],
};

export const useRecCommentsStore = create<RecCommentsState>((set) => ({
  comments: SEED,
  myReactions: {},
  bestAnswerId: {},

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

  updateComment: (entryId, commentId, text) => {
    const clean = text.trim();
    if (!clean) return;
    set((s) => ({
      comments: {
        ...s.comments,
        [entryId]: (s.comments[entryId] ?? []).map((c) =>
          c.id === commentId ? { ...c, text: clean, edited: true } : c
        ),
      },
    }));
  },

  deleteComment: (entryId, commentId) =>
    set((s) => ({
      comments: {
        ...s.comments,
        [entryId]: (s.comments[entryId] ?? []).filter((c) => c.id !== commentId),
      },
      bestAnswerId:
        s.bestAnswerId[entryId] === commentId
          ? { ...s.bestAnswerId, [entryId]: undefined }
          : s.bestAnswerId,
    })),

  tapReaction: (entryId, commentId) => {
    const key = recCommentKey(entryId, commentId);
    set((s) => ({
      myReactions: { ...s.myReactions, [key]: s.myReactions[key] ? undefined : 'love' },
    }));
  },

  setReaction: (entryId, commentId, type) => {
    const key = recCommentKey(entryId, commentId);
    set((s) => ({
      myReactions: { ...s.myReactions, [key]: s.myReactions[key] === type ? undefined : type },
    }));
  },

  markBestAnswer: (entryId, commentId) =>
    set((s) => ({ bestAnswerId: { ...s.bestAnswerId, [entryId]: commentId } })),

  unmarkBestAnswer: (entryId) =>
    set((s) => ({ bestAnswerId: { ...s.bestAnswerId, [entryId]: undefined } })),
}));
