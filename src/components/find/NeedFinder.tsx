import React, { useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { CONCERNS, CONCERN_GROUPS, concernsInGroup, getConcern } from '../../data/concerns';
import type { ConcernGroupId } from '../../data/types';
import { recommend, type MatchResult } from '../../domain/matching';
import { screenForRisk } from '../../domain/safety';
import { validateNeed } from '../../domain/booking/validation';
import { ServiceCard } from '../services/ServiceCard';
import { CrisisContacts } from '../layout/UrgentHelp';
import { Button } from '../ui/Button';
import { Alert, Chip } from '../ui/primitives';
import { Carousel } from '../ui/Carousel';
import Companion from '../characters/Companion';
import { cn } from '../../lib/cn';

const EXAMPLE_PROMPTS = [
  "I've been feeling overwhelmed at work.",
  "I'm grieving and struggling to move forward.",
  'I want help with my relationship with alcohol.',
  'My partner and I need help communicating.',
  "I'm struggling with anxiety and sleep.",
  "I'm not sure what kind of support I need.",
];

type Outcome = { kind: 'idle' } | { kind: 'risk' } | { kind: 'results'; result: MatchResult; text: string };

/**
 * Natural-language service search. Everything runs in the browser: the text
 * is matched against Imela's catalogue and is not sent anywhere.
 */
export function NeedFinder({ initialText = '' }: { initialText?: string }) {
  const [text, setText] = useState(initialText);
  const [groups, setGroups] = useState<ConcernGroupId[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<Outcome>({ kind: 'idle' });
  const resultsRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  const run = (value: string, chosenGroups = groups, excluded = removed) => {
    const problem = chosenGroups.length ? null : validateNeed(value);
    if (problem) {
      setError(problem);
      setOutcome({ kind: 'idle' });
      return;
    }
    setError(null);
    if (screenForRisk(value)) {
      setOutcome({ kind: 'risk' });
      requestAnimationFrame(() => resultsRef.current?.focus());
      return;
    }
    const selected = chosenGroups.flatMap((g) => concernsInGroup(g).map((c) => c.slug)).filter((s) => !excluded.includes(s));
    // Removed areas are excluded before matching, so they no longer shape the options either.
    const result = recommend(value, { selectedConcerns: selected }, CONCERNS.filter((c) => !excluded.includes(c.slug)));
    setOutcome({ kind: 'results', result, text: value });
    requestAnimationFrame(() => resultsRef.current?.focus());
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRemoved([]);
    run(text, groups, []);
  };

  const showAnyway = () => {
    const result = recommend(text, {});
    setOutcome({ kind: 'results', result, text });
  };

  const toggleGroup = (id: ConcernGroupId) => setGroups((cur) => (cur.includes(id) ? cur.filter((g) => g !== id) : [...cur, id]));

  return (
    <div>
      <form onSubmit={onSubmit} noValidate className="rounded-[2rem] border-2 border-ink-strong bg-paper p-3 shadow-sticker sm:p-4">
        <label htmlFor={inputId} className="sr-only">
          Describe what you need, in your own words
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <textarea
            id={inputId}
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 1000))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            rows={2}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${inputId}-err` : `${inputId}-hint`}
            placeholder="I've been arguing with my partner and I don't know how to fix things…"
            className="min-h-[4.5rem] flex-1 resize-none border-0 bg-transparent px-3 py-2 text-lg text-ink-strong placeholder:text-ink-soft/70 focus:outline-none focus-visible:shadow-none"
          />
          <Button type="submit" size="lg" className="shrink-0">
            <Search className="h-4 w-4" aria-hidden /> Find Support
          </Button>
        </div>
        {error ? (
          <p id={`${inputId}-err`} className="px-3 pt-1 text-sm font-medium text-danger">
            {error}
          </p>
        ) : (
          <p id={`${inputId}-hint`} className="px-3 pt-1 text-xs text-ink-soft">
            What you type stays in your browser — it's matched against Imela's services and isn't sent or saved.
          </p>
        )}
      </form>

      <div className="mt-5">
        <p className="text-sm font-semibold text-ink-strong">Try an example</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setText(p);
                setRemoved([]);
                run(p, groups, []);
              }}
              className="rounded-pill border border-ink/15 bg-paper px-3.5 py-1.5 text-sm text-ink-strong hover:border-lavender-ink hover:bg-lavender-soft"
            >
              {p}
            </button>
          ))}
        </div>
        <p className="mt-5 text-sm font-semibold text-ink-strong">Or narrow by area (optional)</p>
        <div role="group" aria-label="Areas" className="mt-2 flex flex-wrap gap-2">
          {CONCERN_GROUPS.map((g) => {
            const on = groups.includes(g.id);
            return (
              <button
                key={g.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggleGroup(g.id)}
                className={cn('rounded-pill border px-3.5 py-1.5 text-sm font-medium transition-colors', on ? 'border-ink-strong bg-ink-strong text-ivory' : 'border-ink/15 bg-paper hover:bg-ink/5')}
              >
                {g.title}
              </button>
            );
          })}
        </div>
      </div>

      <div ref={resultsRef} tabIndex={-1} aria-live="polite" className="mt-10 focus:outline-none">
        {outcome.kind === 'risk' && (
          <div role="alert" className="rounded-card border-2 border-rose/40 bg-rose-soft/60 p-5 sm:p-7">
            <p className="font-display text-display-sm">Your safety comes first.</p>
            <p className="mt-2 max-w-2xl text-ink">
              From what you've written, you may be going through something very serious. If you're in danger or thinking about ending your life, please reach out to
              people who can help right now.
            </p>
            <CrisisContacts className="mt-5" />
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button variant="outline" size="sm" onClick={showAnyway}>
                I'm safe right now — show support options
              </Button>
            </div>
          </div>
        )}

        {outcome.kind === 'results' && (
          <section aria-labelledby="finder-results">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 id="finder-results" className="font-display text-display-sm">
                  {outcome.result.fallback ? "Let's start with a conversation" : 'Options that may fit'}
                </h2>
                {outcome.result.concerns.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-ink-soft">This may relate to — remove anything that doesn't fit:</p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {outcome.result.concerns.map(({ concern }) => (
                        <li key={concern.slug}>
                          <Chip tone="lavender" className="pr-1.5">
                            <Link to={`/support/${concern.slug}`} className="hover:underline">
                              {concern.title}
                            </Link>
                            <button
                              type="button"
                              aria-label={`Remove ${concern.title}`}
                              className="ml-1 rounded-full p-0.5 hover:bg-lavender"
                              onClick={() => {
                                const next = [...removed, concern.slug];
                                setRemoved(next);
                                run(outcome.text, groups, next);
                              }}
                            >
                              <X className="h-3 w-3" aria-hidden />
                            </button>
                          </Chip>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 rounded-card bg-lavender-soft p-3 pr-5">
                <Companion variant="drift" mood="curious" tone="sage" size={56} />
                <p className="text-sm">
                  Prefer to talk it through?{' '}
                  <Link to="/persona/explore?path=find" className="font-semibold text-lavender-ink underline underline-offset-2">
                    Try Imela Persona
                  </Link>
                </p>
              </div>
            </div>

            <Carousel
              label="Options that may fit"
              className="mt-6"
              gridFrom="md"
              gridClassName="md:grid-cols-2 md:gap-4 xl:grid-cols-3"
              slideClassName="w-[86%] sm:w-[60%]"
            >
              {outcome.result.recommendations.map((r) => (
                // `relative` keeps the card's visually-hidden labels inside the scrolling track.
                <div key={r.service.id} className="relative">
                  <ServiceCard service={r.service} reason={r.reason} via="finder" className="h-full" />
                </div>
              ))}
            </Carousel>

            {outcome.result.referrals.length > 0 && (
              <Alert tone="info" className="mt-4" title="Specialist support outside Imela">
                {outcome.result.referrals.map((s) => s.name).join(', ')} need specialist clinicians. A counsellor can talk with you about where to go.
              </Alert>
            )}
            {outcome.result.concerns.some(({ concern }) => getConcern(concern.slug)?.safetyNote) && (
              <p className="mt-4 text-sm text-ink-soft">If things ever feel unsafe, “Need urgent help?” at the top of every page lists emergency contacts.</p>
            )}
            <p className="mt-4 text-xs text-ink-soft">Suggestions come from Imela's own service list. They're a starting point, not an assessment or diagnosis.</p>
          </section>
        )}
      </div>
    </div>
  );
}
