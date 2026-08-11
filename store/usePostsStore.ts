import { create } from 'zustand';

import { COMMENTS, ME, POSTS, type CommentItem, type Post, type ReactionType } from '../data/mock';
import { findMentionedUsers } from '../lib/mentions';
import { useNotificationsStore } from './useNotificationsStore';
import { useProfileStore } from './useProfileStore';
import { useSettingsStore } from './useSettingsStore';

export const REACTION_TYPES: ReactionType[] = ['love', 'haha', 'wow', 'sad', 'clap'];

export const REACTION_EMOJI: Record<ReactionType, string> = {
  love: '❤️',
  haha: '😂',
  wow: '😮',
  sad: '😢',
  clap: '🙌',
};

function notifyMentions(text: string, postId: string, context: 'post' | 'comment') {
  if (!useSettingsStore.getState().notificationPrefs.mentions) return;
  const authorName = useProfileStore.getState().profile.name;
  for (const user of findMentionedUsers(text)) {
    if (user.id === ME.id) continue;
    useNotificationsStore.getState().addNotification({
      type: 'mention',
      actorId: ME.id,
      text: `${authorName} mentioned you in a ${context}`,
      time: 'Just now',
      target: { kind: 'post', id: postId },
    });
  }
}

export type PostEdits = { body: string; imageUri?: string };

type PostsState = {
  posts: Post[];
  myReactions: Record<string, ReactionType | undefined>;
  savedIds: Record<string, boolean>;
  comments: Record<string, CommentItem[]>;
  createPost: (body: string, imageUri?: string) => void;
  updatePost: (id: string, updates: PostEdits) => void;
  deletePost: (id: string) => void;
  tapReaction: (postId: string) => void;
  setReaction: (postId: string, type: ReactionType) => void;
  toggleSave: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  updateComment: (postId: string, commentId: string, text: string) => void;
  deleteComment: (postId: string, commentId: string) => void;
};

export const usePostsStore = create<PostsState>((set) => ({
  posts: POSTS,
  myReactions: {},
  savedIds: {},
  comments: COMMENTS,

  createPost: (body, imageUri) => {
    const post: Post = {
      id: `${Date.now()}`,
      authorId: ME.id,
      time: 'Just now',
      body,
      loves: 0,
      replies: 0,
      imageUri,
    };
    set((s) => ({ posts: [post, ...s.posts] }));
    notifyMentions(body, post.id, 'post');
  },

  updatePost: (id, updates) =>
    set((s) => ({
      posts: s.posts.map((p) => (p.id === id ? { ...p, ...updates, edited: true } : p)),
    })),

  deletePost: (id) => set((s) => ({ posts: s.posts.filter((p) => p.id !== id) })),

  tapReaction: (postId) =>
    set((s) => ({
      myReactions: { ...s.myReactions, [postId]: s.myReactions[postId] ? undefined : 'love' },
    })),

  setReaction: (postId, type) =>
    set((s) => ({
      myReactions: { ...s.myReactions, [postId]: s.myReactions[postId] === type ? undefined : type },
    })),

  toggleSave: (postId) =>
    set((s) => ({ savedIds: { ...s.savedIds, [postId]: !s.savedIds[postId] } })),

  addComment: (postId, text) => {
    const comment: CommentItem = { id: `${Date.now()}`, authorId: ME.id, text, time: 'Just now' };
    set((s) => ({
      comments: { ...s.comments, [postId]: [...(s.comments[postId] ?? []), comment] },
    }));
    notifyMentions(text, postId, 'comment');
  },

  updateComment: (postId, commentId, text) =>
    set((s) => ({
      comments: {
        ...s.comments,
        [postId]: (s.comments[postId] ?? []).map((c) =>
          c.id === commentId ? { ...c, text, edited: true } : c
        ),
      },
    })),

  deleteComment: (postId, commentId) =>
    set((s) => ({
      comments: {
        ...s.comments,
        [postId]: (s.comments[postId] ?? []).filter((c) => c.id !== commentId),
      },
    })),
}));

export function getEffectiveReactions(
  post: Post,
  myReaction: ReactionType | undefined
): Partial<Record<ReactionType, number>> {
  const base = post.reactionCounts ?? { love: post.loves };
  if (!myReaction) return base;
  return { ...base, [myReaction]: (base[myReaction] ?? 0) + 1 };
}

export function getReactionTotal(counts: Partial<Record<ReactionType, number>>) {
  return Object.values(counts).reduce((sum: number, n) => sum + (n ?? 0), 0);
}

export function getTopReactionTypes(
  counts: Partial<Record<ReactionType, number>>,
  max = 2
): ReactionType[] {
  return REACTION_TYPES.filter((t) => (counts[t] ?? 0) > 0)
    .sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0))
    .slice(0, max);
}

export function getEffectiveReplies(post: Post, comments: CommentItem[]) {
  return post.replies + comments.length;
}
