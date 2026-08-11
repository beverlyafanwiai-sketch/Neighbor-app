import { create } from 'zustand';

import { CONVERSATIONS, getUser, type Conversation, type Message } from '../data/mock';
import { useNotificationsStore } from './useNotificationsStore';
import { useSettingsStore } from './useSettingsStore';

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
  getOrCreate: (userId: string) => string;
  sendMessage: (conversationId: string, text: string) => void;
  markRead: (conversationId: string) => void;
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

  sendMessage: (conversationId, text) => {
    set((s) => {
      const convo = s.conversations[conversationId];
      if (!convo) return s;
      const message: Message = {
        id: String(convo.messages.length + 1),
        from: 'me',
        text,
        time: 'Now',
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
}));
