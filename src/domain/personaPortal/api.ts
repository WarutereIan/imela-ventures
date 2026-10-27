import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { config } from '../../lib/config';
import { normalisePersonaCode, normaliseRecoverySecret, personaLoginEmail } from '../../../supabase/functions/_shared/personaCredentials';
import { clearPersonaSessionStorage, personaClient, setPersonaSessionMode } from './client';
import type { CaseMessage, CaseResource, MyCase, PortalConcern, PreferredSupport, Result } from './types';

/**
 * Persona-side data access. Every call runs as the signed-in Persona and is
 * limited by row-level security to that Persona's own records; nothing here
 * relies on the browser to enforce privacy.
 */

export const portalAvailable = config.personaPortalEnabled && isSupabaseConfigured;

function isNetworkError(error: { message?: string; code?: string } | null | undefined) {
  const m = error?.message?.toLowerCase() ?? '';
  return m.includes('fetch') || m.includes('network') || m.includes('failed to');
}

// --- Identity ---------------------------------------------------------------

export interface NewPersona {
  personaCode: string;
  /** Canonical recovery secret. Shown once; never stored by Imela in plaintext. */
  recoverySecret: string;
}

export async function registerPersona(): Promise<Result<NewPersona, 'unavailable' | 'rate_limited' | 'network' | 'failed'>> {
  if (!portalAvailable) return { ok: false, reason: 'unavailable' };
  try {
    const { data, error } = await supabase.functions.invoke('persona-register', { body: {} });
    if (error) {
      const status = (error as { context?: { status?: number } }).context?.status;
      if (status === 429) return { ok: false, reason: 'rate_limited' };
      if (status === 503) return { ok: false, reason: 'unavailable' };
      return { ok: false, reason: isNetworkError(error) ? 'network' : 'failed' };
    }
    const code = (data as { personaCode?: unknown })?.personaCode;
    const secret = (data as { recoverySecret?: unknown })?.recoverySecret;
    if (typeof code !== 'string' || typeof secret !== 'string') return { ok: false, reason: 'failed' };
    return { ok: true, data: { personaCode: code, recoverySecret: secret } };
  } catch {
    return { ok: false, reason: 'network' };
  }
}

export type SignInError = 'invalid_format' | 'wrong_credentials' | 'rate_limited' | 'network' | 'unavailable' | 'not_a_persona';

export async function signInPersona(codeInput: string, secretInput: string, stayForTab: boolean): Promise<Result<{ personaCode: string }, SignInError>> {
  if (!portalAvailable) return { ok: false, reason: 'unavailable' };
  const code = normalisePersonaCode(codeInput);
  const secret = normaliseRecoverySecret(secretInput);
  if (!code || !secret) return { ok: false, reason: 'invalid_format' };

  setPersonaSessionMode(stayForTab ? 'tab' : 'memory');
  const { error } = await personaClient.auth.signInWithPassword({
    email: personaLoginEmail(code, config.personaLoginDomain),
    password: secret,
  });
  if (error) {
    if (error.status === 429) return { ok: false, reason: 'rate_limited' };
    if (error.status === 400 || error.status === 401) return { ok: false, reason: 'wrong_credentials' };
    return { ok: false, reason: isNetworkError(error) ? 'network' : 'wrong_credentials' };
  }

  // Only Persona identities may use this space.
  const profile = await fetchProfile();
  if (!profile) {
    await signOutPersona();
    return { ok: false, reason: 'not_a_persona' };
  }
  return { ok: true, data: { personaCode: profile.persona_code } };
}

export async function signOutPersona() {
  try {
    await personaClient.auth.signOut({ scope: 'local' });
  } finally {
    clearPersonaSessionStorage();
  }
}

async function fetchProfile(): Promise<{ persona_code: string } | null> {
  const { data } = await personaClient.from('persona_profiles').select('persona_code').maybeSingle();
  return data ?? null;
}

export type PersonaSessionState =
  | { status: 'loading' }
  | { status: 'signed_out' }
  | { status: 'signed_in'; personaCode: string; userId: string };

