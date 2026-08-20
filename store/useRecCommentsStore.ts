import { create } from 'zustand';

import { ME, type ReactionType } from '../data/mock';
import { findMentionedUsers } from '../lib/mentions';
import { useNotificationsStore } from './useNotificationsStore';
import { useProfileStore } from './useProfileStore';
import { useSettingsStore } from './useSettingsStore';

function notifyMentions(text: string, entryId: string) {
  if (!useSettingsStore.getState().notificationPrefs.mentions) return;
  const authorName = useProfileStore.getState().profile.name;
  for (const user of findMentionedUsers(text)) {
    if (user.id === ME.id) continue;
    useNotificationsStore.getState().addNotification({
      type: 'mention',
      actorId: ME.id,
      text: `${authorName} mentioned you in a rec comment`,
      time: 'Just now',
      target: { kind: 'rec', id: entryId },
    });
  }
}

export type RecComment = {
  id: string;
  authorId: string;
  text: string;
  time: string;
  edited?: boolean;
  reactions?: Record<string, ReactionType>;
  replyToId?: string;
};

export function recCommentKey(entryId: string, commentId: string) {
  return `${entryId}:${commentId}`;
}

type RecCommentsState = {
  comments: Record<string, RecComment[]>;
  myReactions: Record<string, ReactionType | undefined>;
  bestAnswerId: Record<string, string | undefined>;
  pinnedCommentId: Record<string, string | undefined>;
  addComment: (entryId: string, text: string, replyToId?: string) => void;
  updateComment: (entryId: string, commentId: string, text: string) => void;
  deleteComment: (entryId: string, commentId: string) => void;
  tapReaction: (entryId: string, commentId: string) => void;
  setReaction: (entryId: string, commentId: string, type: ReactionType) => void;
  markBestAnswer: (entryId: string, commentId: string) => void;
  unmarkBestAnswer: (entryId: string) => void;
  togglePinComment: (entryId: string, commentId: string) => void;
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
  pinnedCommentId: {},

  addComment: (entryId, text, replyToId) => {
    const clean = text.trim();
    if (!clean) return;
    const comment: RecComment = {
      id: `rc-${Date.now()}`,
      authorId: ME.id,
      text: clean,
      time: 'Just now',
      replyToId,
    };
    set((s) => ({
      comments: { ...s.comments, [entryId]: [...(s.comments[entryId] ?? []), comment] },
    }));
    notifyMentions(clean, entryId);
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
      pinnedCommentId:
        s.pinnedCommentId[entryId] === commentId
          ? { ...s.pinnedCommentId, [entryId]: undefined }
          : s.pinnedCommentId,
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

  togglePinComment: (entryId, commentId) =>
    set((s) => ({
      pinnedCommentId: {
        ...s.pinnedCommentId,
        [entryId]: s.pinnedCommentId[entryId] === commentId ? undefined : commentId,
      },
    })),
}));
