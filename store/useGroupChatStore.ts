import { create } from 'zustand';

export type GroupMessage = { id: string; senderId: string; text: string; time: string };

type GroupChatState = {
  messages: Record<string, GroupMessage[]>;
  lastActivity: Record<string, number>;
  sendMessage: (groupId: string, text: string) => void;
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

export const useGroupChatStore = create<GroupChatState>((set) => ({
  messages: initialMessages,
  lastActivity: initialLastActivity,

  sendMessage: (groupId, text) => {
    set((s) => {
      const existing = s.messages[groupId] ?? [];
      const message: GroupMessage = {
        id: String(existing.length + 1),
        senderId: 'amara',
        text,
        time: 'Now',
      };
      return {
        messages: { ...s.messages, [groupId]: [...existing, message] },
        lastActivity: { ...s.lastActivity, [groupId]: ++activitySeq },
      };
    });
  },
}));
