import { CONCERNS } from '../data/concerns';
import { SERVICES } from '../data/services';
import type { Concern, Service, ServiceAudience } from '../data/types';
import { containsPhrase, normalise } from './text';

/**
 * Deterministic, explainable matching from what a person says to Imela's
 * verified catalogue. It works without any external AI service and is the
 * grounding layer for any AI reflections: recommendations always come from
 * here, never from a language model.
 */

export interface ConcernMatch {
  concern: Concern;
  score: number;
  /** The words/phrases from the person's text that produced the match. */
  matched: string[];
}

export interface Recommendation {
  service: Service;
  /** Plain-language explanation of why this option may be relevant. */
  reason: string;
  /** Concerns that led to this service. */
  via: Concern[];
  score: number;
}

export interface MatchContext {
  /** Concern slugs the person explicitly chose (chips, check-in, corrections). */
  selectedConcerns?: string[];
  /** Restrict to an audience. Defaults to both. */
  audience?: ServiceAudience;
  /** Preference captured in clarification, e.g. couples vs individual. */
  prefer?: { together?: boolean; forTeen?: boolean; family?: boolean; group?: boolean };
}

export interface MatchResult {
  concerns: ConcernMatch[];
  /** Bookable/enquirable services that are verified as available. */
  recommendations: Recommendation[];
  /** Services Imela can offer referral guidance for (never presented as bookable). */
  referrals: Service[];
  /** True when nothing specific matched and the consultation fallback was used. */
  fallback: boolean;
}

const MIN_SCORE = 2;

function phraseWeight(phrase: string): number {
  const words = phrase.replace('*', '').trim().split(/\s+/).length;
  // "my wife", "my boss": who is involved is context, not the topic itself.
  if (words === 2 && phrase.startsWith('my ')) return 2;
  return words >= 3 ? 5 : words === 2 ? 4 : 2;
}

export function matchConcerns(text: string, concerns: Concern[] = CONCERNS, selected: string[] = []): ConcernMatch[] {
  const t = normalise(text);
  const results: ConcernMatch[] = [];

  for (const concern of concerns) {
    let score = 0;
    const matched: string[] = [];
    if (t) {
      for (const kw of concern.keywords) {
        if (containsPhrase(t, kw)) {
          score += phraseWeight(kw);
          matched.push(kw.replace('*', ''));
        }
      }
      if (containsPhrase(t, concern.title)) {
        score += 4;
        matched.push(concern.title.toLowerCase());
      }
    }
    if (selected.includes(concern.slug)) score += 10;
    if (score >= MIN_SCORE) results.push({ concern, score, matched });
  }

  return results.sort((a, b) => b.score - a.score);
}

function describeMatch(match: ConcernMatch | undefined, concern: Concern): string {
  const phrase = [...(match?.matched ?? [])].filter((m) => m !== concern.title.toLowerCase()).sort((a, b) => b.length - a.length)[0] ?? match?.matched[0];
  if (phrase) return `You mentioned “${phrase}”, which often relates to ${concern.title.toLowerCase()}.`;
  return `You chose ${concern.title.toLowerCase()}.`;
}

function serviceReason(service: Service, via: Concern[], matches: ConcernMatch[]): string {
  const lead = via[0];
  const leadMatch = matches.find((m) => m.concern.slug === lead.slug);
  const why = describeMatch(leadMatch, lead);
  const what: Record<string, string> = {
    'couples-therapy': 'Couples counselling gives you both a space to be heard and to work on how you communicate.',
    'individual-adult': 'One-to-one counselling lets you talk this through at your own pace, in confidence.',
    'individual-teen': 'Teen counselling is shaped around the pressures young people face.',
    'family-session': 'A family session brings people together to ease tension and listen to each other.',
    'group-workshop': 'A small group can help you build practical skills alongside others with similar experiences.',
    consultation: 'A short first conversation can help you decide which kind of support fits best.',
  };
  return `${why} ${what[service.id] ?? service.summary}`;
}

export function recommend(text: string, ctx: MatchContext = {}, concerns: Concern[] = CONCERNS, services: Service[] = SERVICES): MatchResult {
  const matches = matchConcerns(text, concerns, ctx.selectedConcerns ?? []).slice(0, 4);
  const audienceOk = (s: Service) => !ctx.audience || s.audience === ctx.audience;

  const scores = new Map<string, { score: number; via: Concern[] }>();
  matches.forEach((m, rank) => {
    m.concern.serviceIds.forEach((id, position) => {
      const entry = scores.get(id) ?? { score: 0, via: [] };
      // Earlier concerns and earlier-listed services weigh more.
      entry.score += m.score * (1 / (rank + 1)) * (1 / (position + 1));
      if (!entry.via.includes(m.concern)) entry.via.push(m.concern);
      scores.set(id, entry);
    });
  });

  // Clarification preferences
  const bump = (id: string, by: number) => {
    const e = scores.get(id);
    if (e) e.score *= by;
  };
  if (ctx.prefer?.together === true) bump('couples-therapy', 2.5);
  if (ctx.prefer?.together === false) bump('couples-therapy', 0.4);
  if (ctx.prefer?.forTeen === true) {
    bump('individual-teen', 3);
    bump('individual-adult', 0.4);
  }
  if (ctx.prefer?.forTeen !== true) bump('individual-teen', 0.5);
  if (ctx.prefer?.family) bump('family-session', 3);
  if (ctx.prefer?.group) bump('group-workshop', 3);

  const byId = new Map(services.map((s) => [s.id, s]));
  const ranked = [...scores.entries()]
    .map(([id, e]) => ({ service: byId.get(id), ...e }))
    .filter((r): r is { service: Service; score: number; via: Concern[] } => Boolean(r.service) && audienceOk(r.service!))
    .sort((a, b) => b.score - a.score);

  const recommendations: Recommendation[] = ranked
    .filter((r) => r.service.status === 'available' && r.service.id !== 'consultation')
    .slice(0, 3)
    .map((r) => ({ service: r.service, via: r.via, score: r.score, reason: serviceReason(r.service, r.via, matches) }));

  const referrals = ranked.filter((r) => r.service.status === 'referral_only').map((r) => r.service);

  // Always offer the human starting point for individuals.
  const consultation = byId.get('consultation');
  const fallback = recommendations.length === 0;
  if (consultation && consultation.status === 'available' && audienceOk(consultation)) {
    recommendations.push({
      service: consultation,
      via: matches.map((m) => m.concern),
      score: 0,
      reason: fallback
        ? "We couldn't be sure which service fits from what you've shared — and that's completely fine. A short first conversation with a counsellor is the best place to start."
        : 'Not sure which option fits? A short first conversation can help you decide together.',
    });
  }

  return { concerns: matches, recommendations, referrals, fallback };
}
