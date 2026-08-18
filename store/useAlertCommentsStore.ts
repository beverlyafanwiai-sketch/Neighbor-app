import { create } from 'zustand';

import { ME, type ReactionType } from '../data/mock';

export type AlertComment = {
  id: string;
  authorId: string;
  text: string;
  time: string;
  edited?: boolean;
  reactions?: Record<string, ReactionType>;
};

export function alertCommentKey(alertId: string, commentId: string) {
  return `${alertId}:${commentId}`;
}

type AlertCommentsState = {
  comments: Record<string, AlertComment[]>;
  myReactions: Record<string, ReactionType | undefined>;
  addComment: (alertId: string, text: string) => void;
  updateComment: (alertId: string, commentId: string, text: string) => void;
  deleteComment: (alertId: string, commentId: string) => void;
  tapReaction: (alertId: string, commentId: string) => void;
  setReaction: (alertId: string, commentId: string, type: ReactionType) => void;
};

const SEED: Record<string, AlertComment[]> = {
  'alert-1': [
    {
      id: 'ac-seed-1',
      authorId: 'theo',
      text: 'Saw him near the creek trail about an hour ago, still had his collar on.',
      time: '1h ago',
    },
  ],
};

export const useAlertCommentsStore = create<AlertCommentsState>((set) => ({
  comments: SEED,
  myReactions: {},

  addComment: (alertId, text) => {
    const clean = text.trim();
    if (!clean) return;
    const comment: AlertComment = {
      id: `ac-${Date.now()}`,
      authorId: ME.id,
      text: clean,
      time: 'Just now',
    };
    set((s) => ({
      comments: { ...s.comments, [alertId]: [...(s.comments[alertId] ?? []), comment] },
    }));
  },

  updateComment: (alertId, commentId, text) => {
    const clean = text.trim();
    if (!clean) return;
    set((s) => ({
      comments: {
        ...s.comments,
        [alertId]: (s.comments[alertId] ?? []).map((c) =>
          c.id === commentId ? { ...c, text: clean, edited: true } : c
        ),
      },
    }));
  },

  deleteComment: (alertId, commentId) =>
    set((s) => ({
      comments: {
        ...s.comments,
        [alertId]: (s.comments[alertId] ?? []).filter((c) => c.id !== commentId),
      },
    })),

  tapReaction: (alertId, commentId) => {
    const key = alertCommentKey(alertId, commentId);
    set((s) => ({
      myReactions: { ...s.myReactions, [key]: s.myReactions[key] ? undefined : 'love' },
    }));
  },

  setReaction: (alertId, commentId, type) => {
    const key = alertCommentKey(alertId, commentId);
    set((s) => ({
      myReactions: { ...s.myReactions, [key]: s.myReactions[key] === type ? undefined : type },
    }));
  },
}));
