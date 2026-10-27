import React, { useCallback, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from './supabase';
import { config } from './config';

export type Role = 'admin' | 'practitioner' | 'org_admin' | 'client';

export interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
}

/** Friendly wording for auth errors — never echo raw server details. */
function friendlyAuthError(message: string | undefined): string {
  const m = (message ?? '').toLowerCase();
  if (m.includes('invalid login')) return 'That email and password don’t match an account.';
  if (m.includes('email not confirmed')) return 'Please confirm your email address first — check your inbox for the link.';
  if (m.includes('already registered')) return 'An account with this email already exists. Try signing in instead.';
  if (m.includes('password')) return 'Please choose a password of at least 8 characters.';
  if (m.includes('fetch') || m.includes('network')) return 'We couldn’t reach the sign-in service. Check your connection and try again.';
  return 'Sign-in didn’t work this time. Please try again.';
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    let active = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active) setSession(data.session ?? null);
      })
      .catch(() => {
        if (active) setSession(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) return { error: 'Sign-in is not configured for this site yet.' };
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      return { error: error ? friendlyAuthError(error.message) : null };
    } catch (e) {
      return { error: friendlyAuthError(e instanceof Error ? e.message : undefined) };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) return { error: 'Accounts are not configured for this site yet.', needsConfirmation: false };
    try {
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
      if (error) return { error: friendlyAuthError(error.message), needsConfirmation: false };
      return { error: null, needsConfirmation: !data.session };
    } catch (e) {
      return { error: friendlyAuthError(e instanceof Error ? e.message : undefined), needsConfirmation: false };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setSession(null);
    }
  }, []);

  return { session, user: session?.user ?? null, loading, signIn, signUp, signOut };
}

export interface RolesState {
  roles: Role[];
  loading: boolean;
  error: string | null;
}

/**
 * Reads the signed-in user's roles from `user_roles` (RLS: a user can read only
 * their own rows). Only runs once the platform migrations are applied.
 *
 * IMPORTANT: roles in the browser are a convenience for showing the right
 * screens. They are NOT access control — every protected table is guarded by
 * row-level security in the database, which is what actually keeps data safe.
 */
export function useRoles(user: User | null): RolesState {
  const [state, setState] = useState<RolesState>({ roles: [], loading: Boolean(user), error: null });

  useEffect(() => {
    if (!user || !config.platformDbReady) {
      setState({ roles: [], loading: false, error: null });
      return;
    }
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setState({ roles: [], loading: false, error: 'We couldn’t check your access right now.' });
        else setState({ roles: ((data ?? []) as { role: Role }[]).map((r) => r.role), loading: false, error: null });
      });
    return () => {
      active = false;
    };
  }, [user]);

  return state;
}

/** Convenience wrapper; the database remains the real gatekeeper (see useRoles). */
export function RequireRole({
  roles,
  role,
  loading,
  denied,
  children,
}: {
  roles: Role[];
  role: Role;
  loading: boolean;
  denied: React.ReactNode;
  children: React.ReactNode;
}) {
  if (loading) return null;
  return <>{roles.includes(role) ? children : denied}</>;
}
