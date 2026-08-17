import { create } from 'zustand';

type EventChecklistState = {
  checked: Record<string, boolean>;
  toggle: (key: string) => void;
};

export const useEventChecklistStore = create<EventChecklistState>((set) => ({
  checked: {},

  toggle: (key) => set((s) => ({ checked: { ...s.checked, [key]: !s.checked[key] } })),
}));

export function checklistItemKey(eventId: string, index: number) {
  return `${eventId}:${index}`;
}
