import type { Service, ServiceFormat, ServiceStatus } from './types';

/**
 * Imela's service catalogue — the single source of truth for every page that
 * lists, recommends or books a service.
 *
 * Status rules:
 * - `available`: offered today according to Imela's own booking form or
 *   company profile. Individual ids and durations match the live booking form.
 * - `awaiting_verification`: mentioned as a possibility but not yet confirmed
 *   by Imela. Shown honestly and never offered as bookable.
 * - `referral_only`: Imela can help you find the right specialist elsewhere.
 * - `unavailable`: not offered.
 *
 * Fees are null on purpose: the previous site deliberately removed pricing and
 * fees are confirmed during consultation.
 */
export const SERVICES: Service[] = [
  {
    id: 'consultation',
    name: 'Initial Consultation',
    audience: 'individual',
    status: 'available',
    bookingMode: 'slot',
    durationMinutes: 30,
    summary:
      "A short first conversation to talk through what's going on and agree on the kind of support that fits. A good place to start if you're unsure.",
    supports: ['Working out what kind of support you need', 'Questions about how counselling works', 'Choosing between individual, couples or family support'],
    formats: null,
    practitionerIds: ['karen-mwangi'],
    fee: null,
    concernSlugs: ['*'],
  },
  {
    id: 'individual-adult',
    name: 'Individual Counselling — Adults',
    audience: 'individual',
    status: 'available',
    bookingMode: 'slot',
    durationMinutes: 60,
    summary:
      'One-to-one counselling in a confidential, non-judgemental space to explore what you are carrying and work on it at your own pace.',
    supports: ['Stress, worry and low mood', 'Grief, loss and life changes', 'Relationship and family difficulties', 'Self-esteem, identity and personal growth'],
    formats: ['in_person', 'online'],
    practitionerIds: ['karen-mwangi'],
    fee: null,
    concernSlugs: [
      'anxiety-worry', 'low-mood', 'stress-overwhelm', 'burnout', 'self-esteem', 'anger-regulation', 'loneliness',
      'life-transitions', 'personal-growth', 'bereavement', 'relationship-loss', 'life-changes', 'caregiver-stress',
      'illness-adjustment', 'trauma-informed', 'early-experiences', 'attachment-patterns', 'family-dynamics',
      'emotional-safety', 'identity-exploration', 'boundaries', 'emotional-dependency', 'shame-self-criticism',
      'purpose-decisions', 'dating-relationships', 'separation-divorce', 'trust-intimacy', 'work-stress',
      'leadership-wellbeing', 'sleep', 'student-adjustment', 'academic-stress', 'digital-habits',
      'compulsive-behaviours', 'alcohol-substance', 'gambling', 'recovery-relapse', 'parenting', 'communication-conflict',
    ],
    audienceNote: 'Adults 18+',
  },
  {
    id: 'individual-teen',
    name: 'Individual Counselling — Teens',
    audience: 'individual',
    status: 'available',
    bookingMode: 'slot',
    durationMinutes: 50,
    summary:
      'Counselling designed around the pressures of adolescence — school, friendships, identity and family — with a parent or guardian involved in arranging care.',
    supports: ['Academic and exam pressure', 'Confidence and identity', 'Friendship and family tension', 'Big feelings that are hard to explain'],
    formats: null,
    practitionerIds: ['karen-mwangi'],
    fee: null,
    concernSlugs: ['adolescent-wellbeing', 'academic-stress', 'student-adjustment', 'self-esteem', 'identity-exploration', 'anxiety-worry', 'low-mood', 'digital-habits', 'loneliness'],
    audienceNote: 'Young people 13–17, booked by a parent or guardian',
  },
  {
    id: 'couples-therapy',
    name: 'Couples Counselling',
    audience: 'individual',
    status: 'available',
    bookingMode: 'slot',
    durationMinutes: 90,
    summary:
      'Joint sessions for partners who want to understand each other better, communicate more honestly and work through difficult seasons together.',
    supports: ['Communication and recurring arguments', 'Trust and intimacy', 'Marriage and long-term partnership', 'Deciding on the future of a relationship'],
    formats: null,
    practitionerIds: ['karen-mwangi'],
    fee: null,
    concernSlugs: ['marriage', 'couples', 'communication-conflict', 'trust-intimacy', 'separation-divorce', 'premarital', 'dating-relationships', 'parenting'],
  },
  {
    id: 'family-session',
    name: 'Family Support Session',
    audience: 'individual',
    status: 'available',
    bookingMode: 'enquiry',
    durationMinutes: 90,
    summary:
      'Sessions that bring family members together to ease conflict, improve communication and support one another through change.',
    supports: ['Family conflict and communication', 'Parenting and co-parenting', 'Supporting a teenager', 'Adjusting to family changes'],
    formats: null,
    practitionerIds: ['karen-mwangi'],
    fee: null,
    concernSlugs: ['family-conflict', 'parenting', 'family-communication', 'adolescent-wellbeing', 'family-dynamics', 'caregiver-stress'],
  },
  {
    id: 'group-workshop',
    name: 'Group Workshop',
    audience: 'individual',
    status: 'available',
    bookingMode: 'slot',
    durationMinutes: 120,
    summary:
      'Small-group sessions on shared themes such as managing stress, building confidence or communicating well — learning alongside others.',
    supports: ['Stress management skills', 'Confidence building', 'Communication skills', 'Feeling less alone with a shared experience'],
    formats: null,
    practitionerIds: ['karen-mwangi'],
    fee: null,
    concernSlugs: ['stress-overwhelm', 'self-esteem', 'loneliness', 'communication-conflict', 'personal-growth'],
  },
  {
    id: 'premarital',
    name: 'Premarital Counselling',
    audience: 'individual',
    status: 'available',
    bookingMode: 'enquiry',
    durationMinutes: null,
    summary: 'Preparing for marriage together — expectations, communication, family and finances.',
    supports: ['Shared expectations', 'Communication foundations', 'Family and cultural expectations'],
    formats: null,
    practitionerIds: [],
    fee: null,
    concernSlugs: ['premarital', 'marriage'],
  },
  {
    id: 'psychological-assessment',
    name: 'Psychological Assessment',
    audience: 'individual',
    status: 'available',
    bookingMode: 'enquiry',
    durationMinutes: null,
    summary:
      'Structured assessment using properly licensed instruments, interpreted by a qualified professional, to understand patterns in more depth and shape a support plan.',
    supports: ['Understanding patterns in more depth', 'Informing a support plan'],
    formats: null,
    practitionerIds: [],
    fee: null,
    concernSlugs: ['psychological-assessment'],
  },
  {
    id: 'addiction-support',
    name: 'Addiction & Recovery Counselling',
    audience: 'individual',
    status: 'available',
    bookingMode: 'enquiry',
    durationMinutes: null,
    summary:
      'Focused counselling for alcohol, substance use, gambling and other compulsive patterns — understanding what keeps them going, planning change and preventing relapse.',
    supports: ['Understanding what keeps a pattern going', 'Planning change', 'Relapse-prevention support'],
    formats: null,
    practitionerIds: [],
    fee: null,
    concernSlugs: ['alcohol-substance', 'gambling', 'compulsive-behaviours', 'recovery-relapse', 'digital-habits'],
  },
  {
    id: 'trauma-therapy',
    name: 'Specialist Trauma Therapy',
    audience: 'individual',
    status: 'awaiting_verification',
    bookingMode: 'enquiry',
    durationMinutes: null,
    summary:
      'Structured, trauma-focused therapy. Imela is confirming this specialism; trauma-informed individual counselling is available now.',
    supports: ['Processing difficult experiences', 'Rebuilding a sense of safety'],
    formats: null,
    practitionerIds: [],
    fee: null,
    concernSlugs: ['trauma-informed', 'early-experiences', 'emotional-safety'],
  },
  {
    id: 'neurodiversity-assessment',
    name: 'Neurodiversity Assessment (ADHD, autism)',
    audience: 'individual',
    status: 'available',
    bookingMode: 'enquiry',
    durationMinutes: null,
    summary: 'Assessment for ADHD and autism, and a conversation about what the results mean for you and the support that may help.',
    supports: ['Understanding how your mind works', 'Making sense of the results', 'Planning support for daily life'],
    formats: null,
    practitionerIds: [],
    fee: null,
    concernSlugs: ['neurodiversity'],
  },
  {
    id: 'psychiatric-referral',
    name: 'Psychiatric Care & Medication Review',
    audience: 'individual',
    status: 'referral_only',
    bookingMode: 'enquiry',
    durationMinutes: null,
    summary: 'Medication and psychiatric diagnosis are provided by medical professionals. Imela can help you think about a referral.',
    supports: ['Guidance on seeking psychiatric or medical care'],
    formats: null,
    practitionerIds: [],
    fee: null,
    concernSlugs: ['specialist-referral', 'sleep', 'illness-adjustment'],
  },

  // --- Organisations (from the Imela company profile) ---
  {
    id: 'employee-counselling',
    name: 'Employee Counselling',
    audience: 'organisation',
    status: 'available',
    bookingMode: 'enquiry',
    durationMinutes: null,
    summary:
      'Confidential, personalised counselling for your people — stress, emotional challenges, work–life balance and personal growth.',
    supports: ['Stress and emotional challenges', 'Work–life balance', 'Personal growth', 'Confidential individual support'],
    formats: null,
    practitionerIds: ['karen-mwangi'],
    fee: null,
    concernSlugs: ['employee-counselling', 'work-stress', 'burnout'],
  },
  {
    id: 'corporate-training',
    name: 'Corporate Wellbeing Training',
    audience: 'organisation',
    status: 'available',
    bookingMode: 'enquiry',
    durationMinutes: null,
    summary:
      'Interactive training on stress management, coping after traumatic events, personal development and constructive discipline — designed around your culture.',
    supports: ['Stress management', 'Trauma coping mechanisms', 'Personal development', 'Employee discipline support'],
    formats: ['on_site'],
    practitionerIds: ['karen-mwangi'],
    fee: null,
    concernSlugs: ['work-stress', 'burnout', 'psychological-safety', 'team-conflict'],
  },
  {
    id: 'leadership-development',
    name: 'Leadership Development',
    audience: 'organisation',
    status: 'available',
    bookingMode: 'enquiry',
    durationMinutes: null,
    summary:
      'Training, coaching and mentorship that build emotionally intelligent, adaptive leaders — using experiential learning, case studies and workshops.',
    supports: ['Strategic vision and alignment', 'Emotional intelligence', 'Adaptive leadership', 'Ethical, inclusive leadership'],
    formats: ['on_site'],
    practitionerIds: ['karen-mwangi'],
    fee: null,
    concernSlugs: ['leadership-wellbeing', 'organisational-transitions', 'psychological-safety'],
  },
  {
    id: 'conflict-resolution',
    name: 'Conflict Resolution Support',
    audience: 'organisation',
    status: 'available',
    bookingMode: 'enquiry',
    durationMinutes: null,
    summary: 'Guidance on fair, respectful and growth-oriented ways to resolve workplace disputes.',
    supports: ['Team conflict', 'Dispute resolution processes', 'Restoring working relationships'],
    formats: null,
    practitionerIds: ['karen-mwangi'],
    fee: null,
    concernSlugs: ['team-conflict', 'psychological-safety'],
  },
  {
    id: 'culture-audit',
    name: 'Culture Audit & Transformation',
    audience: 'organisation',
    status: 'available',
    bookingMode: 'enquiry',
    durationMinutes: null,
    summary:
      'A structured look at your workplace culture through stakeholder conversations and assessments, followed by tailor-made programmes and progress measurement.',
    supports: ['Understanding your current culture', 'Tailor-made training programmes', 'Measuring progress over time'],
    formats: ['on_site'],
    practitionerIds: ['karen-mwangi'],
    fee: null,
    concernSlugs: ['organisational-transitions', 'psychological-safety', 'team-conflict'],
  },
];

