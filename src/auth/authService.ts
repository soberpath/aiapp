import { supabase } from '../config/supabase';
import type { AuthUser, UserRole } from '../types';
import type { Session, User } from '@supabase/supabase-js';

// ─── Session ──────────────────────────────────────────────────────────────────

/**
 * Returns the current active session, or null if not signed in.
 */
export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Returns the currently authenticated Supabase user, or null.
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

/**
 * Returns the full AuthUser profile (including role and clientId) for the
 * currently signed-in user, or null if not authenticated.
 */
export async function getAuthProfile(): Promise<AuthUser | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return fetchProfile(user.id);
}

// ─── Sign In / Sign Up ────────────────────────────────────────────────────────

export interface SignInResult {
  user: AuthUser | null;
  error: string | null;
}

/**
 * Sign in with email + password.
 * Works for both consultants and clients — role is read from the profile.
 */
export async function signInWithEmail(email: string, password: string): Promise<SignInResult> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return { user: null, error: error?.message ?? 'Sign in failed' };
  }
  const profile = await fetchProfile(data.user.id);
  return { user: profile, error: null };
}

/**
 * Sign up a new client account.
 * Called when a service request is accepted and the consultant invites the client.
 * The profile row (with role = 'client') is inserted via the Supabase trigger
 * defined in schema.sql — clientId is linked here.
 */
export async function signUpClient(
  email: string,
  password: string,
  displayName: string,
  clientId: string,
): Promise<SignInResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        role: 'client' as UserRole,
        client_id: clientId,
      },
    },
  });
  if (error || !data.user) {
    return { user: null, error: error?.message ?? 'Sign up failed' };
  }
  const profile = await fetchProfile(data.user.id);
  return { user: profile, error: null };
}

/**
 * Sign out the current user.
 */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

// ─── Password Reset ───────────────────────────────────────────────────────────

/**
 * Send a password reset email. Works for both roles.
 */
export async function sendPasswordReset(email: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://nextlogicai.com/reset-password', // update to your actual domain
  });
  return { error: error?.message ?? null };
}

// ─── Auth State Listener ──────────────────────────────────────────────────────

/**
 * Subscribe to auth state changes (sign in, sign out, token refresh).
 * Returns an unsubscribe function — call it on component unmount.
 *
 * Usage:
 *   const unsub = onAuthStateChange((user) => setCurrentUser(user));
 *   return () => unsub();
 */
export function onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!session?.user) {
      callback(null);
      return;
    }
    const profile = await fetchProfile(session.user.id);
    callback(profile);
  });
  return () => data.subscription.unsubscribe();
}

// ─── Profile Helpers ──────────────────────────────────────────────────────────

/**
 * Fetch the profiles row for a given Supabase user ID.
 * Returns null if the profile doesn't exist yet (e.g. during sign-up race).
 */
export async function fetchProfile(userId: string): Promise<AuthUser | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    email: data.email,
    role: data.role as UserRole,
    displayName: data.display_name ?? undefined,
    avatarUrl: data.avatar_url ?? undefined,
    clientId: data.client_id ?? undefined,
    createdAt: data.created_at,
  };
}

/**
 * Update the current user's display name or avatar.
 */
export async function updateProfile(
  userId: string,
  updates: { displayName?: string; avatarUrl?: string },
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: updates.displayName,
      avatar_url: updates.avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
  return { error: error?.message ?? null };
}

// ─── Role Guards ──────────────────────────────────────────────────────────────

/**
 * Returns true if the given AuthUser is the consultant (operator).
 */
export function isConsultant(user: AuthUser | null): boolean {
  return user?.role === 'consultant';
}

/**
 * Returns true if the given AuthUser is a client.
 */
export function isClient(user: AuthUser | null): boolean {
  return user?.role === 'client';
}

/**
 * Throws an error if the user doesn't have the required role.
 * Use this in service functions that should be role-restricted.
 */
export function requireRole(user: AuthUser | null, role: UserRole): void {
  if (!user) throw new Error('Not authenticated');
  if (user.role !== role) throw new Error(`Access denied: requires role "${role}"`);
}
