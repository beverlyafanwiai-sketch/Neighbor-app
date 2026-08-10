import { create } from 'zustand';

import { CONVERSATIONS, type Conversation, type Message } from '../data/mock';

type ConversationsState = {
  conversations: Record<string, Conversation>;
  getOrCreate: (userId: string) => string;
  sendMessage: (conversationId: string, text: string) => void;
};

const initial: Record<string, Conversation> = Object.fromEntries(
  CONVERSATIONS.map((c) => [c.id, c])
);

export const useConversationsStore = create<ConversationsState>((set, get) => ({
  conversations: initial,

  getOrCreate: (userId) => {
    const id = `convo-${userId}`;
    if (!get().conversations[id]) {
      set((s) => ({
        conversations: { ...s.conversations, [id]: { id, userId, messages: [] } },
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
      };
    });
  },
}));
