import { create } from 'zustand';

import { getUser, ME, REC_ENTRIES, type RecEntry, type RecEntryKind } from '../data/mock';
import { useNotificationsStore } from './useNotificationsStore';
import { useSettingsStore } from './useSettingsStore';

const INBOUND_AGREE_DELAY_MS = 4000;

export type NewRecEntryInput = {
  kind: RecEntryKind;
  emoji: string;
  category: string;
  name?: string;
  note: string;
  imageUris?: string[];
  urgent?: boolean;
};

export type RecDraft = {
  id: string;
  kind: RecEntryKind;
  emoji: string;
  category: string;
  name?: string;
  note: string;
  imageUris?: string[];
  urgent?: boolean;
  updatedAt: number;
};

type RecDraftInput = Omit<RecDraft, 'updatedAt' | 'id'> & { id?: string };

type RecsState = {
  entries: RecEntry[];
  myAgreed: Record<string, boolean>;
  drafts: RecDraft[];
  pinnedEntryId: string | null;
  createEntry: (input: NewRecEntryInput) => string;
  updateEntry: (entryId: string, updates: Partial<NewRecEntryInput>) => void;
  toggleAgree: (entryId: string) => void;
  deleteEntry: (entryId: string) => void;
  resolveEntry: (entryId: string, note?: string) => void;
  reopenEntry: (entryId: string) => void;
  pinEntry: (entryId: string) => void;
  unpinEntry: () => void;
  saveDraft: (input: RecDraftInput) => string;
  deleteDraft: (id: string) => void;
};

let recDraftSeq = 0;

export const useRecsStore = create<RecsState>((set, get) => ({
  entries: REC_ENTRIES,
  myAgreed: {},
  drafts: [],
  pinnedEntryId: null,

  createEntry: (input) => {
    const id = `${input.kind}-${Math.random().toString(36).slice(2, 9)}`;
    const entry: RecEntry = {
      id,
      authorId: ME.id,
      kind: input.kind,
      emoji: input.emoji,
      category: input.category,
      name: input.name,
      note: input.note,
      imageUris: input.imageUris,
      urgent: input.kind === 'ask' ? input.urgent : undefined,
    };
    set((s) => ({ entries: [entry, ...s.entries] }));

    setTimeout(() => {
      const current = get().entries.find((e) => e.id === id);
      if (!current) return;

      const neighbor = getUser(['maya', 'theo', 'priya', 'sam', 'nia'].find((uid) => uid !== ME.id)!);
      if (!neighbor) return;

      set((s) => ({
        entries: s.entries.map((e) =>
          e.id === id ? { ...e, agreedByIds: [...(e.agreedByIds ?? []), neighbor.id] } : e
        ),
      }));

      if (useSettingsStore.getState().notificationPrefs.recsActivity) {
        useNotificationsStore.getState().addNotification({
          type: 'rec',
          actorId: neighbor.id,
          text:
            current.kind === 'rec'
              ? `${neighbor.name} also recommends ${current.name ?? current.category}`
              : `${neighbor.name} said they have a recommendation for you`,
          time: 'Just now',
          target: { kind: 'rec', id },
        });
      }
    }, INBOUND_AGREE_DELAY_MS);

    return id;
  },

  updateEntry: (entryId, updates) =>
    set((s) => ({
      entries: s.entries.map((e) => (e.id === entryId ? { ...e, ...updates } : e)),
    })),

  toggleAgree: (entryId) =>
    set((s) => ({ myAgreed: { ...s.myAgreed, [entryId]: !s.myAgreed[entryId] } })),

  deleteEntry: (entryId) =>
    set((s) => ({
      entries: s.entries.filter((e) => e.id !== entryId),
      pinnedEntryId: s.pinnedEntryId === entryId ? null : s.pinnedEntryId,
    })),

  pinEntry: (entryId) => set({ pinnedEntryId: entryId }),

  unpinEntry: () => set({ pinnedEntryId: null }),

  resolveEntry: (entryId, note) =>
    set((s) => ({
      entries: s.entries.map((e) =>
        e.id === entryId ? { ...e, resolved: true, resolvedNote: note?.trim() || undefined } : e
      ),
    })),

  reopenEntry: (entryId) =>
    set((s) => ({
      entries: s.entries.map((e) =>
        e.id === entryId ? { ...e, resolved: false, resolvedNote: undefined } : e
      ),
    })),

  saveDraft: (input) => {
    const draftId = input.id ?? `rec-draft-${++recDraftSeq}`;
    const updatedAt = Date.now();
    set((s) => {
      const draft: RecDraft = { ...input, id: draftId, updatedAt };
      const exists = s.drafts.some((d) => d.id === draftId);
      return {
        drafts: exists
          ? s.drafts.map((d) => (d.id === draftId ? draft : d))
          : [draft, ...s.drafts],
      };
    });
    return draftId;
  },

  deleteDraft: (id) => set((s) => ({ drafts: s.drafts.filter((d) => d.id !== id) })),
}));

// entry.agreedByIds is the baseline list of other neighbors *not including*
// ME. Effective totals/ids fold in ME's own agreement/offer on top of that.
export function getEffectiveAgreedIds(entryId: string, agreed: boolean): string[] {
  const entry = useRecsStore.getState().entries.find((e) => e.id === entryId);
  const base = entry?.agreedByIds ?? [];
  return agreed ? [...base, ME.id] : base;
}

export function getEffectiveAgreeCount(entryId: string, agreed: boolean) {
  return getEffectiveAgreedIds(entryId, agreed).length;
}
