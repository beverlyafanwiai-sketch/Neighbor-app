import { create } from 'zustand';

import { ME, getUser, type ReactionType } from '../data/mock';
import { findMentionedUsers } from '../lib/mentions';
import { useGroupsStore } from './useGroupsStore';
import { useMutedGroupsStore } from './useMutedGroupsStore';
import { useNotificationsStore } from './useNotificationsStore';
import { useProfileStore } from './useProfileStore';
import { useSettingsStore } from './useSettingsStore';

export type PollOption = { id: string; text: string };

export type Poll = {
  question: string;
  options: PollOption[];
  votes: Record<string, string>;
};

export type GroupMessage = {
  id: string;
  senderId: string;
  text: string;
  time: string;
  seenBy?: string[];
  imageUri?: string;
  deleted?: boolean;
  edited?: boolean;
  reactions?: Record<string, ReactionType>;
  forwardedFrom?: string;
  replyToId?: string;
  poll?: Poll;
};

export function groupMessageKey(groupId: string, messageId: string) {
  return `${groupId}:${messageId}`;
}

const REPLY_DELAY_MS = 2500;
const CANNED_REPLIES = [
  'Sounds good to me.',
  'Haha, same.',
  "I'm in.",
  'Can we do a bit later?',
  'Love this.',
];

function notifyMentions(text: string, groupId: string) {
  if (!useSettingsStore.getState().notificationPrefs.mentions) return;
  if (useMutedGroupsStore.getState().mutedGroupIds[groupId]) return;
  const authorName = useProfileStore.getState().profile.name;
  for (const user of findMentionedUsers(text)) {
    if (user.id === ME.id) continue;
    useNotificationsStore.getState().addNotification({
      type: 'mention',
      actorId: ME.id,
      text: `${authorName} mentioned you in a group message`,
      time: 'Just now',
      target: { kind: 'group-chat', id: groupId },
    });
  }
}

type GroupChatState = {
  messages: Record<string, GroupMessage[]>;
  lastActivity: Record<string, number>;
  typing: Record<string, string | undefined>;
  pinnedMessageId: Record<string, string | undefined>;
  myReactions: Record<string, ReactionType | undefined>;
  sendMessage: (
    groupId: string,
    text: string,
    imageUri?: string,
    forwardedFrom?: string,
    replyToId?: string
  ) => void;
  pinMessage: (groupId: string, messageId: string) => void;
  unpinMessage: (groupId: string) => void;
  deleteMessage: (groupId: string, messageId: string) => void;
  updateMessage: (groupId: string, messageId: string, text: string) => void;
  tapReaction: (groupId: string, messageId: string) => void;
  setReaction: (groupId: string, messageId: string, type: ReactionType) => void;
  sendPoll: (groupId: string, question: string, options: string[]) => void;
  votePoll: (groupId: string, messageId: string, optionId: string) => void;
};

const initialMessages: Record<string, GroupMessage[]> = {
  'weekend-hikers': [
    { id: '1', senderId: 'theo', text: 'Still on for Sunset Ridge Sunday?', time: '10:12 AM' },
    { id: '2', senderId: 'sam', text: 'Yep. Bringing extra water this time.', time: '10:14 AM' },
    { id: '3', senderId: 'maya', text: 'Can we regroup at the second junction? I always fall behind on the climb.', time: '10:20 AM' },
    { id: '4', senderId: 'theo', text: 'Always. No one gets left behind.', time: '10:21 AM' },
  ],
  'book-bourbon': [
    { id: '1', senderId: 'priya', text: 'How far is everyone on this month’s book?', time: 'Yesterday' },
    { id: '2', senderId: 'maya', text: 'About halfway. No spoilers please.', time: 'Yesterday' },
  ],
  'pottery-beginners': [
    { id: '1', senderId: 'sam', text: 'Studio’s free Sunday afternoon if anyone wants open time.', time: 'Mon' },
    { id: '2', senderId: 'theo', text: 'I’m in, my last bowl collapsed and I need redemption.', time: 'Mon' },
    { id: '3', senderId: 'priya', text: 'Same. 2pm?', time: 'Mon' },
  ],
};

const groupOrder = Object.keys(initialMessages);
const initialLastActivity: Record<string, number> = Object.fromEntries(
  groupOrder.map((id, i) => [id, groupOrder.length - i])
);

let activitySeq = groupOrder.length + 1000;