export const SERVICE_BY_ID: Record<string, Service> = Object.fromEntries(SERVICES.map((s) => [s.id, s]));

export function getService(id: string | null | undefined): Service | undefined {
  return id ? SERVICE_BY_ID[id] : undefined;
}

/** A service may be offered for booking only when it is verified as available. */
export function isBookable(service: Service): boolean {
  return service.status === 'available';
}

export function isSlotBookable(service: Service): boolean {
  return isBookable(service) && service.bookingMode === 'slot' && service.durationMinutes != null;
}

export const STATUS_LABEL: Record<ServiceStatus, string> = {
  available: 'Available',
  awaiting_verification: 'Being confirmed',
  referral_only: 'Referral guidance',
  unavailable: 'Not offered',
};

export const FORMAT_LABEL: Record<ServiceFormat, string> = {
  in_person: 'In person',
  online: 'Online',
  on_site: 'At your workplace',
};

export function formatsLabel(service: Service): string {
  return service.formats ? service.formats.map((f) => FORMAT_LABEL[f]).join(' · ') : 'Confirmed when booking';
}

export function durationLabel(service: Service): string {
  return service.durationMinutes ? `${service.durationMinutes} min` : 'Varies';
}

export function feeLabel(service: Service): string {
  if (!service.fee) return 'Confirmed at consultation';
  return `${service.fee.currency} ${service.fee.amount.toLocaleString('en-KE')}`;
}
