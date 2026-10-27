import { useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Lock, RotateCcw } from 'lucide-react';
import { buttonClasses, Button } from '../ui/Button';
import { cn } from '../../lib/cn';
import { screenForRisk } from '../../domain/safety';
import { CrisisContacts } from '../layout/UrgentHelp';
import Companion from '../characters/Companion';
import type { CharacterTheme } from '../../data/types';

/**
 * An optional, private reflection exercise. Answers live only in component
 * memory: nothing is stored, logged or sent, and leaving the page clears it.
 * There is no scoring and no interpretation — it simply hands the person's
 * own words back to them with a gentle next step.
 */
export function PrivateCheckIn({
  reflections,
  character,
  accent,
  startCollapsed = false,
}: {
  reflections: string[];
  character: CharacterTheme;
  accent: string;
  startCollapsed?: boolean;
}) {
  const [open, setOpen] = useState(!startCollapsed);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(() => reflections.map(() => ''));
  const [done, setDone] = useState(false);
  const fieldId = useId();

  const risk = useMemo(() => answers.some((a) => screenForRisk(a)), [answers]);
  const answered = answers.filter((a) => a.trim()).length;

  const reset = () => {
    setAnswers(reflections.map(() => ''));
    setStep(0);
    setDone(false);
  };

  return (
    <div className={cn('overflow-hidden rounded-blob border border-line/10', accent)}>
      <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-center gap-4">
          <Companion variant={character.variant} mood="calm" pose="hold" hold="lantern" tone={character.tone} size={72} />
          <div>
            <p className="eyebrow">A quiet moment</p>
            <h2 className="font-display text-display-sm">A private check-in</h2>
            <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-ink">
              <Lock className="h-3.5 w-3.5" aria-hidden /> Just for you — nothing here is saved or sent.
            </p>
          </div>
        </div>
        {!open && (
          <Button variant="primary" onClick={() => setOpen(true)} aria-expanded={false}>
            Begin when you're ready
          </Button>
        )}
      </div>

      {open && (
        <div className="border-t border-line/10 bg-paper/80 p-6 sm:p-8">
          {!done ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (step < reflections.length - 1) setStep(step + 1);
                else setDone(true);
              }}
            >
              <p className="text-sm font-semibold text-ink-soft" aria-live="polite">
                Question {step + 1} of {reflections.length} · answer, skip or stop at any time
              </p>
              <label htmlFor={`${fieldId}-${step}`} className="mt-3 block font-display text-display-sm text-ink-strong">
                {reflections[step]}
              </label>
              <textarea
                id={`${fieldId}-${step}`}
                key={step}
                value={answers[step]}
                onChange={(e) => setAnswers((prev) => prev.map((a, i) => (i === step ? e.target.value.slice(0, 1000) : a)))}
                autoComplete="off"
                spellCheck
                rows={4}
                placeholder="Write as much or as little as you like…"
                className="mt-4 w-full resize-y rounded-2xl border border-line/20 bg-paper px-4 py-3 text-[0.98rem] text-ink-strong placeholder:text-ink-soft/70 focus:border-lavender-ink focus:outline-none focus:ring-2 focus:ring-lavender-ink/30"
              />
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {step > 0 && (
                  <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)}>
                    <ArrowLeft className="h-4 w-4" aria-hidden /> Back
                  </Button>
                )}
                <Button type="submit" size="sm">
                  {step < reflections.length - 1 ? 'Next' : 'Finish'} <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
                {step < reflections.length - 1 && (
                  <Button variant="ghost" size="sm" onClick={() => setStep(step + 1)}>
                    Skip this one
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setDone(true)}>
                  Stop here
                </Button>
              </div>
            </form>
          ) : (
            <div aria-live="polite">
              <h3 className="font-display text-display-sm">Thank you for taking that moment.</h3>
              <p className="mt-2 max-w-2xl text-ink">
                {answered > 0
                  ? 'Here is what you wrote, in your own words. Putting things into words can make them a little easier to look at — there are no right or wrong answers.'
                  : "That's completely okay. Sometimes just reading the questions is enough for now."}
              </p>
              {answered > 0 && (
                <ul className="mt-5 space-y-3">
                  {reflections.map((q, i) =>
                    answers[i].trim() ? (
                      <li key={q} className="rounded-2xl bg-ivory px-4 py-3">
                        <p className="text-xs font-semibold text-ink-soft">{q}</p>
                        <p className="mt-1 whitespace-pre-wrap font-hand text-2xl leading-snug text-ink-strong">{answers[i]}</p>
                      </li>
                    ) : null
                  )}
                </ul>
              )}

              {risk && (
                <div className="mt-6 rounded-2xl border border-rose/30 bg-rose-soft/60 p-5">
                  <p className="font-semibold text-rose-ink">Some of what you wrote sounds really painful.</p>
                  <p className="mt-1 text-sm text-ink">If you might not be safe right now, please reach out to someone who can help immediately.</p>
                  <CrisisContacts className="mt-4" compact />
                </div>
              )}

              <p className="mt-6 font-semibold text-ink-strong">If you'd like a next step:</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link to="/persona" className={buttonClasses('accent', 'sm')}>
                  Talk it through in Persona
                </Link>
                <Link to="/book?service=consultation&via=concern" className={buttonClasses('primary', 'sm')}>
                  Book an initial consultation
                </Link>
                <Button variant="ghost" size="sm" onClick={reset}>
                  <RotateCcw className="h-4 w-4" aria-hidden /> Clear what I wrote
                </Button>
              </div>
              <p className="mt-4 text-xs text-ink-soft">Your answers disappear when you leave this page. They are not attached to any booking.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
