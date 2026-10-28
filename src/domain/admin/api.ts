import { supabase } from '../../lib/supabase';

/**
 * Admin console data access. Every call runs as the signed-in admin; row-level
 * security and the audited admin_* database functions decide what is allowed.
 */

export type Result<T> = { ok: true; data: T } | { ok: false; reason: 'missing' | 'forbidden' | 'failed'; message?: string };

const MISSING = ['42P01', 'PGRST205', '42883', 'PGRST202', '42703', 'PGRST204'];

function fail(error: { code?: string; message?: string } | null): { ok: false; reason: 'missing' | 'forbidden' | 'failed'; message?: string } {
  if (error?.code && MISSING.includes(error.code)) return { ok: false, reason: 'missing' };
  if (error?.code === '42501') return { ok: false, reason: 'forbidden' };
  // P0002 / 22023 carry a friendly message written in the database function.
  if (error?.code === 'P0002' || error?.code === '22023') return { ok: false, reason: 'failed', message: error.message };
  return { ok: false, reason: 'failed' };
}

// --- Summary ---------------------------------------------------------------------

export interface AdminSummary {
  bookings_pending: number;
  bookings_today: number;
  bookings_week: number;
  bookings_by_day: { date: string; count: number }[];
  enquiries_new: number;
  cases_open: number;
  cases_awaiting: number;
  cases_unassigned: number;
  cases_urgent: number;
  cases_follow_up_due: number;
  articles_published: number;
  articles_draft: number;
  article_views: number;
  notifications_unread: number;
}

export async function fetchSummary(): Promise<Result<AdminSummary>> {
  const { data, error } = await supabase.rpc('admin_summary');
  if (error) return fail(error);
  return { ok: true, data: data as AdminSummary };
}

// --- Notifications ------------------------------------------------------------------

export type NotificationKind = 'booking_new' | 'booking_cancelled' | 'enquiry_new' | 'case_new' | 'case_message' | 'case_urgent';

export interface AdminNotification {
  id: string;
  audience: 'admin' | 'staff';
  kind: NotificationKind;
  title: string;
  body: string | null;
  ref_type: 'session' | 'enquiry' | 'persona_case';
  ref_id: string;
  urgent: boolean;
  created_at: string;
  read_at: string | null;
}

/** Where a notification leads inside the console. */
export function notificationHref(n: Pick<AdminNotification, 'ref_type' | 'ref_id'>): string {
  if (n.ref_type === 'persona_case') return `/admin/cases/${n.ref_id}`;
  if (n.ref_type === 'enquiry') return `/admin/enquiries?open=${n.ref_id}`;
  return `/admin/bookings?open=${n.ref_id}`;
}

export async function listNotifications(limit = 50): Promise<Result<AdminNotification[]>> {
  const { data, error } = await supabase.from('admin_notifications').select('*').order('created_at', { ascending: false }).limit(limit);
  if (error) return fail(error);
  return { ok: true, data: (data ?? []) as AdminNotification[] };
}

export async function markNotificationsRead(ids: string[] | 'all'): Promise<Result<null>> {
  let q = supabase.from('admin_notifications').update({ read_at: new Date().toISOString() }).is('read_at', null);
  if (ids !== 'all') q = q.in('id', ids);
  const { error } = await q;
  if (error) return fail(error);
  return { ok: true, data: null };
}

export async function clearReadNotifications(): Promise<Result<null>> {
  const { error } = await supabase.from('admin_notifications').delete().not('read_at', 'is', null);
  if (error) return fail(error);
  return { ok: true, data: null };
}

// --- Bookings --------------------------------------------------------------------------

export type SessionStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'responded' | 'closed';
export const SESSION_STATUSES: SessionStatus[] = ['pending', 'confirmed', 'completed', 'cancelled', 'responded', 'closed'];

export interface Booking {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  service: string;
  message: string | null;
  date: string;
  time: string;
  status: SessionStatus;
  admin_note?: string | null;
  duration_minutes?: number | null;
  created_at?: string | null;
}

export async function listBookings(): Promise<Result<Booking[]>> {
  const { data, error } = await supabase.from('sessions').select('*').order('date', { ascending: true }).order('time', { ascending: true });
  if (error) return fail(error);
  return { ok: true, data: (data ?? []) as Booking[] };
}

export async function updateBooking(id: string, patch: Partial<Pick<Booking, 'status' | 'admin_note'>>): Promise<Result<null>> {
  const { error } = await supabase.from('sessions').update(patch).eq('id', id);
  if (error) return fail(error);
  return { ok: true, data: null };
}

/** Sends the confirmation email through the Edge Function. Resolves false if it could not be sent. */
export async function sendBookingConfirmation(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.functions.invoke('send-booking-confirmation', { body: { bookingId: id } });
    return !error;
  } catch {
    return false;
  }
}

// --- Enquiries --------------------------------------------------------------------------

export type EnquiryStatus = 'new' | 'in_progress' | 'closed';

export interface Enquiry {
  id: string;
  kind: 'organisation' | 'individual' | 'general';
  service_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  organisation: string | null;
  team_size: string | null;
  preferred_contact: string | null;
  message: string | null;
  status: EnquiryStatus;
  admin_note?: string | null;
  created_at: string;
}

export async function listEnquiries(): Promise<Result<Enquiry[]>> {
  const { data, error } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false });
  if (error) return fail(error);
  return { ok: true, data: (data ?? []) as Enquiry[] };
}

