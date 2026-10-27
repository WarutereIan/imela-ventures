// send-booking-confirmation
//
// Sends the client a confirmation e-mail for a booking an admin has confirmed.
//
// Security
//   - Caller must be signed in AND hold the `admin` role (checked server-side
//     through public.has_role with the caller's own JWT).
//   - Only `bookingId` is read from the request. Recipient, date and time are
//     loaded from the database, so the function cannot be used to e-mail
//     arbitrary addresses or content.
//   - The subject line is neutral and reveals nothing about counselling.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.1';
import { escapeHtml, formatDate, isUuid, json, preflight, readJson, sendEmail } from '../_shared/http.ts';

const PHONE_DISPLAY = Deno.env.get('IMELA_PHONE_DISPLAY') ?? '+254 721 803 569';

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) return json({ error: 'unauthorised' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const caller = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  const { data: userData, error: userError } = await caller.auth.getUser();
  if (userError || !userData?.user) return json({ error: 'unauthorised' }, 401);

  const { data: isAdmin, error: roleError } = await caller.rpc('has_role', { p_role: 'admin' });
  if (roleError || isAdmin !== true) return json({ error: 'forbidden' }, 403);

  let bookingId: unknown;
  try {
    const body = (await readJson(req, 8_000)) as Record<string, unknown>;
    bookingId = body?.bookingId;
  } catch {
    return json({ error: 'invalid_body' }, 400);
  }
  if (!isUuid(bookingId)) return json({ error: 'invalid_booking_id' }, 400);

  const service = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
    auth: { persistSession: false },
  });
  const { data: booking, error } = await service
    .from('sessions')
    .select('id, customer_name, email, date, time, status')
    .eq('id', bookingId)
    .maybeSingle();

  if (error) {
    console.error('booking_lookup_failed', error.code);
    return json({ error: 'lookup_failed' }, 500);
  }
  if (!booking) return json({ error: 'not_found' }, 404);
  if (booking.status !== 'confirmed') return json({ error: 'booking_not_confirmed' }, 409);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #403C38;">
      <p>Dear ${escapeHtml(booking.customer_name)},</p>
      <p>Your appointment with Imela Ventures is confirmed.</p>
      <div style="background-color: #F6F0E7; padding: 16px 20px; border-radius: 12px; margin: 20px 0;">
        <p style="margin: 0 0 6px;"><strong>Date:</strong> ${escapeHtml(formatDate(booking.date))}</p>
        <p style="margin: 0;"><strong>Time:</strong> ${escapeHtml(booking.time)} (East Africa Time)</p>
      </div>
      <p>If you need to reschedule or cancel, please let us know at least 24 hours in advance by replying to this e-mail or calling ${escapeHtml(PHONE_DISPLAY)}.</p>
      <p>If you are ever in immediate danger, please call 999 or 112.</p>
      <p>Warm regards,<br />The Imela Ventures team</p>
    </div>`;

  const result = await sendEmail({ to: [booking.email], subject: 'Your Imela appointment', html });
  if (!result.ok) {
    return json({ error: result.reason }, result.reason === 'email_not_configured' ? 503 : 502);
  }

  // Best-effort audit trail; failure to log does not undo a sent e-mail.
  await caller.rpc('log_audit', {
    p_action: 'booking_confirmation_sent',
    p_entity: 'sessions',
    p_entity_id: booking.id,
    p_metadata: {},
  });

  return json({ success: true });
});
