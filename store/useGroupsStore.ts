import { create } from 'zustand';

import { GROUPS, ME, USERS, type Group, type Tone } from '../data/mock';
import { useNotificationsStore } from './useNotificationsStore';
import { useSettingsStore } from './useSettingsStore';

const JOIN_DELAY_MS = 2500;

export type NewGroupInput = {
  name: string;
  description: string;
  tone: Tone;
  coverImageUri?: string;
  privacy: 'public' | 'private';
};

export type GroupEdits = Pick<
  Group,
  'name' | 'description' | 'tone' | 'coverImageUri' | 'privacy'
>;

export type GroupDraft = {
  id: string;
  name: string;
  description: string;
  tone: Tone;
  coverImageUri?: string;
  privacy: 'public' | 'private';
  updatedAt: number;
};

type GroupDraftInput = Omit<GroupDraft, 'updatedAt' | 'id'> & { id?: string };

export type GroupAnnouncement = {
  text: string;
  authorId: string;
  postedAt: number;
};

type GroupsState = {
  groups: Group[];
  joined: Record<string, boolean>;
  inviteCodes: Record<string, string>;
  announcements: Record<string, GroupAnnouncement | undefined>;
  welcomeMessages: Record<string, string | undefined>;
  drafts: GroupDraft[];
  toggle: (groupId: string) => void;
  createGroup: (input: NewGroupInput) => string;
  updateGroup: (groupId: string, updates: Partial<GroupEdits>) => void;
  markRead: (groupId: string) => void;
  deleteGroup: (groupId: string) => void;
  promoteCoAdmin: (groupId: string, userId: string) => void;
  demoteCoAdmin: (groupId: string, userId: string) => void;
  removeMember: (groupId: string, userId: string) => void;
  joinByInviteCode: (code: string) => string | null;
  regenerateInviteCode: (groupId: string) => void;
  transferOwnership: (groupId: string, newOwnerId: string) => void;
  postAnnouncement: (groupId: string, text: string) => void;
  clearAnnouncement: (groupId: string) => void;
  setWelcomeMessage: (groupId: string, text: string) => void;
  clearWelcomeMessage: (groupId: string) => void;
  saveDraft: (input: GroupDraftInput) => string;
  deleteDraft: (id: string) => void;
};

let groupDraftSeq = 0;

function slugify(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'group'
  );
}

const INVITE_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateInviteCode() {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += INVITE_CODE_CHARS[Math.floor(Math.random() * INVITE_CODE_CHARS.length)];
  }
  return code;
}

const initialJoined: Record<string, boolean> = Object.fromEntries(
  GROUPS.map((g) => [g.id, g.joined])
);

const initialInviteCodes: Record<string, string> = Object.fromEntries(
  GROUPS.map((g) => [g.id, generateInviteCode()])
);

