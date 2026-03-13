import { create } from 'zustand';
import type { AuthUser } from '../types';
import {
  signInWithEmail,
  signUpClient,
  signOut as supabaseSignOut,
  getAuthProfile,
  onAuthStateChange,
  sendPasswordReset,
  isConsultant,
  isClient,
} from './authService';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;

  // Actions
  initialize: () => () => void;    // returns unsubscribe fn
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, displayName: string, clientId: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  clearError: () => void;

  // Role helpers (convenience)
  isConsultant: () => boolean;
  isClient: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  initialized: false,
  error: null,

  /**
   * Call this once in your root layout (_layout.tsx).
   * Restores the existing session and subscribes to future auth changes.
   * Returns an unsubscribe function to clean up the listener.
   */
  initialize: () => {
    // Restore existing session immediately
    getAuthProfile().then(user => {
      set({ user, initialized: true });
    });

    // Subscribe to future changes (sign in, sign out, token refresh)
    const unsubscribe = onAuthStateChange(user => {
      set({ user, initialized: true });
    });

    return unsubscribe;
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    const { user, error } = await signInWithEmail(email, password);
    if (error) {
      set({ loading: false, error });
      return false;
    }
    set({ loading: false, user });
    return true;
  },

  signUp: async (email, password, displayName, clientId) => {
    set({ loading: true, error: null });
    const { user, error } = await signUpClient(email, password, displayName, clientId);
    if (error) {
      set({ loading: false, error });
      return false;
    }
    set({ loading: false, user });
    return true;
  },

  signOut: async () => {
    set({ loading: true });
    await supabaseSignOut();
    set({ loading: false, user: null });
  },

  resetPassword: async (email) => {
    return sendPasswordReset(email);
  },

  clearError: () => set({ error: null }),

  isConsultant: () => isConsultant(get().user),
  isClient: () => isClient(get().user),
}));
