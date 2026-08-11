import { create } from 'zustand';

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
  initializing: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

const MOCK_AUTH_DELAY_MS = 500;

function validate(email: string, password: string): string | null {
  if (!email.trim() || !password) return 'Enter an email and password.';
  if (!email.includes('@')) return 'Enter a valid email address.';
  if (password.length < 6) return 'Password must be at least 6 characters.';
  return null;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
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
    set({ session: { user }, user });
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
    set({ session: { user }, user });
    return true;
  },

  signOut: async () => {
    set({ session: null, user: null });
  },

  clearError: () => set({ error: null }),
}));

export function initAuthListener() {
  // No remote session to hydrate — the mock store starts signed out.
}
