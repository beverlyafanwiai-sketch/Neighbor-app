import { create } from 'zustand';

import { CONVERSATIONS, getUser, type Conversation, type Message, type ReactionType } from '../data/mock';
import { useNotificationsStore } from './useNotificationsStore';
import { useSettingsStore } from './useSettingsStore';

export function messageKey(conversationId: string, messageId: string) {
  return `${conversationId}:${messageId}`;
}

const REPLY_DELAY_MS = 2500;
const CANNED_REPLIES = [
  'Sounds good!',
  'Haha, fair enough.',
  "I'll let you know.",
  'Same time as always?',
  "Can't wait.",
];

type ConversationsState = {
  conversations: Record<string, Conversation>;
  unread: Record<string, number>;
  lastActivity: Record<string, number>;
  typing: Record<string, boolean>;
  myReactions: Record<string, ReactionType | undefined>;
  getOrCreate: (userId: string) => string;
  sendMessage: (conversationId: string, text: string, imageUri?: string, forwardedFrom?: string) => void;
  markRead: (conversationId: string) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  updateMessage: (conversationId: string, messageId: string, text: string) => void;
  tapReaction: (conversationId: string, messageId: string) => void;
  setReaction: (conversationId: string, messageId: string, type: ReactionType) => void;
};

const initial: Record<string, Conversation> = Object.fromEntries(
  CONVERSATIONS.map((c) => [c.id, c])
);

function trailingUnreadCount(messages: Message[]) {
  let count = 0;
  for (let i = messages.length - 1; i >= 0 && messages[i].from === 'them'; i--) count++;
  return count;
}

const initialUnread: Record<string, number> = Object.fromEntries(
  CONVERSATIONS.map((c) => [c.id, trailingUnreadCount(c.messages)])
);

const initialLastActivity: Record<string, number> = Object.fromEntries(
  CONVERSATIONS.map((c, i) => [c.id, CONVERSATIONS.length - i])
);

let activitySeq = CONVERSATIONS.length + 1000;

export const useConversationsStore = create<ConversationsState>((set, get) => ({
  conversations: initial,
  unread: initialUnread,
  lastActivity: initialLastActivity,
  typing: {},
  myReactions: {},

  getOrCreate: (userId) => {
    const id = `convo-${userId}`;
    if (!get().conversations[id]) {
      set((s) => ({
        conversations: { ...s.conversations, [id]: { id, userId, messages: [] } },
        lastActivity: { ...s.lastActivity, [id]: ++activitySeq },
      }));
    }
    return id;
  },

  sendMessage: (conversationId, text, imageUri, forwardedFrom) => {
    set((s) => {
      const convo = s.conversations[conversationId];
      if (!convo) return s;
      const message: Message = {
        id: String(convo.messages.length + 1),
        from: 'me',
        text,
        time: 'Now',
        imageUri,
        forwardedFrom,
      };
      return {
        conversations: {
          ...s.conversations,
          [conversationId]: { ...convo, messages: [...convo.messages, message] },
        },
        lastActivity: { ...s.lastActivity, [conversationId]: ++activitySeq },
        typing: { ...s.typing, [conversationId]: true },
      };
    });

    setTimeout(() => {
      const convo = get().conversations[conversationId];
      if (!convo) return;
      const user = getUser(convo.userId);
      if (!user) return;

      const reply: Message = {
        id: String(convo.messages.length + 1),
        from: 'them',
        text: CANNED_REPLIES[convo.messages.length % CANNED_REPLIES.length],
        time: 'Just now',
      };
      const seenMessages = convo.messages.map((m) =>
        m.from === 'me' ? { ...m, seen: true } : m
      );
      set((s) => ({
        conversations: {
          ...s.conversations,
          [conversationId]: { ...convo, messages: [...seenMessages, reply] },
        },
        unread: { ...s.unread, [conversationId]: (s.unread[conversationId] ?? 0) + 1 },
        lastActivity: { ...s.lastActivity, [conversationId]: ++activitySeq },
        typing: { ...s.typing, [conversationId]: false },
      }));

      if (useSettingsStore.getState().notificationPrefs.messages) {
        useNotificationsStore.getState().addNotification({
          type: 'message',
          actorId: user.id,
          text: `${user.name} sent you a new message`,
          time: 'Just now',
          target: { kind: 'chat', id: conversationId },
        });
      }
    }, REPLY_DELAY_MS);
  },

  markRead: (conversationId) =>
    set((s) => ({ unread: { ...s.unread, [conversationId]: 0 } })),

  deleteMessage: (conversationId, messageId) =>
    set((s) => {
      const convo = s.conversations[conversationId];
      if (!convo) return s;
      return {
        conversations: {
          ...s.conversations,
          [conversationId]: {
            ...convo,
            messages: convo.messages.map((m) =>
              m.id === messageId ? { ...m, text: '', imageUri: undefined, deleted: true } : m
            ),
          },
        },
      };
    }),

  updateMessage: (conversationId, messageId, text) =>
    set((s) => {
      const convo = s.conversations[conversationId];
      if (!convo) return s;
      return {
        conversations: {
          ...s.conversations,
          [conversationId]: {
            ...convo,
            messages: convo.messages.map((m) =>
              m.id === messageId ? { ...m, text, edited: true } : m
            ),
          },
        },
      };
    }),

  tapReaction: (conversationId, messageId) => {
    const key = messageKey(conversationId, messageId);
    set((s) => ({
      myReactions: { ...s.myReactions, [key]: s.myReactions[key] ? undefined : 'love' },
    }));
  },

  setReaction: (conversationId, messageId, type) => {
    const key = messageKey(conversationId, messageId);
    set((s) => ({
      myReactions: { ...s.myReactions, [key]: s.myReactions[key] === type ? undefined : type },
    }));
  },
}));
