import { create } from 'zustand';

import { COMMENTS, ME, POSTS, type CommentItem, type Post } from '../data/mock';
import { findMentionedUsers } from '../lib/mentions';
import { useNotificationsStore } from './useNotificationsStore';
import { useProfileStore } from './useProfileStore';
import { useSettingsStore } from './useSettingsStore';

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
  likedByMe: Record<string, boolean>;
  savedIds: Record<string, boolean>;
  comments: Record<string, CommentItem[]>;
  createPost: (body: string, imageUri?: string) => void;
  updatePost: (id: string, updates: PostEdits) => void;
  deletePost: (id: string) => void;
  toggleLike: (postId: string) => void;
  toggleSave: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  updateComment: (postId: string, commentId: string, text: string) => void;
  deleteComment: (postId: string, commentId: string) => void;
};

export const usePostsStore = create<PostsState>((set) => ({
  posts: POSTS,
  likedByMe: {},
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

  toggleLike: (postId) =>
    set((s) => ({ likedByMe: { ...s.likedByMe, [postId]: !s.likedByMe[postId] } })),

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

export function getEffectiveLoves(post: Post, liked: boolean) {
  return post.loves + (liked ? 1 : 0);
}

export function getEffectiveReplies(post: Post, comments: CommentItem[]) {
  return post.replies + comments.length;
}
