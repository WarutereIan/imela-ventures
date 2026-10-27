import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True when the public Supabase URL and anon key are present. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn('Supabase URL or anon key is missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

// Only the public anon key is ever used in the browser. Privileged keys live in
// Supabase Edge Function secrets.
export const supabase = createClient(supabaseUrl || 'http://localhost', supabaseAnonKey || 'public-anon-key-missing');

/** PostgREST "function not found" — used to fall back when a migration is not applied yet. */
export function isMissingFunction(error: { code?: string } | null | undefined): boolean {
  return error?.code === 'PGRST202' || error?.code === '42883';
}
