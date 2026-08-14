import { create } from 'zustand';

import { getUser, ME, WELCOME_NOTES, type WelcomeNote } from '../data/mock';
import { useNotificationsStore } from './useNotificationsStore';
import { useSettingsStore } from './useSettingsStore';

const THANKS_DELAY_MS = 2500;

type WelcomeNotesState = {
  notes: WelcomeNote[];
  addNote: (toUserId: string, text: string) => void;
  editNote: (noteId: string, text: string) => void;
  deleteNote: (noteId: string) => void;
};

export const useWelcomeNotesStore = create<WelcomeNotesState>((set) => ({
  notes: WELCOME_NOTES,

  addNote: (toUserId, text) => {
    const note: WelcomeNote = {
      id: `w-${Date.now()}`,
      toUserId,
      fromUserId: ME.id,
      text,
    };
    set((s) => ({ notes: [...s.notes, note] }));

    setTimeout(() => {
      const neighbor = getUser(toUserId);
      if (!neighbor) return;
      if (useSettingsStore.getState().notificationPrefs.welcomeNotes) {
        useNotificationsStore.getState().addNotification({
          type: 'welcome',
          actorId: neighbor.id,
          text: `${neighbor.name} said thanks for the welcome!`,
          time: 'Just now',
          target: { kind: 'profile', id: neighbor.id },
        });
      }
    }, THANKS_DELAY_MS);
  },

  editNote: (noteId, text) => {
    const clean = text.trim();
    if (!clean) return;
    set((s) => ({
      notes: s.notes.map((n) => (n.id === noteId ? { ...n, text: clean, edited: true } : n)),
    }));
  },

  deleteNote: (noteId) =>
    set((s) => ({ notes: s.notes.filter((n) => n.id !== noteId) })),
}));

export function getWelcomeNotes(userId: string, notes: WelcomeNote[]) {
  return notes.filter((n) => n.toUserId === userId);
}
