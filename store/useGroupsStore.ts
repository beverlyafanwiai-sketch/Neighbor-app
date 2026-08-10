import { create } from 'zustand';

import { GROUPS, ME, type Group, type Tone } from '../data/mock';

export type NewGroupInput = {
  name: string;
  description: string;
  tone: Tone;
};

export type GroupEdits = Pick<Group, 'name' | 'description' | 'tone'>;

type GroupsState = {
  groups: Group[];
  joined: Record<string, boolean>;
  toggle: (groupId: string) => void;
  createGroup: (input: NewGroupInput) => string;
  updateGroup: (groupId: string, updates: Partial<GroupEdits>) => void;
  markRead: (groupId: string) => void;
  deleteGroup: (groupId: string) => void;
};

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'group'
  );
}

const initialJoined: Record<string, boolean> = Object.fromEntries(
  GROUPS.map((g) => [g.id, g.joined])
);

export const useGroupsStore = create<GroupsState>((set, get) => ({
  groups: GROUPS,
  joined: initialJoined,

  toggle: (groupId) =>
    set((s) => ({ joined: { ...s.joined, [groupId]: !s.joined[groupId] } })),

  createGroup: (input) => {
    const id = `${slugify(input.name)}-${Math.random().toString(36).slice(2, 7)}`;
    const group: Group = {
      id,
      name: input.name,
      description: input.description,
      memberCount: 0,
      tone: input.tone,
      unread: 0,
      kind: 'circle',
      memberIds: [],
      joined: true,
      createdBy: ME.id,
    };
    set((s) => ({
      groups: [group, ...s.groups],
      joined: { ...s.joined, [id]: true },
    }));
    return id;
  },

  updateGroup: (groupId, updates) =>
    set((s) => ({
      groups: s.groups.map((g) => (g.id === groupId ? { ...g, ...updates } : g)),
    })),

  markRead: (groupId) =>
    set((s) => ({
      groups: s.groups.map((g) => (g.id === groupId ? { ...g, unread: 0 } : g)),
    })),

  deleteGroup: (groupId) =>
    set((s) => ({ groups: s.groups.filter((g) => g.id !== groupId) })),
}));

export function getGroup(groupId: string): Group | undefined {
  return useGroupsStore.getState().groups.find((g) => g.id === groupId);
}

// group.memberCount is the baseline count of members *not including* the
// current user (ME). Effective totals fold in ME's own membership on top.
export function getEffectiveMemberCount(groupId: string, joined: boolean) {
  const group = getGroup(groupId);
  if (!group) return 0;
  return group.memberCount + (joined ? 1 : 0);
}

export function memberCountLabel(groupId: string, joined: boolean) {
  const count = getEffectiveMemberCount(groupId, joined);
  return `${count} member${count === 1 ? '' : 's'}`;
}
