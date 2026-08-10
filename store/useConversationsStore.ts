import { create } from 'zustand';

import { CONVERSATIONS, type Conversation, type Message } from '../data/mock';

type ConversationsState = {
  conversations: Record<string, Conversation>;
  unread: Record<string, number>;
  lastActivity: Record<string, number>;
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
      };
    });
  },

  markRead: (conversationId) =>
    set((s) => ({ unread: { ...s.unread, [conversationId]: 0 } })),
}));
