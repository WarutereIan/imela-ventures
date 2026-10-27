/**
 * Feature flags. Everything that depends on the new database migrations
 * (supabase/migrations) stays off until an operator has applied them and set
 * the flag, so the live site never exposes features its database cannot
 * protect.
 */
const flag = (value: string | undefined) => value === 'true';

export const config = {
  /** Set once migrations 0001–0005 are applied (roles, RLS, portal, organisations). */
  platformDbReady: flag(import.meta.env.VITE_PLATFORM_DB_READY),
  /** Allow clients to create accounts for the optional portal. Requires platformDbReady. */
  clientPortalEnabled: flag(import.meta.env.VITE_PLATFORM_DB_READY) && flag(import.meta.env.VITE_ENABLE_CLIENT_PORTAL),
  /**
   * Opt-in AI reflections in Imela Persona via the `persona-respond` Edge
   * Function. Off by default: the built-in engine runs entirely in the browser.
   */
  personaAiEnabled: flag(import.meta.env.VITE_PERSONA_AI_ENABLED),
  /**
   * Anonymous counselling portal (Persona ID + recovery secret). Requires
   * migration 0007 and the persona-register / persona-account Edge Functions.
   */
  personaPortalEnabled: flag(import.meta.env.VITE_PERSONA_PORTAL_ENABLED),
  /** Must match PERSONA_LOGIN_DOMAIN in the Edge Functions. */
  personaLoginDomain: import.meta.env.VITE_PERSONA_LOGIN_DOMAIN || 'persona.imelaventures.invalid',
} as const;
