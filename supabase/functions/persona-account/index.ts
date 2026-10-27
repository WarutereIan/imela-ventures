// persona-account
//
// Account actions for a signed-in Persona. Deploy WITH JWT verification.
//
// Contract
//   POST { action: 'rotate' }  → 200 { recoverySecret }  (Cache-Control: no-store)
//        Issues a new recovery secret, replaces the old one, and signs the
//        Persona out everywhere. The new secret is shown once.
//   POST { action: 'delete' }  → 200 { deleted: true }
//        Permanently deletes the Persona login. Cases, messages, notes and
//        assigned resources are removed with it (ON DELETE CASCADE).
//   401 not signed in · 403 not a Persona · 400 bad request · 500 failed
//
// Only Persona identities may use this function; staff accounts are refused.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.1';
import { NO_STORE, clientIp, createRateLimiter, json, preflight, readJson } from '../_shared/http.ts';
import { generateRecoverySecret } from '../_shared/personaCredentials.ts';

const perIp = createRateLimiter(20, 60 * 60 * 1000);

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) return json({ error: 'not_configured' }, 503);

  if (perIp(clientIp(req))) return json({ error: 'rate_limited' }, 429);

  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) return json({ error: 'unauthorised' }, 401);

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  const userId = userData?.user?.id;
  if (userError || !userId) return json({ error: 'unauthorised' }, 401);

  const { data: profile, error: profileError } = await admin.from('persona_profiles').select('user_id').eq('user_id', userId).maybeSingle();
  if (profileError) {
    console.error('persona_account_profile_lookup_failed', profileError.code ?? 'unknown');
    return json({ error: 'failed' }, 500);
  }
  if (!profile) return json({ error: 'forbidden' }, 403);

  let action: unknown;
  try {
    action = ((await readJson(req, 2_000)) as Record<string, unknown>)?.action;
  } catch {
    return json({ error: 'invalid_body' }, 400);
  }

  if (action === 'rotate') {
    const recoverySecret = generateRecoverySecret();
    const { error } = await admin.auth.admin.updateUserById(userId, { password: recoverySecret });
    if (error) {
      console.error('persona_account_rotate_failed', (error as { status?: number }).status ?? 'unknown');
      return json({ error: 'failed' }, 500);
    }
    // End every existing session, including other devices that might know the old secret.
    const { error: signOutError } = await admin.auth.admin.signOut(token, 'global');
    if (signOutError) console.error('persona_account_signout_failed', (signOutError as { status?: number }).status ?? 'unknown');
    return json({ recoverySecret }, 200, NO_STORE);
  }

  if (action === 'delete') {
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) {
      console.error('persona_account_delete_failed', (error as { status?: number }).status ?? 'unknown');
      return json({ error: 'failed' }, 500);
    }
    return json({ deleted: true }, 200, NO_STORE);
  }

  return json({ error: 'invalid_action' }, 400);
});
