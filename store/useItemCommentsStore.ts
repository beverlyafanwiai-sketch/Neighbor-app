import { create } from 'zustand';

import { ME, type ReactionType } from '../data/mock';

export type ItemComment = {
  id: string;
  authorId: string;
  text: string;
  time: string;
  edited?: boolean;
  reactions?: Record<string, ReactionType>;
};

type ItemCommentsState = {
  comments: Record<string, ItemComment[]>;
  myReactions: Record<string, ReactionType | undefined>;
  addComment: (key: string, text: string) => void;
  updateComment: (key: string, commentId: string, text: string) => void;
  deleteComment: (key: string, commentId: string) => void;
  tapReaction: (key: string, commentId: string) => void;
  setReaction: (key: string, commentId: string, type: ReactionType) => void;
};

let itemCommentSeq = 0;

export const useItemCommentsStore = create<ItemCommentsState>((set) => ({
  comments: {},
  myReactions: {},

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

  updateComment: (key, commentId, text) => {
    const clean = text.trim();
    if (!clean) return;
    set((s) => ({
      comments: {
        ...s.comments,
        [key]: (s.comments[key] ?? []).map((c) =>
          c.id === commentId ? { ...c, text: clean, edited: true } : c
        ),
      },
    }));
  },

  deleteComment: (key, commentId) =>
    set((s) => ({
      comments: {
        ...s.comments,
        [key]: (s.comments[key] ?? []).filter((c) => c.id !== commentId),
      },
    })),

  tapReaction: (key, commentId) => {
    const reactionKey = itemCommentReactionKey(key, commentId);
    set((s) => ({
      myReactions: {
        ...s.myReactions,
        [reactionKey]: s.myReactions[reactionKey] ? undefined : 'love',
      },
    }));
  },

  setReaction: (key, commentId, type) => {
    const reactionKey = itemCommentReactionKey(key, commentId);
    set((s) => ({
      myReactions: {
        ...s.myReactions,
        [reactionKey]: s.myReactions[reactionKey] === type ? undefined : type,
      },
    }));
  },
}));

export function itemCommentKey(type: string, itemId: string) {
  return `${type}:${itemId}`;
}

export function itemCommentReactionKey(key: string, commentId: string) {
  return `${key}:${commentId}`;
}
