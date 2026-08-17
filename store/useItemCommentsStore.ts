import { create } from 'zustand';

import { ME } from '../data/mock';

export type ItemComment = {
  id: string;
  authorId: string;
  text: string;
  time: string;
};

type ItemCommentsState = {
  comments: Record<string, ItemComment[]>;
  addComment: (key: string, text: string) => void;
  deleteComment: (key: string, commentId: string) => void;
};

let itemCommentSeq = 0;

export const useItemCommentsStore = create<ItemCommentsState>((set) => ({
  comments: {},

  addComment: (key, text) => {
    const clean = text.trim();
    if (!clean) return;
    const comment: ItemComment = {
      id: `ic-${++itemCommentSeq}`,
      authorId: ME.id,
      text: clean,
      time: 'Just now',
    };
    set((s) => ({
      comments: { ...s.comments, [key]: [...(s.comments[key] ?? []), comment] },
    }));
  },

  deleteComment: (key, commentId) =>
    set((s) => ({
      comments: {
        ...s.comments,
        [key]: (s.comments[key] ?? []).filter((c) => c.id !== commentId),
      },
    })),
}));

export function itemCommentKey(type: string, itemId: string) {
  return `${type}:${itemId}`;
}
