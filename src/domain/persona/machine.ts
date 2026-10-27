import { getConcern, getGroup } from '../../data/concerns';
import type { Concern, ConcernGroupId } from '../../data/types';
import { matchConcerns, recommend, type MatchContext, type MatchResult } from '../matching';
import { screenForRisk, RISK_MESSAGE, type RiskKind } from '../safety';
import * as S from './script';

/**
 * Imela conversation model.
 *
 * The state keeps four kinds of information strictly apart:
 *  - `statements`: what the person actually said (memory only, never persisted)
 *  - `interpretation`: Persona's automated reading, always marked as such
 *  - `selectedConcerns`: areas the person explicitly chose or confirmed
 *  - `result`: service recommendations grounded in the verified catalogue
 * No part of this is a diagnosis or clinical assessment.
 */

export type PersonaPath = 'talk' | 'feelings' | 'find';
export type PersonaStep =
  | 'entry'
  | 'awaiting_need'
  | 'awaiting_feelings'
  | 'awaiting_confirmation'
  | 'awaiting_correction'
  | 'awaiting_more'
  | 'awaiting_clarification'
  | 'recommendations'
  | 'safety'
  | 'closed';

export type PersonaMessage =
  | { id: string; from: 'persona'; kind: 'text'; text: string }
  | { id: string; from: 'persona'; kind: 'reflection'; text: string; concernSlugs: string[] }
  | { id: string; from: 'persona'; kind: 'recommendations'; text: string; result: MatchResult }
  | { id: string; from: 'persona'; kind: 'safety'; text: string; risk: RiskKind }
  | { id: string; from: 'persona'; kind: 'ai'; text: string }
  | { id: string; from: 'person'; kind: 'text'; text: string };

export interface Interpretation {
  concernSlugs: string[];
  matched: string[];
  confirmed: boolean | null;
}

export interface PersonaState {
  path: PersonaPath | null;
  step: PersonaStep;
  messages: PersonaMessage[];
  statements: string[];
  interpretation: Interpretation | null;
  selectedConcerns: string[];
  prefer: NonNullable<MatchContext['prefer']>;
  audience: MatchContext['audience'];
  result: MatchResult | null;
  safety: { kind: RiskKind; resolved: 'safe' | 'not_safe' | null } | null;
  noMatchCount: number;
  clarificationAsked: boolean;
  seq: number;
}

export type PersonaAction =
  | { type: 'start'; path: PersonaPath }
  /** `aiNote` is an optional AI reflection fetched only after screenForRisk passed. */
  | { type: 'say'; text: string; aiNote?: string | null }
  | { type: 'confirm'; answer: 'yes' | 'no' | 'more' }
  | { type: 'choose_concerns'; slugs: string[] }
  | { type: 'clarify'; optionId: string | null }
  | { type: 'feelings'; ids: string[] }
  | { type: 'safety'; safe: boolean }
  | { type: 'finish' }
  | { type: 'reset' };

export const initialPersonaState: PersonaState = {
  path: null,
  step: 'entry',
  messages: [],
  statements: [],
  interpretation: null,
  selectedConcerns: [],
  prefer: {},
  audience: undefined,
  result: null,
  safety: null,
  noMatchCount: 0,
  clarificationAsked: false,
  seq: 0,
};

type Draft = PersonaState;
type NewMessage = PersonaMessage extends infer M ? (M extends PersonaMessage ? Omit<M, 'id'> : never) : never;

function push(state: Draft, msg: NewMessage): Draft {
  const seq = state.seq + 1;
  return { ...state, seq, messages: [...state.messages, { ...msg, id: `m${seq}` } as PersonaMessage] };
}

function groupOf(slug: string | undefined): ConcernGroupId | undefined {
  return slug ? getConcern(slug)?.group : undefined;
}

