import { supabase } from '../../lib/supabase';
import type { AuditEvent, CaseMessage, CaseNote, CaseResource, CaseStatus, Counsellor, Result, StaffCase, TriageRule, Urgency } from './types';

/**
 * Staff-side data access (admins and practitioners, using the normal staff
 * session). Row-level security decides which cases each person can see;
 * every change goes through an audited database function.
 */

type Row = Omit<StaffCase, 'persona_code'> & { persona: { persona_code: string } | null };

const CASE_COLUMNS =
  'id, persona_user_id, concerns, story, preferred_support, status, urgency, urgency_reason, queue, assigned_to, follow_up_on, created_at, updated_at, last_persona_activity, first_response_at, last_staff_reply_at, closed_at, persona:persona_profiles(persona_code)';

function toCase(row: Row): StaffCase {
  const { persona, ...rest } = row;
  return { ...rest, persona_code: persona?.persona_code ?? 'IMP-????' };
}

function fail<T>(error: { message?: string; code?: string }): Result<T> {
  return { ok: false, reason: error.code === '42501' ? 'forbidden' : 'failed', message: error.message };
}

export interface CaseFilters {
  scope: 'queue' | 'mine' | 'all';
  status?: CaseStatus | 'open';
  urgency?: Urgency;
  userId?: string;
}

export async function listStaffCases(filters: CaseFilters): Promise<Result<StaffCase[]>> {
  let q = supabase.from('persona_cases').select(CASE_COLUMNS);
  if (filters.scope === 'queue') q = q.is('assigned_to', null);
  if (filters.scope === 'mine' && filters.userId) q = q.eq('assigned_to', filters.userId);
  if (filters.status === 'open') q = q.neq('status', 'closed');
  else if (filters.status) q = q.eq('status', filters.status);
  if (filters.urgency) q = q.eq('urgency', filters.urgency);
  // Crisis review first, then oldest waiting.
  const { data, error } = await q.order('created_at', { ascending: true }).limit(200);
  if (error) return fail(error);
  const rank: Record<Urgency, number> = { crisis_review: 0, priority: 1, routine: 2 };
  const cases = ((data ?? []) as unknown as Row[]).map(toCase).sort((a, b) => rank[a.urgency] - rank[b.urgency]);
  return { ok: true, data: cases };
}

export interface CaseDetail {
  case: StaffCase;
  messages: CaseMessage[];
  notes: CaseNote[];
  resources: CaseResource[];
}

/** Opens a case. The open itself is written to the audit log. */
export async function openStaffCase(id: string): Promise<Result<CaseDetail>> {
  const audit = await supabase.rpc('staff_open_case', { p_case: id });
  if (audit.error) return fail(audit.error);
  const [c, m, n, r] = await Promise.all([
    supabase.from('persona_cases').select(CASE_COLUMNS).eq('id', id).maybeSingle(),
    supabase.from('persona_messages').select('id, sender_role, body, created_at').eq('case_id', id).order('created_at'),
    supabase.from('persona_case_notes').select('id, author_id, body, created_at').eq('case_id', id).order('created_at'),
    supabase.from('persona_case_resources').select('id, title, url, note, created_at').eq('case_id', id).order('created_at', { ascending: false }),
  ]);
  const err = c.error ?? m.error ?? n.error ?? r.error;
  if (err) return fail(err);
  if (!c.data) return { ok: false, reason: 'not_found' };
  return {
    ok: true,
    data: {
      case: toCase(c.data as unknown as Row),
      messages: (m.data ?? []) as CaseMessage[],
      notes: (n.data ?? []) as CaseNote[],
      resources: (r.data ?? []) as CaseResource[],
    },
  };
}

export async function sendStaffReply(caseId: string, body: string, userId: string): Promise<Result<null>> {
  const text = body.trim();
  if (!text || text.length > 5000) return { ok: false, reason: 'invalid' };
  const { error } = await supabase.from('persona_messages').insert({ case_id: caseId, sender_role: 'counsellor', sender_id: userId, body: text });
  return error ? fail(error) : { ok: true, data: null };
}

