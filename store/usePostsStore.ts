import { create } from 'zustand';

import { COMMENTS, ME, POSTS, type CommentItem, type Poll, type Post, type ReactionType } from '../data/mock';
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

export type Draft = {
  id: string;
  body: string;
  imageUri?: string;
  updatedAt: number;
};

export function commentKey(postId: string, commentId: string) {
  return `${postId}:${commentId}`;
}

let draftSeq = 0;

type PostsState = {
  posts: Post[];
  drafts: Draft[];
  myReactions: Record<string, ReactionType | undefined>;
  myCommentReactions: Record<string, ReactionType | undefined>;
  savedIds: Record<string, boolean>;
  comments: Record<string, CommentItem[]>;
  myPollVotes: Record<string, string>;
  createPost: (body: string, imageUri?: string, poll?: Poll) => void;
  updatePost: (id: string, updates: PostEdits) => void;
  deletePost: (id: string) => void;
  votePoll: (postId: string, optionId: string) => void;
  saveDraft: (input: { id?: string; body: string; imageUri?: string }) => string;
  deleteDraft: (id: string) => void;
  tapReaction: (postId: string) => void;
  setReaction: (postId: string, type: ReactionType) => void;
  tapCommentReaction: (postId: string, commentId: string) => void;
  setCommentReaction: (postId: string, commentId: string, type: ReactionType) => void;
  toggleSave: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  updateComment: (postId: string, commentId: string, text: string) => void;
  deleteComment: (postId: string, commentId: string) => void;
};

export const usePostsStore = create<PostsState>((set) => ({
  posts: POSTS,
  drafts: [],
  myReactions: {},
  myCommentReactions: {},
  savedIds: {},
  comments: COMMENTS,
  myPollVotes: {},

  createPost: (body, imageUri, poll) => {
    const post: Post = {
      id: `${Date.now()}`,
      authorId: ME.id,
      time: 'Just now',
      body,
      replies: 0,
      imageUri,
      poll,
    };
    set((s) => ({ posts: [post, ...s.posts] }));
    notifyMentions(body, post.id, 'post');
  },

  updatePost: (id, updates) =>
    set((s) => ({
      posts: s.posts.map((p) => (p.id === id ? { ...p, ...updates, edited: true } : p)),
    })),

  deletePost: (id) => set((s) => ({ posts: s.posts.filter((p) => p.id !== id) })),

  votePoll: (postId, optionId) =>
    set((s) => ({
      myPollVotes: {
        ...s.myPollVotes,
        [postId]: s.myPollVotes[postId] === optionId ? '' : optionId,
      },
    })),

  saveDraft: ({ id, body, imageUri }) => {
    const draftId = id ?? `draft-${++draftSeq}`;
    const updatedAt = Date.now();
    set((s) => {
      const draft: Draft = { id: draftId, body, imageUri, updatedAt };
      const exists = s.drafts.some((d) => d.id === draftId);
      return {
        drafts: exists
          ? s.drafts.map((d) => (d.id === draftId ? draft : d))
          : [draft, ...s.drafts],
      };
    });
    return draftId;
  },

  deleteDraft: (id) => set((s) => ({ drafts: s.drafts.filter((d) => d.id !== id) })),

  tapReaction: (postId) =>
    set((s) => ({
      myReactions: { ...s.myReactions, [postId]: s.myReactions[postId] ? undefined : 'love' },
    })),

  setReaction: (postId, type) =>
    set((s) => ({
      myReactions: { ...s.myReactions, [postId]: s.myReactions[postId] === type ? undefined : type },
    })),

  tapCommentReaction: (postId, commentId) => {
    const key = commentKey(postId, commentId);
    set((s) => ({
      myCommentReactions: {
        ...s.myCommentReactions,
        [key]: s.myCommentReactions[key] ? undefined : 'love',
      },
    }));
  },

  setCommentReaction: (postId, commentId, type) => {
    const key = commentKey(postId, commentId);
    set((s) => ({
      myCommentReactions: {
        ...s.myCommentReactions,
        [key]: s.myCommentReactions[key] === type ? undefined : type,
      },
    }));
  },

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

export function getAllReactors(
  reactions: Record<string, ReactionType> | undefined,
  myReaction: ReactionType | undefined
): Record<string, ReactionType> {
  const all = { ...reactions };
  if (myReaction) {
    all[ME.id] = myReaction;
  } else {
    delete all[ME.id];
  }
  return all;
}

export function getEffectiveReactions(
  reactions: Record<string, ReactionType> | undefined,
  myReaction: ReactionType | undefined
): Partial<Record<ReactionType, number>> {
  const counts: Partial<Record<ReactionType, number>> = {};
  for (const type of Object.values(getAllReactors(reactions, myReaction))) {
    counts[type] = (counts[type] ?? 0) + 1;
  }
  return counts;
}

export function getReactorsByType(
  reactions: Record<string, ReactionType> | undefined,
  myReaction: ReactionType | undefined
): Partial<Record<ReactionType, string[]>> {
  const grouped: Partial<Record<ReactionType, string[]>> = {};
  for (const [userId, type] of Object.entries(getAllReactors(reactions, myReaction))) {
    grouped[type] = [...(grouped[type] ?? []), userId];
  }
  return grouped;
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

export function getEffectivePollResults(poll: Poll, myVote: string | undefined) {
  const results = poll.options.map((o) => ({
    ...o,
    votes: o.votes + (o.id === myVote ? 1 : 0),
  }));
  const total = results.reduce((sum, o) => sum + o.votes, 0);
  return { results, total };
}