export const useGroupChatStore = create<GroupChatState>((set, get) => ({
  messages: initialMessages,
  lastActivity: initialLastActivity,
  typing: {},
  pinnedMessageId: {},
  myReactions: {},

  pinMessage: (groupId, messageId) =>
    set((s) => ({ pinnedMessageId: { ...s.pinnedMessageId, [groupId]: messageId } })),

  unpinMessage: (groupId) =>
    set((s) => ({ pinnedMessageId: { ...s.pinnedMessageId, [groupId]: undefined } })),

  deleteMessage: (groupId, messageId) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [groupId]: (s.messages[groupId] ?? []).map((m) =>
          m.id === messageId
            ? { ...m, text: '', imageUri: undefined, poll: undefined, deleted: true }
            : m
        ),
      },
      pinnedMessageId:
        s.pinnedMessageId[groupId] === messageId
          ? { ...s.pinnedMessageId, [groupId]: undefined }
          : s.pinnedMessageId,
    })),

  updateMessage: (groupId, messageId, text) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [groupId]: (s.messages[groupId] ?? []).map((m) =>
          m.id === messageId ? { ...m, text, edited: true } : m
        ),
      },
    })),

  sendMessage: (groupId, text, imageUri, forwardedFrom, replyToId) => {
    set((s) => {
      const existing = s.messages[groupId] ?? [];
      const message: GroupMessage = {
        id: String(existing.length + 1),
        senderId: ME.id,
        text,
        time: 'Now',
        imageUri,
        forwardedFrom,
        replyToId,
      };
      return {
        messages: { ...s.messages, [groupId]: [...existing, message] },
        lastActivity: { ...s.lastActivity, [groupId]: ++activitySeq },
      };
    });

    notifyMentions(text, groupId);

    const group = useGroupsStore.getState().groups.find((g) => g.id === groupId);
    const otherMemberIds = (group?.memberIds ?? []).filter((id) => id !== ME.id);
    if (otherMemberIds.length === 0) return;

    const replierId = otherMemberIds[Math.floor(Math.random() * otherMemberIds.length)];
    const replier = getUser(replierId);
    if (!replier) return;

    set((s) => ({ typing: { ...s.typing, [groupId]: replierId } }));

    setTimeout(() => {
      const current = get().messages[groupId] ?? [];
      const seenMessages = current.map((m) =>
        m.senderId === ME.id ? { ...m, seenBy: otherMemberIds } : m
      );
      const reply: GroupMessage = {
        id: String(current.length + 1),
        senderId: replierId,
        text: CANNED_REPLIES[current.length % CANNED_REPLIES.length],
        time: 'Just now',
      };
      set((s) => ({
        messages: { ...s.messages, [groupId]: [...seenMessages, reply] },
        lastActivity: { ...s.lastActivity, [groupId]: ++activitySeq },
        typing: { ...s.typing, [groupId]: undefined },
      }));

      if (
        useSettingsStore.getState().notificationPrefs.groupActivity &&
        !useMutedGroupsStore.getState().mutedGroupIds[groupId]
      ) {
        useNotificationsStore.getState().addNotification({
          type: 'group',
          actorId: replierId,
          text: `${replier.name} sent a new message in ${group?.name ?? 'your group'}`,
          time: 'Just now',
          target: { kind: 'group-chat', id: groupId },
        });
      }
    }, REPLY_DELAY_MS);
  },

  tapReaction: (groupId, messageId) => {
    const key = groupMessageKey(groupId, messageId);
    set((s) => ({
      myReactions: { ...s.myReactions, [key]: s.myReactions[key] ? undefined : 'love' },
    }));
  },

  setReaction: (groupId, messageId, type) => {
    const key = groupMessageKey(groupId, messageId);
    set((s) => ({
      myReactions: { ...s.myReactions, [key]: s.myReactions[key] === type ? undefined : type },
    }));
  },

  sendPoll: (groupId, question, options) => {
    const existing = get().messages[groupId] ?? [];
    const messageId = String(existing.length + 1);
    const pollOptions: PollOption[] = options.map((text, i) => ({ id: String(i + 1), text }));

    set((s) => {
      const current = s.messages[groupId] ?? [];
      const message: GroupMessage = {
        id: messageId,
        senderId: ME.id,
        text: '',
        time: 'Now',
        poll: { question, options: pollOptions, votes: {} },
      };
      return {
        messages: { ...s.messages, [groupId]: [...current, message] },
        lastActivity: { ...s.lastActivity, [groupId]: ++activitySeq },
      };
    });

    const group = useGroupsStore.getState().groups.find((g) => g.id === groupId);
    const otherMemberIds = (group?.memberIds ?? []).filter((id) => id !== ME.id);
    if (otherMemberIds.length === 0) return;
    const voterId = otherMemberIds[Math.floor(Math.random() * otherMemberIds.length)];

    setTimeout(() => {
      set((s) => ({
        messages: {
          ...s.messages,
          [groupId]: (s.messages[groupId] ?? []).map((m) => {
            if (m.id !== messageId || !m.poll) return m;
            const chosen = m.poll.options[Math.floor(Math.random() * m.poll.options.length)];
            return { ...m, poll: { ...m.poll, votes: { ...m.poll.votes, [voterId]: chosen.id } } };
          }),
        },
      }));
    }, REPLY_DELAY_MS);
  },

  votePoll: (groupId, messageId, optionId) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [groupId]: (s.messages[groupId] ?? []).map((m) => {
          if (m.id !== messageId || !m.poll) return m;
          const votes = { ...m.poll.votes };
          if (votes[ME.id] === optionId) {
            delete votes[ME.id];
          } else {
            votes[ME.id] = optionId;
          }
          return { ...m, poll: { ...m.poll, votes } };
        }),
      },
    })),
}));
