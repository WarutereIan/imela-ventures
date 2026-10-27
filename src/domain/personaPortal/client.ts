import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * A separate Supabase client for Persona sessions.
 *
 * - Its session never touches localStorage. By default it lives only in this
 *   page's memory, so closing or refreshing the tab signs the person out.
 * - If the person chooses "stay signed in while this tab is open", the
 *   session is kept in sessionStorage, which the browser clears when the tab
 *   closes.
 * - It uses its own storage key, so it can never pick up a staff session
 *   (or vice versa) on a shared computer.
 */
const memory = new Map<string, string>();
let mode: 'memory' | 'tab' = 'memory';

const storage = {
  getItem(key: string): string | null {
    if (mode === 'tab') {
      try {
        return sessionStorage.getItem(key);
      } catch {
        return memory.get(key) ?? null;
      }
    }
    return memory.get(key) ?? null;
  },
  setItem(key: string, value: string) {
    if (mode === 'tab') {
      try {
        sessionStorage.setItem(key, value);
        return;
      } catch {
        /* fall through to memory */
      }
    }
    memory.set(key, value);
  },
  removeItem(key: string) {
    memory.delete(key);
    try {
      sessionStorage.removeItem(key);
    } catch {
      /* storage unavailable */
    }
  },
};

export const PERSONA_STORAGE_KEY = 'imela-persona-session';

// If a tab-scoped session exists (same tab, after a refresh), resume it.
try {
  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(PERSONA_STORAGE_KEY)) mode = 'tab';
} catch {
  mode = 'memory';
}

export function setPersonaSessionMode(next: 'memory' | 'tab') {
  mode = next;
}

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || 'http://localhost';
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || 'public-anon-key-missing';

export const personaClient: SupabaseClient = createClient(url, key, {
  auth: {
    storageKey: PERSONA_STORAGE_KEY,
    storage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

/** Clears every trace of the Persona session from this browser. */
export function clearPersonaSessionStorage() {
  storage.removeItem(PERSONA_STORAGE_KEY);
  memory.clear();
  mode = 'memory';
}
