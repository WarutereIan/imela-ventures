import type { CompanionMood, CompanionPose, CompanionTone, CompanionVariant } from '../components/characters/Companion';
import type { SceneEnvironment } from '../components/characters/Scene';

/**
 * Verification state of a catalogue entry. Only `available` services can be
 * presented as bookable; everything else must be labelled honestly.
 */
export type ServiceStatus = 'available' | 'awaiting_verification' | 'unavailable' | 'referral_only';
export type ServiceAudience = 'individual' | 'organisation';
export type ServiceFormat = 'in_person' | 'online' | 'on_site';

export interface Service {
  /** Stable id. Individual ids match the legacy `sessions.service` values. */
  id: string;
  name: string;
  audience: ServiceAudience;
  status: ServiceStatus;
  /**
   * `slot`: client picks a time (individual sessions).
   * `enquiry`: a consultation request is sent and the team schedules it.
   */
  bookingMode: 'slot' | 'enquiry';
  /** Confirmed duration in minutes, or null if not yet confirmed. */
  durationMinutes: number | null;
  summary: string;
  /** Plain-language list of what this service can help with. */
  supports: string[];
  /** Confirmed formats, or null when not yet confirmed. */
  formats: ServiceFormat[] | null;
  practitionerIds: string[];
  /** Fees are never invented. null means "confirmed during consultation". */
  fee: { amount: number; currency: 'KES' } | null;
  /** Concern slugs (see concerns.ts) this service is suitable for. */
  concernSlugs: string[];
  /** Who it is designed for, e.g. "Adults 18+". */
  audienceNote?: string;
}

export interface CharacterTheme {
  variant: CompanionVariant;
  mood: CompanionMood;
  pose: CompanionPose;
  tone: CompanionTone;
  environment: SceneEnvironment;
}

export type ConcernGroupId =
  | 'emotional-wellbeing'
  | 'relationships-family'
  | 'grief-loss'
  | 'trauma-history'
  | 'addiction-patterns'
  | 'identity-growth'
  | 'young-people-families'
  | 'workplace'
  | 'specialist';

export interface ConcernGroup {
  id: ConcernGroupId;
  title: string;
  /** Short, warm description for directory cards. */
  blurb: string;
  character: CharacterTheme;
  /** Tailwind background utility for the group's accent surface. */
  surface: string;
  /** Concerns from other groups that also belong on this group's page. */
  crossLinks?: string[];
}

export interface Concern {
  slug: string;
  group: ConcernGroupId;
  title: string;
  /** One-line, non-clinical description in the person's language. */
  tagline: string;
  /** 2–3 short paragraphs. Supportive, non-diagnostic, non-promissory. */
  intro: string[];
  /** "It can feel like…" — first-person, everyday phrasing. */
  feelsLike: string[];
  /** How talking with someone may help. Never promises outcomes. */
  howSupportHelps: string[];
  /** Gentle optional reflection prompts for the on-page check-in. */
  reflections: string[];
  /** Service ids from services.ts, most relevant first. */
  serviceIds: string[];
  /** Resource category ids from resources.ts. */
  resourceCategories: string[];
  /** Lower-case words/phrases used by the matching engine. */
  keywords: string[];
  character: CharacterTheme;
  /** If true, show a stronger "if you are not safe" note on the page. */
  safetyNote?: boolean;
}

export interface TeamMember {
  slug: string;
  name: string;
  role: string;
  /** Only statements present in Imela's own published materials. */
  bio: string[];
  /** Areas of practice as published by Imela. */
  areas: string[];
  languages: string[] | null;
  formats: ServiceFormat[] | null;
  /**
   * Qualifications are listed only once verified by Imela. Until then the
   * profile says verification is in progress.
   */
  qualifications: { label: string; verified: boolean }[];
  character: CharacterTheme;
  contactEmail?: string;
}

export interface ResourceCategory {
  id: string;
  label: string;
  tone: CompanionTone;
}

export interface Resource {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  /** Markdown-lite: paragraphs separated by blank lines, "## " headings, "- " bullets. */
  body: string;
  readMinutes: number;
  author: string;
  publishedAt: string | null;
  /**
   * `draft` content is starter material awaiting professional review and is
   * always labelled as such in the UI. `published` comes from the CMS.
   */
  reviewStatus: 'draft' | 'published';
  source: 'starter' | 'cms';
}
