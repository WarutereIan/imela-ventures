// persona-register
//
// Creates a pseudonymous Persona for the anonymous counselling portal.
//
// Contract
//   POST {}  (no session; deploy with --no-verify-jwt)
//   201 { personaCode, recoverySecret }   Cache-Control: no-store
//   429 { error: 'rate_limited' } · 503 { error: 'not_configured' } · 500 { error: 'failed' }
//
// What happens
//   1. A Persona ID and a 150-bit recovery secret are generated here, on the
//      server, with Web Crypto (see _shared/personaCredentials.ts).
//   2. A Supabase Auth user is created with the service role:
//        email    = <persona-id>@<PERSONA_LOGIN_DOMAIN>   (synthetic, undeliverable)
//        password = the recovery secret                   (stored only as a hash)
//      The user is pre-confirmed, so no email is ever sent and public sign-ups
//      can stay disabled in the dashboard.
//   3. A persona_profiles row links the auth user to the Persona ID.
//   The secret is returned exactly once and never logged or stored in
//   plaintext. Nobody at Imela can look it up afterwards.
//
// Abuse controls
//   - Best-effort per-IP limit (PERSONA_REGISTRATIONS_PER_IP_HOUR, default 5).
//   - Global ceiling across all instances, checked in the database
//     (PERSONA_MAX_REGISTRATIONS_PER_HOUR, default 200).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.1';
import { NO_STORE, clientIp, createRateLimiter, json, preflight } from '../_shared/http.ts';
import { generatePersonaCode, generateRecoverySecret, personaLoginEmail } from '../_shared/personaCredentials.ts';

const perIp = createRateLimiter(Number(Deno.env.get('PERSONA_REGISTRATIONS_PER_IP_HOUR') ?? 5), 60 * 60 * 1000);
const GLOBAL_PER_HOUR = Number(Deno.env.get('PERSONA_MAX_REGISTRATIONS_PER_HOUR') ?? 200);
const MAX_ATTEMPTS = 5;

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const domain = Deno.env.get('PERSONA_LOGIN_DOMAIN');
  if (!url || !serviceKey || !domain) return json({ error: 'not_configured' }, 503);

  if (perIp(clientIp(req))) return json({ error: 'rate_limited' }, 429);

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await admin
    .from('persona_profiles')
    .select('user_id', { count: 'exact', head: true })
    .gt('created_at', since);
  if (countError) {
    console.error('persona_register_count_failed', countError.code ?? 'unknown');
    return json({ error: 'failed' }, 500);
  }
  if ((count ?? 0) >= GLOBAL_PER_HOUR) return json({ error: 'rate_limited' }, 429);

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const personaCode = generatePersonaCode();
    const recoverySecret = generateRecoverySecret();

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: personaLoginEmail(personaCode, domain),
      password: recoverySecret,
      email_confirm: true,
      app_metadata: { persona: true },
      user_metadata: {},
    });

    if (createError || !created?.user) {
      // A clash with an existing login means the generated ID is taken: try another.
      const status = (createError as { status?: number } | null)?.status;
      const code = (createError as { code?: string } | null)?.code ?? '';
      if (/already|exists/i.test(`${code} ${createError?.message ?? ''}`)) continue;
      // e.g. email_address_invalid: PERSONA_LOGIN_DOMAIN was rejected by Supabase Auth.
      console.error('persona_register_create_failed', status ?? 'unknown', code || 'no_code');
      return json({ error: 'failed' }, 500);
    }

    const userId = created.user.id;
    const { error: profileError } = await admin.from('persona_profiles').insert({ user_id: userId, persona_code: personaCode });
    if (profileError) {
      // Never leave an auth user without its profile.
      await admin.auth.admin.deleteUser(userId).catch(() => undefined);
      if (profileError.code === '23505') continue; // Persona ID collision
      console.error('persona_register_profile_failed', profileError.code ?? 'unknown');
      return json({ error: 'failed' }, 500);
    }

    return json({ personaCode, recoverySecret }, 201, NO_STORE);
  }

  console.error('persona_register_exhausted_attempts');
  return json({ error: 'failed' }, 500);
});
