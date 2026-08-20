import { create } from 'zustand';

import { ME, type ReactionType } from '../data/mock';
import { findMentionedUsers } from '../lib/mentions';
import { useNotificationsStore } from './useNotificationsStore';
import { useProfileStore } from './useProfileStore';
import { useSettingsStore } from './useSettingsStore';

function notifyMentions(text: string, key: string) {
  if (!useSettingsStore.getState().notificationPrefs.mentions) return;
  const [type, itemId] = key.split(':');
  if (type !== 'sale' && type !== 'lend') return;
  const authorName = useProfileStore.getState().profile.name;
  for (const user of findMentionedUsers(text)) {
    if (user.id === ME.id) continue;
    useNotificationsStore.getState().addNotification({
      type: 'mention',
      actorId: ME.id,
      text: `${authorName} mentioned you in a ${type === 'sale' ? 'listing' : 'lend'} comment`,
      time: 'Just now',
      target: { kind: type, id: itemId },
    });
  }
}

export type ItemComment = {
  id: string;
  authorId: string;
  text: string;
  time: string;
  edited?: boolean;
  reactions?: Record<string, ReactionType>;
  replyToId?: string;
};

type ItemCommentsState = {
  comments: Record<string, ItemComment[]>;
  myReactions: Record<string, ReactionType | undefined>;
  pinnedCommentId: Record<string, string | undefined>;
  addComment: (key: string, text: string, replyToId?: string) => void;
  updateComment: (key: string, commentId: string, text: string) => void;
  deleteComment: (key: string, commentId: string) => void;
  tapReaction: (key: string, commentId: string) => void;
  setReaction: (key: string, commentId: string, type: ReactionType) => void;
  togglePinComment: (key: string, commentId: string) => void;
};

let itemCommentSeq = 0;

export const useItemCommentsStore = create<ItemCommentsState>((set) => ({
  comments: {},
  myReactions: {},
  pinnedCommentId: {},

  addComment: (key, text, replyToId) => {
    const clean = text.trim();
    if (!clean) return;
    const comment: ItemComment = {
      id: `ic-${++itemCommentSeq}`,
      authorId: ME.id,
      text: clean,
      time: 'Just now',
      replyToId,
    };
    set((s) => ({
      comments: { ...s.comments, [key]: [...(s.comments[key] ?? []), comment] },
    }));
    notifyMentions(clean, key);
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
      pinnedCommentId:
        s.pinnedCommentId[key] === commentId
          ? { ...s.pinnedCommentId, [key]: undefined }
          : s.pinnedCommentId,
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

  togglePinComment: (key, commentId) =>
    set((s) => ({
      pinnedCommentId: {
        ...s.pinnedCommentId,
        [key]: s.pinnedCommentId[key] === commentId ? undefined : commentId,
      },
    })),
}));

export function itemCommentKey(type: string, itemId: string) {
  return `${type}:${itemId}`;
}

export function itemCommentReactionKey(key: string, commentId: string) {
  return `${key}:${commentId}`;
}
