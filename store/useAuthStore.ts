import type { Session, User } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '../lib/supabase';

type AuthState = {
  session: Session | null;
  user: User | null;
  initializing: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  initializing: true,
  error: null,

  signIn: async (email, password) => {
    set({ error: null });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ error: error.message });
      return false;
    }
    set({ session: data.session, user: data.user });
    return true;
  },

  signUp: async (email, password) => {
    set({ error: null });
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      set({ error: error.message });
      return false;
    }
    set({ session: data.session, user: data.user });
    return true;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },

  clearError: () => set({ error: null }),
}));

let listenerStarted = false;

export function initAuthListener() {
  if (listenerStarted) return;
  listenerStarted = true;

  supabase.auth.getSession().then(({ data }) => {
    useAuthStore.setState({
      session: data.session,
      user: data.session?.user ?? null,
      initializing: false,
    });
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.setState({ session, user: session?.user ?? null, initializing: false });
  });
}
