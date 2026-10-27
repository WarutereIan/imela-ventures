/** Support categories offered in the anonymous portal (mirrors public.persona_concerns()). */
export const PORTAL_CONCERNS = [
  { id: 'stress-anxiety', label: 'Stress and anxiety' },
  { id: 'relationships-family', label: 'Relationships and family' },
  { id: 'grief-loss', label: 'Grief and loss' },
  { id: 'academic-pressure', label: 'Academic pressure' },
  { id: 'work-financial', label: 'Work and financial pressure' },
  { id: 'emotional-wellbeing', label: 'Emotional wellbeing' },
  { id: 'self-esteem-growth', label: 'Self-esteem and personal growth' },
  { id: 'other-unsure', label: 'Other / not sure yet' },
] as const;

export type PortalConcern = (typeof PORTAL_CONCERNS)[number]['id'];

export const CONCERN_LABEL: Record<string, string> = Object.fromEntries(PORTAL_CONCERNS.map((c) => [c.id, c.label]));

export type PreferredSupport = 'written' | 'group' | 'specialist' | 'not_sure';

export const SUPPORT_LABEL: Record<PreferredSupport, string> = {
  written: 'Written support from a counsellor',
  group: 'A group-support pathway',
  specialist: 'A specialist counsellor',
  not_sure: "I'm not sure yet",
};

export type CaseStatus = 'awaiting_review' | 'in_progress' | 'counsellor_replied' | 'closed';

export const STATUS_LABEL: Record<CaseStatus, string> = {
  awaiting_review: 'Awaiting review',
  in_progress: 'In progress',
  counsellor_replied: 'Counsellor replied',
  closed: 'Closed',
};

export type Urgency = 'routine' | 'priority' | 'crisis_review';

export const URGENCY_LABEL: Record<Urgency, string> = {
  routine: 'Routine',
  priority: 'Priority',
  crisis_review: 'Crisis review',
};

/** What a Persona can see about its own case (public.persona_my_cases). */
export interface MyCase {
  id: string;
  concerns: string[];
  story: string | null;
  preferred_support: PreferredSupport;
  status: CaseStatus;
  has_counsellor: boolean;
  created_at: string;
  updated_at: string;
  last_staff_reply_at: string | null;
  closed_at: string | null;
}

export interface CaseMessage {
  id: string;
  sender_role: 'persona' | 'counsellor' | 'system';
  body: string;
  created_at: string;
}

export interface CaseResource {
  id: string;
  title: string;
  url: string;
  note: string | null;
  created_at: string;
}

/** Full case as staff see it (public.persona_cases + persona code). */
export interface StaffCase {
  id: string;
  persona_user_id: string;
  persona_code: string;
  concerns: string[];
  story: string | null;
  preferred_support: PreferredSupport;
  status: CaseStatus;
  urgency: Urgency;
  urgency_reason: string | null;
  queue: string;
  assigned_to: string | null;
  follow_up_on: string | null;
  created_at: string;
  updated_at: string;
  last_persona_activity: string;
  first_response_at: string | null;
  last_staff_reply_at: string | null;
  closed_at: string | null;
}

export interface CaseNote {
  id: string;
  author_id: string;
  body: string;
  created_at: string;
}

export interface Counsellor {
  user_id: string;
  display_name: string;
}

export interface TriageRule {
  concern: PortalConcern;
  queue: string;
  base_urgency: 'routine' | 'priority';
  active: boolean;
  updated_at: string;
}

export interface AuditEvent {
  id: number;
  actor: string | null;
  action: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type Result<T, E extends string = string> = { ok: true; data: T } | { ok: false; reason: E; message?: string };
