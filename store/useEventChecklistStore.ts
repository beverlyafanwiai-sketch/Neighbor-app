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

export function checklistItemKey(eventId: string, index: number) {
  return `${eventId}:${index}`;
}
