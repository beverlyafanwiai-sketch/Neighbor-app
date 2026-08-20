import { create } from 'zustand';

import { useProfileStore } from './useProfileStore';

export type MockUser = {
  id: string;
  email: string;
};

export type MockSession = {
  user: MockUser;
};

type AuthState = {
  session: MockSession | null;
  user: MockUser | null;
  // Kept only in memory so "Change password" has something real to check
  // the current password against — never persisted or displayed anywhere.
  password: string | null;
  initializing: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  clearError: () => void;
};

const MOCK_AUTH_DELAY_MS = 500;

function validate(email: string, password: string): string | null {
  if (!email.trim() || !password) return 'Enter an email and password.';
  if (!email.includes('@')) return 'Enter a valid email address.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  return null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  password: null,
  initializing: false,
  error: null,

  signIn: async (email, password) => {
    set({ error: null });
    const validationError = validate(email, password);
    if (validationError) {
      set({ error: validationError });
      return false;
    }
    await new Promise((resolve) => setTimeout(resolve, MOCK_AUTH_DELAY_MS));
    const user: MockUser = { id: `user-${email.toLowerCase()}`, email };
    set({ session: { user }, user, password });
    return true;
  },

  signUp: async (email, password) => {
    set({ error: null });
    const validationError = validate(email, password);
    if (validationError) {
      set({ error: validationError });
      return false;
    }
    await new Promise((resolve) => setTimeout(resolve, MOCK_AUTH_DELAY_MS));
    const user: MockUser = { id: `user-${email.toLowerCase()}`, email };
    // A new account should start onboarding from a blank profile, not
    // whatever's left in the store from a previous session's seed data.
    useProfileStore.getState().resetProfile();
    set({ session: { user }, user, password });
    return true;
  },

  signOut: async () => {
    set({ session: null, user: null, password: null });
  },

  deleteAccount: async () => {
    await new Promise((resolve) => setTimeout(resolve, MOCK_AUTH_DELAY_MS));
    useProfileStore.getState().resetProfile();
    set({ session: null, user: null, password: null });
  },

  changePassword: async (currentPassword, newPassword) => {
    set({ error: null });
    if (!currentPassword || currentPassword !== get().password) {
      set({ error: 'Current password is incorrect.' });
      return false;
    }
    if (newPassword.length < 6) {
      set({ error: 'New password must be at least 6 characters.' });
      return false;
    }
    await new Promise((resolve) => setTimeout(resolve, MOCK_AUTH_DELAY_MS));
    set({ password: newPassword });
    return true;
  },

  clearError: () => set({ error: null }),
}));

export function initAuthListener() {
  // No remote session to hydrate — the mock store starts signed out.
}
