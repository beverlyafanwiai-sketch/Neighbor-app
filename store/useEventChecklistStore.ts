import { create } from 'zustand';

type EventChecklistState = {
  checked: Record<string, boolean>;
  notes: Record<string, string>;
  toggle: (key: string) => void;
  setNote: (key: string, note: string) => void;
};

export const useEventChecklistStore = create<EventChecklistState>((set) => ({
  checked: {},
  notes: {},

  toggle: (key) => set((s) => ({ checked: { ...s.checked, [key]: !s.checked[key] } })),

  setNote: (key, note) => set((s) => ({ notes: { ...s.notes, [key]: note.trim() } })),
}));

// Keyed by item text rather than index — if the host reorders or removes
// an earlier item, index-based keys would silently reattach someone's
// checked state and note to a different item.
export function checklistItemKey(eventId: string, itemText: string) {
  return `${eventId}:${itemText}`;
}
