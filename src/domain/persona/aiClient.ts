import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { config } from '../../lib/config';
import type { PersonaMessage } from './machine';

/**
 * Optional AI reflections via the `persona-respond` Edge Function. Only used
 * when the feature flag is on AND the person has explicitly consented, and
 * only after the local safety screen has passed. Any failure returns null and
 * Persona continues with its built-in guide.
 */
export const aiReflectionsAvailable = config.personaAiEnabled && isSupabaseConfigured;

export async function requestAiReflection(history: PersonaMessage[], latest: string, timeoutMs = 8000): Promise<string | null> {
  if (!aiReflectionsAvailable) return null;
  const messages = [
    ...history
      .filter((m) => m.kind === 'text' || m.kind === 'ai' || m.kind === 'reflection')
      .slice(-8)
      .map((m) => ({ role: m.from === 'person' ? 'user' : 'assistant', text: m.text.slice(0, 2000) })),
    { role: 'user', text: latest.slice(0, 2000) },
  ];
  try {
    const result = await Promise.race([
      supabase.functions.invoke('persona-respond', { body: { messages, consent: true } }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
    ]);
    if (!result || result.error) return null;
    const reply = (result.data as { reply?: unknown } | null)?.reply;
    return typeof reply === 'string' && reply.trim() ? reply.trim() : null;
  } catch {
    return null;
  }
}
