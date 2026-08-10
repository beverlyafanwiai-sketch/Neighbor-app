import { create } from 'zustand';

import { COMMENTS, ME, POSTS, type CommentItem, type Post } from '../data/mock';

type PostsState = {
  posts: Post[];
  likedByMe: Record<string, boolean>;
  comments: Record<string, CommentItem[]>;
  createPost: (body: string) => void;
  updatePost: (id: string, body: string) => void;
  deletePost: (id: string) => void;
  toggleLike: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
};

export const usePostsStore = create<PostsState>((set) => ({
  posts: POSTS,
  likedByMe: {},
  comments: COMMENTS,

  createPost: (body) => {
    const post: Post = {
      id: `${Date.now()}`,
      authorId: ME.id,
      time: 'Just now',
      body,
      loves: 0,
      replies: 0,
    };
    set((s) => ({ posts: [post, ...s.posts] }));
  },

  updatePost: (id, body) =>
    set((s) => ({ posts: s.posts.map((p) => (p.id === id ? { ...p, body } : p)) })),

  deletePost: (id) => set((s) => ({ posts: s.posts.filter((p) => p.id !== id) })),

  toggleLike: (postId) =>
    set((s) => ({ likedByMe: { ...s.likedByMe, [postId]: !s.likedByMe[postId] } })),

  addComment: (postId, text) => {
    const comment: CommentItem = { id: `${Date.now()}`, authorId: ME.id, text, time: 'Just now' };
    set((s) => ({
      comments: { ...s.comments, [postId]: [...(s.comments[postId] ?? []), comment] },
    }));
  },
}));

export function getEffectiveLoves(post: Post, liked: boolean) {
  return post.loves + (liked ? 1 : 0);
}

export function getEffectiveReplies(post: Post, comments: CommentItem[]) {
  return post.replies + comments.length;
}
