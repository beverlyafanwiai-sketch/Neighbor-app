import { create } from 'zustand';

import { ME, POSTS, type Post } from '../data/mock';

type PostsState = {
  posts: Post[];
  createPost: (body: string) => void;
};

export const usePostsStore = create<PostsState>((set) => ({
  posts: POSTS,

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
}));
