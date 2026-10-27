// send-booking-notification
//
// Notifies Imela's admin inbox that a new booking request arrived.
//
// Called by the public website right after inserting a booking, with the
// legacy body { bookingId, customerName, email, phone, service, date, time }.
// Only `bookingId` is trusted: the booking is re-loaded with the service role
// and an e-mail is sent only if it is a *pending* booking created in the last
// 10 minutes. This stops the function being abused as an open mail relay and
// prevents spoofed details reaching the inbox.
//
// The client's free-text message is deliberately NOT included in the e-mail;
// staff read it in the authenticated admin dashboard.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.1';
import { escapeHtml, formatDate, isUuid, json, preflight, readJson, sendEmail } from '../_shared/http.ts';

const FRESHNESS_MS = 10 * 60 * 1000;
// Best-effort duplicate suppression within one warm instance.
const recentlyNotified = new Set<string>();

Deno.serve(async (req) => {
  const early = preflight(req);
  if (early) return early;

  let bookingId: unknown;
  try {
    const body = (await readJson(req, 8_000)) as Record<string, unknown>;
    bookingId = body?.bookingId;
  } catch {
    return json({ error: 'invalid_body' }, 400);
  }
  if (!isUuid(bookingId)) return json({ error: 'invalid_booking_id' }, 400);
  if (recentlyNotified.has(bookingId)) return json({ success: true, duplicate: true });

  const admin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
    auth: { persistSession: false },
  });

  const { data: booking, error } = await admin
    .from('sessions')
    .select('id, customer_name, email, phone, service, date, time, status, created_at')
    .eq('id', bookingId)
    .maybeSingle();

  if (error) {
    console.error('booking_lookup_failed', error.code);
    return json({ error: 'lookup_failed' }, 500);
  }
  // Same response for "missing" and "not eligible" so callers learn nothing.
  const createdAt = booking?.created_at ? new Date(booking.created_at).getTime() : 0;
  if (!booking || booking.status !== 'pending' || Date.now() - createdAt > FRESHNESS_MS) {
    return json({ error: 'not_eligible' }, 404);
  }

  const { data: settings } = await admin
    .from('settings')
    .select('key, value')
    .in('key', ['notification_email', 'notifications_enabled']);

  const settingValue = (key: string) => settings?.find((s: { key: string }) => s.key === key)?.value as string | undefined;
  if (settingValue('notifications_enabled') === 'false') {
    return json({ success: true, skipped: 'notifications_disabled' });
  }
  const adminEmail = settingValue('notification_email') || Deno.env.get('ADMIN_NOTIFICATION_EMAIL');
  if (!adminEmail) return json({ error: 'no_notification_address' }, 503);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #403C38;">
      <h2 style="margin-bottom: 4px;">New booking request</h2>
      <p>A booking request was submitted on the website and is awaiting confirmation.</p>
      <table cellpadding="6" style="border-collapse: collapse;">
        <tr><td><strong>Name</strong></td><td>${escapeHtml(booking.customer_name)}</td></tr>
        <tr><td><strong>Email</strong></td><td>${escapeHtml(booking.email)}</td></tr>
        <tr><td><strong>Phone</strong></td><td>${escapeHtml(booking.phone)}</td></tr>
        <tr><td><strong>Service</strong></td><td>${escapeHtml(booking.service)}</td></tr>
        <tr><td><strong>Date</strong></td><td>${escapeHtml(formatDate(booking.date))}</td></tr>
        <tr><td><strong>Time</strong></td><td>${escapeHtml(booking.time)}</td></tr>
      </table>
      <p>Any message from the client is available in the admin dashboard. Please sign in to review and confirm.</p>
    </div>`;

  const result = await sendEmail({ to: [adminEmail], subject: 'New booking request received', html });
  if (!result.ok) {
    return json({ error: result.reason }, result.reason === 'email_not_configured' ? 503 : 502);
  }

  recentlyNotified.add(bookingId);
  return json({ success: true });
});
