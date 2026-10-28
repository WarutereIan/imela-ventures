import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, EyeOff, LifeBuoy, ShieldCheck, UserRoundX } from 'lucide-react';
import { createCase, portalAvailable, registerPersona, signInPersona, type NewPersona } from '../../../domain/personaPortal/api';
import type { PortalConcern, PreferredSupport } from '../../../domain/personaPortal/types';
import { CredentialCard, PrivacyLimits, StepActions, StepHeading } from '../../../components/personaPortal/shared';
import { ConcernStep, StoryStep } from '../../../components/personaPortal/ConversationSteps';
import { createCaseErrorMessage } from '../../../components/personaPortal/text';
import { Alert } from '../../../components/ui/primitives';
import { Button, buttonClasses } from '../../../components/ui/Button';
import Companion from '../../../components/characters/Companion';
import { useDocumentTitle } from '../../../lib/useDocumentTitle';
import { cn } from '../../../lib/cn';

type Step = 'consent' | 'credentials' | 'concerns' | 'story' | 'done';
const ORDER: Step[] = ['consent', 'credentials', 'concerns', 'story', 'done'];
const LABELS = ['Privacy', 'Your ID', 'Support', 'Your words', 'Sent'];

function Progress({ step }: { step: Step }) {
  const current = ORDER.indexOf(step);
  return (
    <div>
      <ol className="flex items-center gap-1.5" aria-hidden>
        {ORDER.map((s, i) => (
          <li key={s} className={cn('h-1.5 flex-1 rounded-full transition-colors duration-calm', i <= current ? 'bg-lavender-ink' : 'bg-ink/10')} />
        ))}
      </ol>
      <p className="mt-2 text-xs font-semibold text-ink-soft">
        Step {current + 1} of {ORDER.length} · {LABELS[current]}
      </p>
    </div>
  );
}

const REGISTER_ERRORS: Record<string, string> = {
  rate_limited: 'Too many new Persona IDs have been requested from this connection. Please try again a little later.',
  unavailable: 'Anonymous counselling is not available right now. Please try again later.',
  network: "We couldn't reach Imela. Please check your connection and try again.",
  failed: 'Something went wrong while creating your Persona ID. Nothing was created — please try again.',
};

/**
 * Create a Persona ID → save the recovery secret → choose support areas →
 * optional story → sent. Everything lives in component memory; nothing is
 * written to browser storage or the URL.
 */
