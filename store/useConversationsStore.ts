import { create } from 'zustand';

import { CONVERSATIONS, ME, getUser, type Conversation, type Message, type ReactionType } from '../data/mock';
import { findMentionedUsers } from '../lib/mentions';
import { useNotificationsStore } from './useNotificationsStore';
import { useProfileStore } from './useProfileStore';
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

function notifyMentions(text: string, conversationId: string) {
  if (!useSettingsStore.getState().notificationPrefs.mentions) return;
  const authorName = useProfileStore.getState().profile.name;
  for (const user of findMentionedUsers(text)) {
    if (user.id === ME.id) continue;
    useNotificationsStore.getState().addNotification({
      type: 'mention',
      actorId: ME.id,
      text: `${authorName} mentioned you in a message`,
      time: 'Just now',
      target: { kind: 'chat', id: conversationId },
    });
  }
}

type ConversationsState = {
  conversations: Record<string, Conversation>;
  unread: Record<string, number>;
  lastActivity: Record<string, number>;
  typing: Record<string, boolean>;
  myReactions: Record<string, ReactionType | undefined>;
  pinnedMessageId: Record<string, string | undefined>;
  getOrCreate: (userId: string) => string;
  sendMessage: (
    conversationId: string,
    text: string,
    imageUri?: string,
    forwardedFrom?: string,
    replyToId?: string
  ) => void;
  markRead: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  updateMessage: (conversationId: string, messageId: string, text: string) => void;
  tapReaction: (conversationId: string, messageId: string) => void;
  setReaction: (conversationId: string, messageId: string, type: ReactionType) => void;
  pinMessage: (conversationId: string, messageId: string) => void;
  unpinMessage: (conversationId: string) => void;
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
  pinnedMessageId: {},

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

  sendMessage: (conversationId, text, imageUri, forwardedFrom, replyToId) => {
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
        replyToId,
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

    notifyMentions(text, conversationId);

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
      const readReceiptsOn = useSettingsStore.getState().readReceipts;
      const seenMessages = convo.messages.map((m) =>
        m.from === 'me' && readReceiptsOn ? { ...m, seen: true } : m
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

  deleteConversation: (conversationId) =>
    set((s) => {
      const { [conversationId]: _c, ...conversations } = s.conversations;
      const { [conversationId]: _u, ...unread } = s.unread;
      const { [conversationId]: _l, ...lastActivity } = s.lastActivity;
      const { [conversationId]: _p, ...pinnedMessageId } = s.pinnedMessageId;
      return { conversations, unread, lastActivity, pinnedMessageId };
    }),

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
        pinnedMessageId:
          s.pinnedMessageId[conversationId] === messageId
            ? { ...s.pinnedMessageId, [conversationId]: undefined }
            : s.pinnedMessageId,
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

  pinMessage: (conversationId, messageId) =>
    set((s) => ({ pinnedMessageId: { ...s.pinnedMessageId, [conversationId]: messageId } })),

  unpinMessage: (conversationId) =>
    set((s) => ({ pinnedMessageId: { ...s.pinnedMessageId, [conversationId]: undefined } })),
}));
