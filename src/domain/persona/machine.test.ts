import { describe, expect, it } from 'vitest';
import { initialPersonaState, personaReducer, type PersonaAction, type PersonaState } from './machine';
import { SERVICES } from '../../data/services';

const run = (...actions: PersonaAction[]) => actions.reduce<PersonaState>(personaReducer, initialPersonaState);
const last = (s: PersonaState) => s.messages[s.messages.length - 1];

describe('Persona state machine', () => {
  it('opens with the agreed greeting', () => {
    const s = run({ type: 'start', path: 'talk' });
    expect(s.step).toBe('awaiting_need');
    expect(last(s).text).toBe("Hi. I'm glad you made it here. What's been weighing on you lately?");
  });

  it('reflects understanding and asks for confirmation instead of diagnosing', () => {
    const s = run({ type: 'start', path: 'talk' }, { type: 'say', text: "I've been arguing with my partner a lot" });
    expect(s.step).toBe('awaiting_confirmation');
    const msg = last(s);
    expect(msg.kind).toBe('reflection');
    expect(msg.text).toMatch(/Have I understood that right\?/);
    expect(msg.text).not.toMatch(/diagnos|you have|disorder/i);
  });

  it('asks at most one clarifying question, then recommends grounded options', () => {
    let s = run({ type: 'start', path: 'talk' }, { type: 'say', text: "I've been arguing with my partner a lot" }, { type: 'confirm', answer: 'yes' });
    expect(s.step).toBe('awaiting_clarification');
    s = personaReducer(s, { type: 'clarify', optionId: 'together' });
    expect(s.step).toBe('recommendations');
    expect(s.result?.recommendations[0].service.id).toBe('couples-therapy');
    expect(s.clarificationAsked).toBe(true);
  });

  it('lets the person correct the interpretation', () => {
    let s = run({ type: 'start', path: 'talk' }, { type: 'say', text: "I've been arguing with my partner a lot" }, { type: 'confirm', answer: 'no' });
    expect(s.step).toBe('awaiting_correction');
    expect(s.interpretation?.confirmed).toBe(false);
    s = personaReducer(s, { type: 'choose_concerns', slugs: ['anger-regulation'] });
    expect(s.selectedConcerns[0]).toBe('anger-regulation');
  });

  it('keeps statements separate from interpretations', () => {
    const s = run({ type: 'start', path: 'talk' }, { type: 'say', text: 'My mum died in June' });
    expect(s.statements).toEqual(['My mum died in June']);
    expect(s.interpretation?.confirmed).toBeNull();
    expect(s.selectedConcerns).toEqual([]);
  });

  it('stops the ordinary flow when someone may be at risk', () => {
    const s = run({ type: 'start', path: 'talk' }, { type: 'say', text: "I don't want to live anymore" });
    expect(s.step).toBe('safety');
    expect(last(s).kind).toBe('safety');
    expect(s.result).toBeNull();
    const ignored = personaReducer(s, { type: 'say', text: 'hello?' });
    expect(ignored.step).toBe('safety');
  });

  it('continues gently once the person says they are safe', () => {
    const s = run({ type: 'start', path: 'talk' }, { type: 'say', text: "I don't want to live anymore" }, { type: 'safety', safe: true });
    expect(s.step).toBe('awaiting_more');
    expect(s.safety?.resolved).toBe('safe');
  });

  it('falls back to a human consultation after two unclear messages', () => {
    const s = run({ type: 'start', path: 'talk' }, { type: 'say', text: 'hmm' }, { type: 'say', text: 'idk' });
    expect(s.step).toBe('recommendations');
    expect(s.result?.fallback).toBe(true);
    expect(s.result?.recommendations[0].service.id).toBe('consultation');
  });

  it('supports the feelings path', () => {
    const s = run({ type: 'start', path: 'feelings' }, { type: 'feelings', ids: ['overwhelmed', 'exhausted'] });
    expect(s.step).toBe('awaiting_more');
    expect(s.selectedConcerns.length).toBeGreaterThan(0);
  });

  it('never recommends services that are not available', () => {
    const s = run({ type: 'start', path: 'find' }, { type: 'say', text: 'I drink too much' }, { type: 'confirm', answer: 'yes' });
    const statusOf = (id: string) => SERVICES.find((x) => x.id === id)?.status;
    for (const r of s.result?.recommendations ?? []) expect(statusOf(r.service.id)).toBe('available');
  });

  it('reset clears everything the person typed', () => {
    const s = run({ type: 'start', path: 'talk' }, { type: 'say', text: 'something private' }, { type: 'reset' });
    expect(s).toEqual(initialPersonaState);
  });
});
