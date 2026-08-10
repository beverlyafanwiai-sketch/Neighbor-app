import { create } from 'zustand';

import { GROUPS, getGroup } from '../data/mock';

type GroupsState = {
  joined: Record<string, boolean>;
  toggle: (groupId: string) => void;
};

const initialJoined: Record<string, boolean> = Object.fromEntries(
  GROUPS.map((g) => [g.id, g.joined])
);

export const useGroupsStore = create<GroupsState>((set) => ({
  joined: initialJoined,

  toggle: (groupId) =>
    set((s) => ({ joined: { ...s.joined, [groupId]: !s.joined[groupId] } })),
}));

// group.memberCount is the baseline count of members *not including* the
// current user (ME). Effective totals fold in ME's own membership on top.
export function getEffectiveMemberCount(groupId: string, joined: boolean) {
  const group = getGroup(groupId);
  if (!group) return 0;
  return group.memberCount + (joined ? 1 : 0);
}
