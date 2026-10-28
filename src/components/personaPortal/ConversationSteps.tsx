import { useState } from 'react';
import { Check } from 'lucide-react';
import { PORTAL_CONCERNS, SUPPORT_LABEL, type PortalConcern, type PreferredSupport } from '../../domain/personaPortal/types';
import { STORY_LIMIT } from '../../domain/personaPortal/api';
import { screenForRisk } from '../../domain/safety';
import { CrisisContacts } from '../layout/UrgentHelp';
import { Alert } from '../ui/primitives';
import { Button } from '../ui/Button';
import { PrivacyLimits, StepActions, StepHeading } from './shared';
import { cn } from '../../lib/cn';

/** Step: choose one or more support areas. */
export function ConcernStep({
  value,
  onChange,
  onNext,
  onBack,
}: {
  value: PortalConcern[];
  onChange: (next: PortalConcern[]) => void;
  onNext: () => void;
  onBack?: () => void;
}) {
  const [error, setError] = useState(false);
  const toggle = (id: PortalConcern) => {
    setError(false);
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };

  return (
    <div>
      <StepHeading eyebrow="What would you like support with?">Choose what feels closest</StepHeading>
      <p className="mt-3 text-ink-soft">Pick as many as you like. These are support areas to help us find the right counsellor — not diagnoses.</p>
      <fieldset className="mt-6 min-w-0">
        <legend className="sr-only">Support areas</legend>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {PORTAL_CONCERNS.map((c) => {
            const on = value.includes(c.id);
            return (
              <label
                key={c.id}
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3.5 text-[0.98rem] font-semibold transition-colors',
                  on ? 'border-ink-strong bg-lavender text-ink-strong' : 'border-line/15 bg-paper text-ink-strong hover:border-lavender-ink'
                )}
              >
                <input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(c.id)} />
                {c.label}
                <span className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-full border-2', on ? 'border-ink-strong bg-ink-strong text-ivory' : 'border-line/30')} aria-hidden>
                  {on && <Check className="h-3.5 w-3.5" />}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-danger">
          Please choose at least one area — “Other / not sure yet” is fine.
        </p>
      )}
      <StepActions>
        {onBack && (
          <Button variant="ghost" onClick={onBack}>
            Back
          </Button>
        )}
        <Button
          onClick={() => {
            if (value.length === 0) {
              setError(true);
              return;
            }
            onNext();
          }}
        >
          {value.length === 0 ? 'Choose at least one' : `Continue · ${value.length} chosen`}
        </Button>
      </StepActions>
    </div>
  );
}

/** Step: optional story + preferred kind of support. */
export function StoryStep({
  story,
  onStory,
  support,
  onSupport,
  onBack,
  onSubmit,
  submitting,
  error,
}: {
  story: string;
  onStory: (s: string) => void;
  support: PreferredSupport;
  onSupport: (s: PreferredSupport) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  error?: string | null;
}) {
  const risk = screenForRisk(story);
  return (
    <div>
      <StepHeading eyebrow="In your own words">Share as much or as little as you like</StepHeading>
      <p className="mt-3 text-ink-soft">This is optional. You can also just send your support areas and say more once a counsellor replies.</p>

      <label htmlFor="persona-story" className="mt-6 block text-sm font-semibold text-ink-strong">
        What's been happening? <span className="font-normal text-ink-soft">(optional)</span>
      </label>
      <textarea
        id="persona-story"
        value={story}
        onChange={(e) => onStory(e.target.value.slice(0, STORY_LIMIT))}
        rows={7}
        aria-describedby="persona-story-count"
        className="mt-1.5 w-full rounded-2xl border border-line/20 bg-paper px-4 py-3 text-[1rem] text-ink-strong placeholder:text-ink-soft/70 focus:border-lavender-ink focus:outline-none focus:ring-2 focus:ring-lavender-ink/30"
        placeholder="There's no right way to say it."
      />
      <p id="persona-story-count" className="mt-1 text-right text-xs text-ink-soft">
        {story.length.toLocaleString()} / {STORY_LIMIT.toLocaleString()}
      </p>

      {risk && (
        <div role="alert" className="mt-4 rounded-card border-2 border-rose/40 bg-rose-soft/60 p-4 sm:p-5">
          <p className="font-semibold text-ink-strong">If you're in danger or thinking about ending your life, please reach out for immediate help now.</p>
          <CrisisContacts className="mt-3" compact />
          <p className="mt-3 text-sm text-ink">
            You can still send this. It will be flagged so a counsellor reviews it as a priority — but Imela isn't an emergency service and can't respond
            immediately.
          </p>
        </div>
      )}

      <fieldset className="mt-6 min-w-0">
        <legend className="text-sm font-semibold text-ink-strong">What kind of support would you prefer?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {(Object.keys(SUPPORT_LABEL) as PreferredSupport[]).map((k) => (
            <label
              key={k}
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium',
                support === k ? 'border-ink-strong bg-paper shadow-soft' : 'border-line/15 bg-paper/60'
              )}
            >
              <input type="radio" name="preferred-support" className="h-4 w-4 accent-[#2A2623]" checked={support === k} onChange={() => onSupport(k)} />
              {SUPPORT_LABEL[k]}
            </label>
          ))}
        </div>
      </fieldset>

      <details className="mt-6 rounded-2xl bg-paper/80 p-4 shadow-soft">
        <summary className="cursor-pointer text-sm font-semibold text-ink-strong">Before you send: who will see this?</summary>
        <div className="mt-3">
          <PrivacyLimits compact />
        </div>
      </details>

      {error && (
        <Alert tone="danger" className="mt-5" live>
          {error}
        </Alert>
      )}

      <StepActions>
        <Button variant="ghost" onClick={onBack} disabled={submitting}>
          Back
        </Button>
        <Button variant="accent" onClick={onSubmit} disabled={submitting}>
          {submitting ? 'Sending…' : 'Send to a counsellor'}
        </Button>
      </StepActions>
    </div>
  );
}