function list(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

export function buildReflection(concerns: Concern[], matched: string[]): string {
  const lead = concerns[0];
  const group = lead.group;
  // Echo the person's most specific phrase back to them.
  const echo = [...matched].filter((m) => m.length > 3 && m !== lead.title.toLowerCase()).sort((a, b) => b.length - a.length)[0];
  const opener = echo ? `Thank you for sharing that. When you mention “${echo}”, it sounds like ${S.GROUP_REFLECTION[group]}.` : `Thank you for sharing that. It sounds like ${S.GROUP_REFLECTION[group]}.`;
  const areas = list(concerns.slice(0, 2).map((c) => c.title.toLowerCase()));
  return `${opener} ${S.GROUP_VALIDATION[group]} The closest area${concerns.length > 1 ? 's' : ''} I can see ${concerns.length > 1 ? 'are' : 'is'} ${areas}. Have I understood that right?`;
}

function interpretText(state: Draft): Draft {
  const text = state.statements.join('\n');
  const matches = matchConcerns(text, undefined, state.selectedConcerns).slice(0, 2);

  if (matches.length === 0) {
    const noMatchCount = state.noMatchCount + 1;
    if (noMatchCount >= 2) return toRecommendations(push({ ...state, noMatchCount }, { from: 'persona', kind: 'text', text: S.NO_MATCH_FINAL }), false);
    return push({ ...state, noMatchCount, step: 'awaiting_need' }, { from: 'persona', kind: 'text', text: S.NO_MATCH_FIRST });
  }

  const concerns = matches.map((m) => m.concern);
  const matched = matches.flatMap((m) => m.matched);
  const next: Draft = {
    ...state,
    step: 'awaiting_confirmation',
    interpretation: { concernSlugs: concerns.map((c) => c.slug), matched, confirmed: null },
  };
  return push(next, { from: 'persona', kind: 'reflection', text: buildReflection(concerns, matched), concernSlugs: concerns.map((c) => c.slug) });
}

function toClarificationOrRecommendations(state: Draft): Draft {
  const lead = groupOf(state.selectedConcerns[0] ?? state.interpretation?.concernSlugs[0]);
  const clarification = lead ? S.CLARIFICATIONS[lead] : undefined;
  if (clarification && !state.clarificationAsked) {
    return push({ ...state, step: 'awaiting_clarification', clarificationAsked: true }, { from: 'persona', kind: 'text', text: clarification.question });
  }
  return toRecommendations(state, true);
}

function toRecommendations(state: Draft, withIntro: boolean): Draft {
  const result = recommend(state.statements.join('\n'), {
    selectedConcerns: state.selectedConcerns,
    prefer: state.prefer,
    audience: state.audience,
  });
  const next = push(
    { ...state, step: 'recommendations', result },
    { from: 'persona', kind: 'recommendations', text: withIntro ? S.RECOMMENDATIONS_INTRO : '', result }
  );
  return push(next, { from: 'persona', kind: 'text', text: S.AFTER_RECOMMENDATIONS });
}

function applyClarification(state: Draft, optionId: string): Draft {
  const prefer = { ...state.prefer };
  let audience = state.audience;
  const selected = [...state.selectedConcerns];
  switch (optionId) {
    case 'just-me':
    case 'one-to-one':
    case 'me':
      prefer.together = false;
      audience = audience ?? 'individual';
      break;
    case 'together':
      prefer.together = true;
      break;
    case 'family':
      prefer.family = true;
      if (!selected.includes('family-conflict')) selected.push('family-conflict');
      break;
    case 'teen':
      prefer.forTeen = true;
      if (!selected.includes('adolescent-wellbeing')) selected.push('adolescent-wellbeing');
      break;
    case 'group':
      prefer.group = true;
      break;
    case 'organisation':
      audience = 'organisation';
      break;
    default:
      break;
  }
  return { ...state, prefer, audience, selectedConcerns: selected };
}

export function personaReducer(state: PersonaState, action: PersonaAction): PersonaState {
  switch (action.type) {
    case 'reset':
      return initialPersonaState;

    case 'start': {
      const base: Draft = { ...initialPersonaState, path: action.path };
      if (action.path === 'feelings') return push({ ...base, step: 'awaiting_feelings' }, { from: 'persona', kind: 'text', text: S.OPENING_FEELINGS });
      if (action.path === 'find') return push({ ...base, step: 'awaiting_need' }, { from: 'persona', kind: 'text', text: S.OPENING_FIND });
      return push({ ...base, step: 'awaiting_need' }, { from: 'persona', kind: 'text', text: S.OPENING });
    }

    case 'say': {
      const text = action.text.trim().slice(0, 1000);
      if (!text || state.step === 'closed' || state.step === 'entry') return state;
      let next = push({ ...state, statements: [...state.statements, text] }, { from: 'person', kind: 'text', text });

      const risk = screenForRisk(text);
      if (risk) {
        next = { ...next, step: 'safety', safety: { kind: risk.kind, resolved: null } };
        return push(next, { from: 'persona', kind: 'safety', text: `${RISK_MESSAGE[risk.kind]} Are you safe right now?`, risk: risk.kind });
      }

      if (action.aiNote) next = push(next, { from: 'persona', kind: 'ai', text: action.aiNote.slice(0, 800) });

      if (state.step === 'awaiting_clarification') return toRecommendations(next, true);
      if (state.step === 'safety') return next; // composer is disabled in this step; ignore defensively
      return interpretText(next);
    }

    case 'confirm': {
      if (state.step !== 'awaiting_confirmation' || !state.interpretation) return state;
      const label = { yes: "Yes, that's it", no: 'Not quite', more: "There's more" }[action.answer];
      let next = push(state, { from: 'person', kind: 'text', text: label });
      if (action.answer === 'yes') {
        const slugs = state.interpretation.concernSlugs.filter((s) => !state.selectedConcerns.includes(s));
        next = { ...next, interpretation: { ...state.interpretation, confirmed: true }, selectedConcerns: [...state.selectedConcerns, ...slugs] };
        return toClarificationOrRecommendations(next);
      }
      if (action.answer === 'no') {
        next = { ...next, interpretation: { ...state.interpretation, confirmed: false } };
        return push({ ...next, step: 'awaiting_correction' }, { from: 'persona', kind: 'text', text: S.ASK_CORRECTION });
      }
      return push({ ...next, step: 'awaiting_more' }, { from: 'persona', kind: 'text', text: S.ASK_MORE });
    }

    case 'choose_concerns': {
      const concerns = action.slugs.map((s) => getConcern(s)).filter((c): c is Concern => Boolean(c));
      if (concerns.length === 0) return state;
      let next = push(state, { from: 'person', kind: 'text', text: `Closer to: ${list(concerns.map((c) => c.title))}` });
      next = {
        ...next,
        selectedConcerns: [...new Set([...concerns.map((c) => c.slug), ...state.selectedConcerns])],
        interpretation: { concernSlugs: concerns.map((c) => c.slug), matched: [], confirmed: true },
        noMatchCount: 0,
      };
      return toClarificationOrRecommendations(next);
    }

    case 'clarify': {
      if (state.step !== 'awaiting_clarification') return state;
      if (action.optionId === null) return toRecommendations(push(state, { from: 'person', kind: 'text', text: 'Skip this question' }), true);
      const lead = groupOf(state.selectedConcerns[0] ?? state.interpretation?.concernSlugs[0]);
      const option = lead ? S.CLARIFICATIONS[lead]?.options.find((o) => o.id === action.optionId) : undefined;
      const next = push(applyClarification(state, action.optionId), { from: 'person', kind: 'text', text: option?.label ?? action.optionId });
      return toRecommendations(next, true);
    }

    case 'feelings': {
      if (state.step !== 'awaiting_feelings') return state;
      const feelings = S.FEELINGS.filter((f) => action.ids.includes(f.id));
      if (feelings.length === 0) return push({ ...state, step: 'awaiting_need' }, { from: 'persona', kind: 'text', text: S.OPENING });
      let next = push(state, { from: 'person', kind: 'text', text: `I'm feeling: ${list(feelings.map((f) => f.label.toLowerCase()))}` });
      const slugs = [...new Set(feelings.flatMap((f) => f.concerns))].slice(0, 3);
      const concerns = slugs.map((s) => getConcern(s)).filter((c): c is Concern => Boolean(c));
      const group = concerns[0] ? getGroup(concerns[0].group) : undefined;
      const names = list(feelings.map((f) => f.label.toLowerCase()));
      let text = `Thank you for naming those. Feeling ${names} is something many people describe${group ? ` when ${S.GROUP_REFLECTION[group.id]}` : ''}. None of it means something is wrong with you.`;
      if (feelings.some((f) => f.id === 'hopeless' || f.id === 'unsafe' || f.id === 'numb')) text += ` ${S.HOPELESS_NOTE}`;
      text += ' Would you like to tell me a little about what has been happening? Or I can show you some options now.';
      next = { ...next, interpretation: { concernSlugs: concerns.map((c) => c.slug), matched: [], confirmed: null }, selectedConcerns: concerns.map((c) => c.slug) };
      return push({ ...next, step: 'awaiting_more' }, { from: 'persona', kind: 'reflection', text, concernSlugs: concerns.map((c) => c.slug) });
    }

    case 'safety': {
      if (state.step !== 'safety' || !state.safety) return state;
      if (action.safe) {
        const next = push(
          { ...state, safety: { ...state.safety, resolved: 'safe' }, step: 'awaiting_more' },
          { from: 'person', kind: 'text', text: "I'm safe right now" }
        );
        return push(next, { from: 'persona', kind: 'text', text: S.SAFE_CONTINUE });
      }
      const next = push({ ...state, safety: { ...state.safety, resolved: 'not_safe' } }, { from: 'person', kind: 'text', text: "I'm not safe" });
      return push(next, { from: 'persona', kind: 'safety', text: S.NOT_SAFE, risk: state.safety.kind });
    }

    case 'finish':
      return push({ ...state, step: 'closed' }, { from: 'persona', kind: 'text', text: S.CLOSING });

    default:
      return state;
  }
}

/** Which free-text input is meaningful in each step. */
export function composerEnabled(state: PersonaState): boolean {
  return !['entry', 'safety', 'closed'].includes(state.step) || (state.step === 'safety' && state.safety?.resolved === 'safe');
}

/** "awaiting_more" after feelings can jump straight to options. */
export function canShowOptionsNow(state: PersonaState): boolean {
  return state.step === 'awaiting_more' && state.selectedConcerns.length > 0;
}

export function showOptionsNow(state: PersonaState): PersonaState {
  return toRecommendations(state, true);
}