export async function updateEnquiry(id: string, patch: Partial<Pick<Enquiry, 'status' | 'admin_note'>>): Promise<Result<null>> {
  const { error } = await supabase
    .from('enquiries')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) {
    // Before migration 0008 there is no updated_at / admin_note column: retry with the status alone.
    if (error.code === '42703' || error.code === 'PGRST204') {
      if (patch.admin_note !== undefined) return { ok: false, reason: 'missing' };
      const retry = await supabase.from('enquiries').update(patch).eq('id', id);
      return retry.error ? fail(retry.error) : { ok: true, data: null };
    }
    return fail(error);
  }
  return { ok: true, data: null };
}

// --- Articles --------------------------------------------------------------------------

export interface Article {
  id: string;
  title: string | null;
  category: string | null;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string | null;
  views: number | null;
  content: string | null;
  excerpt: string | null;
  image_url: string | null;
  author: string | null;
  slug?: string | null;
}

export async function listArticles(): Promise<Result<Article[]>> {
  const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
  if (error) return fail(error);
  return { ok: true, data: (data ?? []) as Article[] };
}

export async function createArticle(): Promise<Result<Article>> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('blog_posts')
    .insert({ title: 'Untitled article', category: 'Mental Health', status: 'draft', created_at: now, updated_at: now, views: 0, content: '', excerpt: '', image_url: null, author: 'Imela Team' })
    .select('*')
    .single();
  if (error || !data) return fail(error);
  return { ok: true, data: data as Article };
}

export async function saveArticle(id: string, patch: Partial<Article>): Promise<Result<null>> {
  const { error } = await supabase
    .from('blog_posts')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return fail(error);
  return { ok: true, data: null };
}

export async function deleteArticle(id: string): Promise<Result<null>> {
  const { error } = await supabase.from('blog_posts').delete().eq('id', id);
  if (error) return fail(error);
  return { ok: true, data: null };
}

// --- Availability ------------------------------------------------------------------------

export interface WeeklySlot {
  weekday: number;
  slot_time: string;
  active: boolean;
}

export interface ClosedDay {
  id: number;
  date: string;
  reason: string | null;
}

export async function listWeeklySlots(): Promise<Result<WeeklySlot[]>> {
  const { data, error } = await supabase.from('availability_slots').select('weekday, slot_time, active');
  if (error) return fail(error);
  return { ok: true, data: (data ?? []) as WeeklySlot[] };
}

export async function setWeeklySlot(weekday: number, slotTime: string, active: boolean): Promise<Result<null>> {
  const { error } = await supabase.from('availability_slots').upsert({ weekday, slot_time: slotTime, active });
  if (error) return fail(error);
  return { ok: true, data: null };
}

export async function listClosedDays(fromDate: string): Promise<Result<ClosedDay[]>> {
  const { data, error } = await supabase
    .from('availability_exceptions')
    .select('id, date, reason')
    .is('practitioner_id', null)
    .gte('date', fromDate)
    .order('date');
  if (error) return fail(error);
  return { ok: true, data: (data ?? []) as ClosedDay[] };
}

export async function addClosedDay(date: string, reason: string): Promise<Result<null>> {
  const { error } = await supabase.from('availability_exceptions').insert({ date, reason: reason.trim() || null, closed: true });
  if (error) return fail(error);
  return { ok: true, data: null };
}

export async function removeClosedDay(id: number): Promise<Result<null>> {
  const { error } = await supabase.from('availability_exceptions').delete().eq('id', id);
  if (error) return fail(error);
  return { ok: true, data: null };
}

// --- Team -----------------------------------------------------------------------------------

export interface StaffMember {
  user_id: string;
  email: string;
  roles: ('admin' | 'practitioner')[];
  practitioner_id: string | null;
}

export interface PractitionerRow {
  id: string;
  display_name: string;
  user_id: string | null;
  active: boolean;
}

export async function listStaff(): Promise<Result<StaffMember[]>> {
  const { data, error } = await supabase.rpc('admin_staff_directory');
  if (error) return fail(error);
  return { ok: true, data: (data ?? []) as StaffMember[] };
}

export async function setRole(email: string, role: 'admin' | 'practitioner', grant: boolean): Promise<Result<null>> {
  const { error } = await supabase.rpc('admin_set_role', { p_email: email, p_role: role, p_grant: grant });
  if (error) return fail(error);
  return { ok: true, data: null };
}

export async function listPractitioners(): Promise<Result<PractitionerRow[]>> {
  const { data, error } = await supabase.from('practitioners').select('id, display_name, user_id, active').order('display_name');
  if (error) return fail(error);
  return { ok: true, data: (data ?? []) as PractitionerRow[] };
}

export async function linkPractitioner(practitionerId: string, email: string): Promise<Result<null>> {
  const { error } = await supabase.rpc('admin_link_practitioner', { p_practitioner_id: practitionerId, p_email: email });
  if (error) return fail(error);
  return { ok: true, data: null };
}

// --- Settings ------------------------------------------------------------------------------

export async function loadSettings(): Promise<Result<Record<string, string>>> {
  const { data, error } = await supabase.from('settings').select('key, value');
  if (error) return fail(error);
  return { ok: true, data: Object.fromEntries(((data ?? []) as { key: string; value: string | null }[]).map((r) => [r.key, r.value ?? ''])) };
}

export async function saveSetting(key: string, value: string): Promise<Result<null>> {
  const { error } = await supabase.from('settings').upsert({ key, value });
  if (error) return fail(error);
  return { ok: true, data: null };
}