export async function addCaseNote(caseId: string, body: string, userId: string): Promise<Result<null>> {
  const text = body.trim();
  if (!text || text.length > 5000) return { ok: false, reason: 'invalid' };
  const { error } = await supabase.from('persona_case_notes').insert({ case_id: caseId, author_id: userId, body: text });
  return error ? fail(error) : { ok: true, data: null };
}

export async function assignCaseResource(caseId: string, input: { title: string; url: string; note?: string }, userId: string): Promise<Result<null>> {
  const url = input.url.trim();
  if (!input.title.trim() || !(url.startsWith('/') || url.startsWith('https://'))) return { ok: false, reason: 'invalid' };
  const { error } = await supabase
    .from('persona_case_resources')
    .insert({ case_id: caseId, title: input.title.trim(), url, note: input.note?.trim() || null, assigned_by: userId });
  return error ? fail(error) : { ok: true, data: null };
}

export async function assignCase(caseId: string, assignee: string | null): Promise<Result<null>> {
  const { error } = await supabase.rpc('staff_assign_case', { p_case: caseId, p_assignee: assignee });
  return error ? fail(error) : { ok: true, data: null };
}

export async function setCaseStatus(caseId: string, status: CaseStatus): Promise<Result<null>> {
  const { error } = await supabase.rpc('staff_set_case_status', { p_case: caseId, p_status: status });
  return error ? fail(error) : { ok: true, data: null };
}

export async function setCaseUrgency(caseId: string, urgency: Urgency, reason: string): Promise<Result<null>> {
  if (!reason.trim()) return { ok: false, reason: 'invalid', message: 'A short reason is required.' };
  const { error } = await supabase.rpc('staff_set_case_urgency', { p_case: caseId, p_urgency: urgency, p_reason: reason.trim() });
  return error ? fail(error) : { ok: true, data: null };
}

export async function setFollowUp(caseId: string, date: string | null): Promise<Result<null>> {
  const { error } = await supabase.rpc('staff_set_follow_up', { p_case: caseId, p_date: date });
  return error ? fail(error) : { ok: true, data: null };
}

export async function listCounsellors(): Promise<Result<Counsellor[]>> {
  const { data, error } = await supabase.from('practitioners').select('user_id, display_name').eq('active', true).not('user_id', 'is', null);
  if (error) return fail(error);
  return { ok: true, data: (data ?? []) as Counsellor[] };
}

export interface Workload {
  assignee: string | null;
  open_cases: number;
  awaiting_reply: number;
  crisis_review: number;
}

export async function getWorkload(): Promise<Result<Workload[]>> {
  const { data, error } = await supabase.rpc('staff_persona_workload');
  if (error) return fail(error);
  return { ok: true, data: (data ?? []) as Workload[] };
}

export async function listTriageRules(): Promise<Result<TriageRule[]>> {
  const { data, error } = await supabase.from('persona_triage_rules').select('concern, queue, base_urgency, active, updated_at').order('concern');
  if (error) return fail(error);
  return { ok: true, data: (data ?? []) as TriageRule[] };
}

export async function updateTriageRule(rule: Pick<TriageRule, 'concern' | 'queue' | 'base_urgency' | 'active'>, userId: string): Promise<Result<null>> {
  const { error } = await supabase
    .from('persona_triage_rules')
    .update({ queue: rule.queue.trim(), base_urgency: rule.base_urgency, active: rule.active, updated_at: new Date().toISOString(), updated_by: userId })
    .eq('concern', rule.concern);
  return error ? fail(error) : { ok: true, data: null };
}

export async function listPersonaAudit(limit = 200): Promise<Result<AuditEvent[]>> {
  const { data, error } = await supabase
    .from('audit_events')
    .select('id, actor, action, entity_id, metadata, created_at')
    .eq('entity', 'persona_case')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) return fail(error);
  return { ok: true, data: (data ?? []) as AuditEvent[] };
}
