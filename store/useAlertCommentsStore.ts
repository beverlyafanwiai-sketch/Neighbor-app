import { create } from 'zustand';

import { ME } from '../data/mock';

export type AlertComment = {
  id: string;
  authorId: string;
  text: string;
  time: string;
};

type AlertCommentsState = {
  comments: Record<string, AlertComment[]>;
  addComment: (alertId: string, text: string) => void;
  deleteComment: (alertId: string, commentId: string) => void;
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

  deleteComment: (alertId, commentId) =>
    set((s) => ({
      comments: {
        ...s.comments,
        [alertId]: (s.comments[alertId] ?? []).filter((c) => c.id !== commentId),
      },
    })),
}));