/** Tracks the Persona session for the portal screens. */
export function usePersonaSession(): PersonaSessionState {
  const [state, setState] = useState<PersonaSessionState>({ status: portalAvailable ? 'loading' : 'signed_out' });

  useEffect(() => {
    if (!portalAvailable) return;
    let cancelled = false;

    const resolve = async (session: Session | null) => {
      if (!session) {
        if (!cancelled) setState({ status: 'signed_out' });
        return;
      }
      const profile = await fetchProfile();
      if (cancelled) return;
      setState(profile ? { status: 'signed_in', personaCode: profile.persona_code, userId: session.user.id } : { status: 'signed_out' });
    };

    personaClient.auth.getSession().then(({ data }) => resolve(data.session));
    const { data: sub } = personaClient.auth.onAuthStateChange((_event, session) => {
      void resolve(session);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

// --- Cases --------------------------------------------------------------------

export async function listMyCases(): Promise<Result<MyCase[]>> {
  const { data, error } = await personaClient.from('persona_my_cases').select('*').order('updated_at', { ascending: false });
  if (error) return { ok: false, reason: isNetworkError(error) ? 'network' : 'failed' };
  return { ok: true, data: (data ?? []) as MyCase[] };
}

export async function getMyCase(id: string): Promise<Result<MyCase, 'not_found' | 'network' | 'failed'>> {
  const { data, error } = await personaClient.from('persona_my_cases').select('*').eq('id', id).maybeSingle();
  if (error) return { ok: false, reason: isNetworkError(error) ? 'network' : 'failed' };
  if (!data) return { ok: false, reason: 'not_found' };
  return { ok: true, data: data as MyCase };
}

export const STORY_LIMIT = 6000;
export const MESSAGE_LIMIT = 5000;

export async function createCase(input: {
  concerns: PortalConcern[];
  story: string;
  preferredSupport: PreferredSupport;
}): Promise<Result<{ id: string }, 'invalid' | 'limit' | 'network' | 'failed'>> {
  if (input.concerns.length === 0 || input.story.length > STORY_LIMIT) return { ok: false, reason: 'invalid' };
  // The id is generated here because Personas cannot read the base table back.
  const id = crypto.randomUUID();
  const { error } = await personaClient.from('persona_cases').insert({
    id,
    concerns: input.concerns,
    story: input.story.trim() || null,
    preferred_support: input.preferredSupport,
  });
  if (error) {
    if (error.code === 'P0001') return { ok: false, reason: 'limit', message: error.message };
    return { ok: false, reason: isNetworkError(error) ? 'network' : 'failed' };
  }
  return { ok: true, data: { id } };
}

export async function closeMyCase(id: string): Promise<Result<null>> {
  const { error } = await personaClient.rpc('persona_close_case', { p_case: id });
  if (error) return { ok: false, reason: isNetworkError(error) ? 'network' : 'failed' };
  return { ok: true, data: null };
}

// --- Messages & resources -------------------------------------------------------

export async function listMessages(caseId: string): Promise<Result<CaseMessage[]>> {
  const { data, error } = await personaClient
    .from('persona_messages')
    .select('id, sender_role, body, created_at')
    .eq('case_id', caseId)
    .order('created_at', { ascending: true });
  if (error) return { ok: false, reason: isNetworkError(error) ? 'network' : 'failed' };
  return { ok: true, data: (data ?? []) as CaseMessage[] };
}

export async function sendMessage(caseId: string, body: string, userId: string): Promise<Result<null, 'invalid' | 'limit' | 'closed' | 'network' | 'failed'>> {
  const text = body.trim();
  if (!text || text.length > MESSAGE_LIMIT) return { ok: false, reason: 'invalid' };
  const { error } = await personaClient.from('persona_messages').insert({ case_id: caseId, sender_role: 'persona', sender_id: userId, body: text });
  if (error) {
    if (error.code === 'P0001') return { ok: false, reason: 'limit', message: error.message };
    if (error.code === '42501') return { ok: false, reason: 'closed' };
    return { ok: false, reason: isNetworkError(error) ? 'network' : 'failed' };
  }
  return { ok: true, data: null };
}

export async function listCaseResources(caseId: string): Promise<Result<CaseResource[]>> {
  const { data, error } = await personaClient
    .from('persona_case_resources')
    .select('id, title, url, note, created_at')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false });
  if (error) return { ok: false, reason: isNetworkError(error) ? 'network' : 'failed' };
  return { ok: true, data: (data ?? []) as CaseResource[] };
}

// --- Account --------------------------------------------------------------------

/** Issues a new recovery secret and signs out every session. Shown once. */
export async function rotateRecoverySecret(): Promise<Result<{ recoverySecret: string }>> {
  const { data, error } = await personaClient.functions.invoke('persona-account', { body: { action: 'rotate' } });
  const secret = (data as { recoverySecret?: unknown } | null)?.recoverySecret;
  if (error || typeof secret !== 'string') return { ok: false, reason: 'failed' };
  await signOutPersona();
  return { ok: true, data: { recoverySecret: secret } };
}

/** Permanently deletes this Persona and every case, message and resource linked to it. */
export async function deletePersona(): Promise<Result<null>> {
  const { error } = await personaClient.functions.invoke('persona-account', { body: { action: 'delete' } });
  if (error) return { ok: false, reason: 'failed' };
  await signOutPersona();
  return { ok: true, data: null };
}