export const useGroupsStore = create<GroupsState>((set, get) => ({
  groups: GROUPS,
  joined: initialJoined,
  inviteCodes: initialInviteCodes,
  announcements: {},
  welcomeMessages: {},
  drafts: [],

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
      coverImageUri: input.coverImageUri,
      privacy: input.privacy,
    };
    set((s) => ({
      groups: [group, ...s.groups],
      joined: { ...s.joined, [id]: true },
      inviteCodes: { ...s.inviteCodes, [id]: generateInviteCode() },
    }));

    setTimeout(() => {
      const current = get().groups.find((g) => g.id === id);
      if (!current) return;
      const newMember = USERS.find((u) => !current.memberIds.includes(u.id));
      if (!newMember) return;

      set((s) => ({
        groups: s.groups.map((g) =>
          g.id === id
            ? { ...g, memberIds: [...g.memberIds, newMember.id], memberCount: g.memberCount + 1 }
            : g
        ),
      }));

      if (useSettingsStore.getState().notificationPrefs.groupActivity) {
        useNotificationsStore.getState().addNotification({
          type: 'group',
          actorId: newMember.id,
          text: `${newMember.name} joined ${input.name}`,
          time: 'Just now',
          target: { kind: 'group', id },
        });
      }
    }, JOIN_DELAY_MS);

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

  promoteCoAdmin: (groupId, userId) =>
    set((s) => ({
      groups: s.groups.map((g) =>
        g.id === groupId && !(g.coAdminIds ?? []).includes(userId)
          ? { ...g, coAdminIds: [...(g.coAdminIds ?? []), userId] }
          : g
      ),
    })),

  demoteCoAdmin: (groupId, userId) =>
    set((s) => ({
      groups: s.groups.map((g) =>
        g.id === groupId
          ? { ...g, coAdminIds: (g.coAdminIds ?? []).filter((id) => id !== userId) }
          : g
      ),
    })),

  removeMember: (groupId, userId) =>
    set((s) => ({
      groups: s.groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              memberIds: g.memberIds.filter((id) => id !== userId),
              coAdminIds: (g.coAdminIds ?? []).filter((id) => id !== userId),
              memberCount: Math.max(0, g.memberCount - 1),
            }
          : g
      ),
    })),

  joinByInviteCode: (code) => {
    const clean = code.trim().toUpperCase();
    const { inviteCodes } = get();
    const groupId = Object.keys(inviteCodes).find((gid) => inviteCodes[gid] === clean);
    if (!groupId) return null;
    set((s) => ({ joined: { ...s.joined, [groupId]: true } }));
    return groupId;
  },

  regenerateInviteCode: (groupId) =>
    set((s) => ({ inviteCodes: { ...s.inviteCodes, [groupId]: generateInviteCode() } })),

  transferOwnership: (groupId, newOwnerId) =>
    set((s) => ({
      groups: s.groups.map((g) => {
        if (g.id !== groupId) return g;
        const withoutNewOwner = (g.coAdminIds ?? []).filter((id) => id !== newOwnerId);
        const coAdminIds =
          g.createdBy && !withoutNewOwner.includes(g.createdBy)
            ? [...withoutNewOwner, g.createdBy]
            : withoutNewOwner;
        return { ...g, createdBy: newOwnerId, coAdminIds };
      }),
    })),

  saveDraft: (input) => {
    const draftId = input.id ?? `group-draft-${++groupDraftSeq}`;
    const updatedAt = Date.now();
    set((s) => {
      const draft: GroupDraft = { ...input, id: draftId, updatedAt };
      const exists = s.drafts.some((d) => d.id === draftId);
      return {
        drafts: exists
          ? s.drafts.map((d) => (d.id === draftId ? draft : d))
          : [draft, ...s.drafts],
      };
    });
    return draftId;
  },

  postAnnouncement: (groupId, text) => {
    const clean = text.trim();
    if (!clean) return;
    set((s) => ({
      announcements: {
        ...s.announcements,
        [groupId]: { text: clean, authorId: ME.id, postedAt: Date.now() },
      },
    }));
  },

  clearAnnouncement: (groupId) =>
    set((s) => ({ announcements: { ...s.announcements, [groupId]: undefined } })),

  setWelcomeMessage: (groupId, text) => {
    const clean = text.trim();
    if (!clean) return;
    set((s) => ({ welcomeMessages: { ...s.welcomeMessages, [groupId]: clean } }));
  },

  clearWelcomeMessage: (groupId) =>
    set((s) => ({ welcomeMessages: { ...s.welcomeMessages, [groupId]: undefined } })),

  deleteDraft: (id) => set((s) => ({ drafts: s.drafts.filter((d) => d.id !== id) })),
}));

export function getGroup(groupId: string): Group | undefined {
  return useGroupsStore.getState().groups.find((g) => g.id === groupId);
}

export function isGroupAdmin(group: Group, userId: string): boolean {
  return group.createdBy === userId || (group.coAdminIds ?? []).includes(userId);
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

// Events hosted by a private circle should be as hidden as the circle itself
// — invisible to anyone who hasn't joined, everywhere events are browsed.
export function isEventVisible(
  hostGroupId: string | undefined,
  joinedGroups: Record<string, boolean>
): boolean {
  if (!hostGroupId) return true;
  const group = getGroup(hostGroupId);
  if (!group || group.privacy !== 'private') return true;
  return joinedGroups[hostGroupId] ?? false;
}
