import { isMissingFunction, isSupabaseConfigured, supabase } from '../../lib/supabase';
import type { Service } from '../../data/types';
import { BOOKING_WINDOW_DAYS, addDays, slotKey } from './slots';
import type { ContactDetails } from './validation';

export interface AvailabilitySnapshot {
  booked: Set<string>;
  closed: Set<string>;
  /**
   * `live`: booked slots came from the database.
   * `unknown`: the availability RPC isn't deployed yet; any time can be
   * requested and the team confirms it. The database still rejects exact
   * double bookings once the unique index migration is applied.
   */
  source: 'live' | 'unknown';
}

export async function fetchAvailability(today: string): Promise<AvailabilitySnapshot> {
  const from = addDays(today, 1);
  const to = addDays(today, BOOKING_WINDOW_DAYS);
  const booked = new Set<string>();
  const closed = new Set<string>();
  if (!isSupabaseConfigured) return { booked, closed, source: 'unknown' };

  const [bookedRes, closedRes] = await Promise.all([
    supabase.rpc('get_booked_slots', { from_date: from, to_date: to }),
    supabase.rpc('get_closed_dates', { from_date: from, to_date: to }),
  ]);

  if (bookedRes.error) {
    if (isMissingFunction(bookedRes.error)) return { booked, closed, source: 'unknown' };
    throw new Error('availability_unavailable');
  }
  for (const row of (bookedRes.data ?? []) as { date: string; time: string }[]) booked.add(slotKey(row.date, row.time));
  if (!closedRes.error) for (const row of (closedRes.data ?? []) as { date: string }[]) closed.add(row.date);
  return { booked, closed, source: 'live' };
}

export type BookingOutcome =
  | { ok: true; id: string; notified: boolean }
  | { ok: false; reason: 'slot_taken' | 'not_configured' | 'network' | 'rejected' };

/**
 * Creates a booking request (status `pending`). The id is generated here so we
 * never need read access to the bookings table from the browser.
 */
export async function requestBooking(input: { service: Service; date: string; time: string; contact: ContactDetails }): Promise<BookingOutcome> {
  if (!isSupabaseConfigured) return { ok: false, reason: 'not_configured' };
  const id = crypto.randomUUID();
  const { contact, service, date, time } = input;

  const { error } = await supabase.from('sessions').insert({
    id,
    customer_name: contact.name.trim(),
    email: contact.email.trim(),
    phone: contact.phone.trim(),
    service: service.id,
    message: contact.message.trim() || null,
    date,
    time,
    status: 'pending',
  });

  if (error) {
    if (error.code === '23505') return { ok: false, reason: 'slot_taken' };
    if (!error.code || error.message?.toLowerCase().includes('fetch')) return { ok: false, reason: 'network' };
    return { ok: false, reason: 'rejected' };
  }

  // Notify the team. The free-text message is intentionally not sent by email.
  let notified = false;
  try {
    const { error: notifyError } = await supabase.functions.invoke('send-booking-notification', {
      body: {
        bookingId: id,
        customerName: contact.name.trim(),
        email: contact.email.trim(),
        phone: contact.phone.trim(),
        service: service.name,
        date,
        time,
      },
    });
    notified = !notifyError;
  } catch {
    notified = false;
  }
  return { ok: true, id, notified };
}

export type EnquiryOutcome = { ok: true } | { ok: false; reason: 'table_missing' | 'not_configured' | 'rejected' | 'network' };

export interface EnquiryInput {
  kind: 'organisation' | 'individual' | 'general';
  serviceId?: string;
  name: string;
  email: string;
  phone?: string;
  organisation?: string;
  teamSize?: string;
  preferredContact?: 'email' | 'phone';
  message?: string;
}

export async function sendEnquiry(input: EnquiryInput): Promise<EnquiryOutcome> {
  if (!isSupabaseConfigured) return { ok: false, reason: 'not_configured' };
  const { error } = await supabase.from('enquiries').insert({
    id: crypto.randomUUID(),
    kind: input.kind,
    service_id: input.serviceId ?? null,
    name: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone?.trim() || null,
    organisation: input.organisation?.trim() || null,
    team_size: input.teamSize?.trim() || null,
    preferred_contact: input.preferredContact ?? null,
    message: input.message?.trim() || null,
    status: 'new',
  });
  if (!error) return { ok: true };
  if (error.code === '42P01' || error.code === 'PGRST205') return { ok: false, reason: 'table_missing' };
  if (!error.code) return { ok: false, reason: 'network' };
  return { ok: false, reason: 'rejected' };
}

/** mailto: fallback used when the enquiries table is not deployed yet. Opens the person's own email app. */
export function enquiryMailto(to: string, input: EnquiryInput, serviceName?: string): string {
  const subject = input.kind === 'organisation' ? 'Workplace wellness enquiry' : 'Consultation enquiry';
  const lines = [
    `Name: ${input.name}`,
    input.organisation ? `Organisation: ${input.organisation}` : '',
    input.teamSize ? `Team size: ${input.teamSize}` : '',
    serviceName ? `Interested in: ${serviceName}` : '',
    input.phone ? `Phone: ${input.phone}` : '',
    '',
    input.message ?? '',
  ].filter((l, i, arr) => l !== '' || (i > 0 && arr[i - 1] !== ''));
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
}
