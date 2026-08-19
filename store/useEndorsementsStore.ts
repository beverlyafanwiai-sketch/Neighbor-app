import { create } from 'zustand';

import { ME } from '../data/mock';

export type Endorsement = {
  skill: string;
  endorserId: string;
  note?: string;
};

type EndorsementsState = {
  endorsements: Record<string, Endorsement[]>;
  addEndorsement: (targetUserId: string, skill: string, note?: string) => void;
  removeEndorsement: (targetUserId: string, skill: string) => void;
  updateEndorsementNote: (targetUserId: string, skill: string, note: string) => void;
};

const SEED: Record<string, Endorsement[]> = {
  theo: [
    { skill: 'Beer brewing', endorserId: 'sam' },
    { skill: 'Beer brewing', endorserId: 'priya' },
    { skill: 'Trail routes', endorserId: 'maya' },
  ],
  amara: [{ skill: 'Pottery', endorserId: 'theo' }],
};

export const useEndorsementsStore = create<EndorsementsState>((set) => ({
  endorsements: SEED,

  addEndorsement: (targetUserId, skill, note) =>
    set((s) => {
      const clean = skill.trim();
      if (!clean) return s;
      const existing = s.endorsements[targetUserId] ?? [];
      const alreadyGiven = existing.some(
        (e) => e.endorserId === ME.id && e.skill.toLowerCase() === clean.toLowerCase()
      );
      if (alreadyGiven) return s;
      return {
        endorsements: {
          ...s.endorsements,
          [targetUserId]: [
            ...existing,
            { skill: clean, endorserId: ME.id, note: note?.trim() || undefined },
          ],
        },
      };
    }),

  removeEndorsement: (targetUserId, skill) =>
    set((s) => ({
      endorsements: {
        ...s.endorsements,
        [targetUserId]: (s.endorsements[targetUserId] ?? []).filter(
          (e) => !(e.endorserId === ME.id && e.skill === skill)
        ),
      },
    })),

  updateEndorsementNote: (targetUserId, skill, note) =>
    set((s) => ({
      endorsements: {
        ...s.endorsements,
        [targetUserId]: (s.endorsements[targetUserId] ?? []).map((e) =>
          e.endorserId === ME.id && e.skill === skill
            ? { ...e, note: note.trim() || undefined }
            : e
        ),
      },
    })),
}));

export type EndorsementGroup = { skill: string; entries: Endorsement[] };

export function getEndorsementGroups(
  targetUserId: string,
  endorsements: Record<string, Endorsement[]>
): EndorsementGroup[] {
  const list = endorsements[targetUserId] ?? [];
  const groups = new Map<string, EndorsementGroup>();
  for (const entry of list) {
    const key = entry.skill.toLowerCase();
    if (!groups.has(key)) groups.set(key, { skill: entry.skill, entries: [] });
    groups.get(key)!.entries.push(entry);
  }
  return Array.from(groups.values()).sort((a, b) => b.entries.length - a.entries.length);
}