export default function CreatePersonaPage() {
  useDocumentTitle('Get a Persona ID');
  const [step, setStep] = useState<Step>('consent');
  const [agreed, setAgreed] = useState(false);
  const [persona, setPersona] = useState<NewPersona | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [concerns, setConcerns] = useState<PortalConcern[]>([]);
  const [story, setStory] = useState('');
  const [support, setSupport] = useState<PreferredSupport>('not_sure');
  const [caseId, setCaseId] = useState<string | null>(null);

  // Each step starts at the top, not wherever the last button was.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  if (!portalAvailable) {
    return (
      <div className="shell py-16">
        <h1 className="mb-6 font-display text-display-md">Get your Persona ID</h1>
        <Alert tone="info" title="Anonymous counselling is being set up">
          You can{' '}
          <Link to="/persona/explore" className="font-semibold underline">
            explore privately
          </Link>{' '}
          now, or{' '}
          <Link to="/book?service=consultation" className="font-semibold underline">
            book a consultation
          </Link>
          .
        </Alert>
      </div>
    );
  }

  const create = async () => {
    setBusy(true);
    setError(null);
    const res = await registerPersona();
    setBusy(false);
    if (!res.ok) {
      setError(REGISTER_ERRORS[res.reason] ?? REGISTER_ERRORS.failed);
      return;
    }
    setPersona(res.data);
    setStep('credentials');
  };

  const confirmSaved = async () => {
    if (!persona) return;
    if (!saved) {
      setConfirmError('Copy or download your recovery secret first, or tick the box once you have written it down.');
      return;
    }
    setConfirmError(null);
    setBusy(true);
    const res = await signInPersona(persona.personaCode, persona.recoverySecret, false);
    setBusy(false);
    if (!res.ok) {
      setConfirmError(
        res.reason === 'network'
          ? "We couldn't reach Imela to open your space. Please try again."
          : 'Your Persona ID was created, but we could not open your space. Please try again in a moment, or sign in later with your ID and secret.'
      );
      return;
    }
    setStep('concerns');
  };

  const submit = async () => {
    setBusy(true);
    setError(null);
    const res = await createCase({ concerns, story, preferredSupport: support });
    setBusy(false);
    if (!res.ok) {
      setError(createCaseErrorMessage(res.reason, res.message));
      return;
    }
    setCaseId(res.data.id);
    setStep('done');
  };

  return (
    <div className="shell max-w-3xl py-8 sm:py-12">
      <Progress step={step} />
      <div className="mt-8">
        {step === 'consent' && (
          <div>
            <StepHeading eyebrow="Before you begin">Talk to a counsellor, without telling us who you are</StepHeading>
            <ul className="mt-6 grid gap-3">
              {[
                { icon: UserRoundX, title: 'No name, email or phone number', text: 'You get a Persona ID and a recovery secret instead of an account.' },
                { icon: EyeOff, title: 'Only your counsellor reads it', text: 'They see what you write, never who you are. You can delete everything at any time.' },
                { icon: LifeBuoy, title: 'Not an emergency service', text: 'Replies come from real people during working hours. In danger? Call 999 or 112.' },
              ].map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-3 rounded-card bg-paper p-4 shadow-soft">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lavender-soft text-lavender-ink">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-semibold text-ink-strong">{title}</span>
                    <span className="mt-0.5 block text-sm leading-relaxed text-ink">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
            <details className="mt-4 rounded-2xl bg-paper/80 p-4 shadow-soft">
              <summary className="cursor-pointer text-sm font-semibold text-ink-strong">Read the full privacy details</summary>
              <p className="mt-3 text-sm leading-relaxed text-ink">
                We keep the support areas you choose, what you write, and when messages were sent. Closed conversations are deleted after a retention period
                (currently up to one year).
              </p>
              <div className="mt-3">
                <PrivacyLimits />
              </div>
            </details>
            <label
              className={cn(
                'mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 text-ink transition-colors',
                agreed ? 'border-ink-strong bg-lavender-soft' : 'border-line/15 bg-paper'
              )}
            >
              <input type="checkbox" className="mt-1 h-5 w-5 accent-[#2A2623]" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span className="text-sm leading-relaxed">
                I understand how my information is handled and agree to it being stored to provide counselling support.{' '}
                <Link to="/privacy#persona" className="font-semibold underline underline-offset-2" target="_blank" rel="noreferrer">
                  Privacy notice
                </Link>
              </span>
            </label>
            {error && (
              <Alert tone="danger" className="mt-5" live>
                {error}
              </Alert>
            )}
            <StepActions>
              <Link to="/persona" className={buttonClasses('ghost')}>
                Back
              </Link>
              <Button
                disabled={busy}
                onClick={() => {
                  if (!agreed) {
                    setError('Please tick the box above to agree, then continue.');
                    return;
                  }
                  void create();
                }}
              >
                {busy ? 'Creating your ID…' : 'Get my Persona ID'} {!busy && <ArrowRight className="h-4 w-4" aria-hidden />}
              </Button>
            </StepActions>
          </div>
        )}

        {step === 'credentials' && persona && (
          <div>
            <StepHeading eyebrow="Your Persona ID is ready">Save these two things</StepHeading>
            <p className="mt-3 text-ink">
              You'll need both to come back and read your counsellor's reply. This is the only time we can show your recovery secret — Imela can't reset it.
            </p>
            <div className="mt-5">
              <CredentialCard
                personaCode={persona.personaCode}
                recoverySecret={persona.recoverySecret}
                onSaved={() => {
                  setSaved(true);
                  setConfirmError(null);
                }}
              />
            </div>
            <label
              className={cn(
                'mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 text-ink transition-colors',
                saved ? 'border-ink-strong bg-lavender-soft' : 'border-line/15 bg-paper'
              )}
            >
              <input
                type="checkbox"
                className="mt-1 h-5 w-5 accent-[#2A2623]"
                checked={saved}
                onChange={(e) => {
                  setSaved(e.target.checked);
                  setConfirmError(null);
                }}
              />
              <span className="text-sm leading-relaxed">I've saved my Persona ID and recovery secret somewhere only I can reach.</span>
            </label>
            {confirmError && (
              <p role="alert" className="mt-3 text-sm font-medium text-danger">
                {confirmError}
              </p>
            )}
            <StepActions>
              <Button onClick={confirmSaved} disabled={busy}>
                {busy ? 'Opening your space…' : 'Continue'} {!busy && <ArrowRight className="h-4 w-4" aria-hidden />}
              </Button>
            </StepActions>
          </div>
        )}

        {step === 'concerns' && <ConcernStep value={concerns} onChange={setConcerns} onNext={() => setStep('story')} />}

        {step === 'story' && (
          <StoryStep
            story={story}
            onStory={setStory}
            support={support}
            onSupport={setSupport}
            onBack={() => setStep('concerns')}
            onSubmit={submit}
            submitting={busy}
            error={error}
          />
        )}

        {step === 'done' && (
          <div className="text-center">
            <div className="flex justify-center">
              <Companion variant="bloom" mood="hopeful" pose="hold" hold="heart" tone="butter" size={130} />
            </div>
            <StepHeading eyebrow="Sent">Thank you. A counsellor will read this.</StepHeading>
            <p className="mt-3 inline-flex items-center gap-2 rounded-pill bg-butter/70 px-4 py-1.5 text-sm font-semibold text-butter-ink" role="status">
              Status: Awaiting review
            </p>
            <div className="mx-auto mt-6 max-w-xl rounded-card bg-paper p-5 text-left shadow-soft">
              <h2 className="font-semibold text-ink-strong">What happens next</h2>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink">
                <li>An Imela counsellor reviews your message and replies in your private space, usually within a few working days.</li>
                <li>
                  <strong>We can't notify you</strong> — we don't have any way to contact you, by design. Please check back with your Persona ID and recovery secret.
                </li>
                <li>You can add to the conversation at any time.</li>
              </ul>
            </div>
            <p className="mt-6 flex items-center justify-center gap-1.5 text-sm text-ink-soft">
              <ShieldCheck className="h-4 w-4 text-sage-ink" aria-hidden /> If things become urgent, use “Need urgent help?” at the top of the page.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to={caseId ? `/persona/space/${caseId}` : '/persona/space'} className={buttonClasses('primary')}>
                Go to my conversation
              </Link>
              <Link to="/persona/space" className={buttonClasses('ghost')}>
                My space
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
