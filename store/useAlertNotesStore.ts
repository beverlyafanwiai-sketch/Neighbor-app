import { create } from 'zustand';

type AlertNotesState = {
  notes: Record<string, string>;
  setNote: (alertId: string, note: string) => void;
};

export const useAlertNotesStore = create<AlertNotesState>((set) => ({
  notes: {},

  setNote: (alertId, note) => set((s) => ({ notes: { ...s.notes, [alertId]: note.trim() } })),
}));
