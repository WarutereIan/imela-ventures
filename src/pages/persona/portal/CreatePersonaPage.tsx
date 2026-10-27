import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { createCase, portalAvailable, registerPersona, signInPersona, type NewPersona } from '../../../domain/personaPortal/api';
import type { PortalConcern, PreferredSupport } from '../../../domain/personaPortal/types';
import { CredentialCard, PrivacyLimits, StepHeading } from '../../../components/personaPortal/shared';
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
    <ol className="flex items-center gap-1.5" aria-label={`Step ${current + 1} of ${ORDER.length}: ${LABELS[current]}`}>
      {ORDER.map((s, i) => (
        <li key={s} className={cn('h-1.5 flex-1 rounded-full', i <= current ? 'bg-lavender-ink' : 'bg-ink/10')} aria-hidden />
      ))}
    </ol>
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
  const [lastFive, setLastFive] = useState('');
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [concerns, setConcerns] = useState<PortalConcern[]>([]);
  const [story, setStory] = useState('');
  const [support, setSupport] = useState<PreferredSupport>('not_sure');
  const [caseId, setCaseId] = useState<string | null>(null);

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
  };

  const confirmSaved = async () => {
    if (!persona) return;
    const expected = persona.recoverySecret.slice(-5);
    if (!saved) {
      setConfirmError('Please confirm you have saved your recovery secret.');
      return;
    }
    if (lastFive.replace(/[\s-]/g, '').toUpperCase().replace(/O/g, '0').replace(/[IL]/g, '1') !== expected) {
      setConfirmError("Those characters don't match the end of your recovery secret. Please check what you saved.");
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
            <StepHeading eyebrow="Before you begin">Here's how your privacy works</StepHeading>
            <div className="mt-6 rounded-card bg-paper p-5 shadow-soft sm:p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink">What we keep</h2>
              <p className="mt-2 text-ink">
                The support areas you choose, what you write, and when messages were sent. Closed conversations are deleted after a retention period (currently up to
                one year). You can delete everything yourself at any time from your space.
              </p>
              <h2 className="mt-5 text-sm font-semibold uppercase tracking-[0.12em] text-ink">Who sees it, and the limits</h2>
              <div className="mt-3">
                <PrivacyLimits />
              </div>
            </div>
            <label className="mt-6 flex items-start gap-3 text-ink">
              <input type="checkbox" className="mt-1 h-4 w-4 accent-[#2A2623]" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span>
                I understand how my information is handled, and I agree to it being stored to provide counselling support.{' '}
                <Link to="/privacy#persona" className="font-semibold underline underline-offset-2" target="_blank" rel="noreferrer">
                  Privacy notice
                </Link>
              </span>
            </label>
            <div className="mt-8 flex flex-wrap justify-between gap-3">
              <Link to="/persona" className={buttonClasses('ghost')}>
                Back
              </Link>
              <Button disabled={!agreed} onClick={() => setStep('credentials')}>
                Continue <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>
        )}

        {step === 'credentials' && (
          <div>
            <StepHeading eyebrow="Your Persona ID">{persona ? 'Save your recovery secret now' : 'Create your Persona ID'}</StepHeading>
            {!persona ? (
              <>
                <p className="mt-3 text-ink-soft">
                  We'll create a Persona ID and a private recovery secret for you. You'll need both to come back. Nothing about you is asked for or stored with them.
                </p>
                {error && (
                  <Alert tone="danger" className="mt-5" live>
                    {error}
                  </Alert>
                )}
                <div className="mt-8 flex flex-wrap justify-between gap-3">
                  <Button variant="ghost" onClick={() => setStep('consent')} disabled={busy}>
                    Back
                  </Button>
                  <Button onClick={create} disabled={busy}>
                    {busy ? 'Creating…' : 'Create my Persona ID'}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Alert tone="warning" className="mt-5" title="This is the only time we can show your recovery secret">
                  Imela never sees it and can't reset it — there's no email or phone recovery. If you lose it, you lose access to this space. Copy it, download it,
                  or write it down somewhere only you can reach.
                </Alert>
                <div className="mt-5">
                  <CredentialCard personaCode={persona.personaCode} recoverySecret={persona.recoverySecret} />
                </div>
                <div className="mt-6 space-y-4 rounded-card bg-paper p-5 shadow-soft">
                  <label className="flex items-start gap-3 text-ink">
                    <input type="checkbox" className="mt-1 h-4 w-4 accent-[#2A2623]" checked={saved} onChange={(e) => setSaved(e.target.checked)} />
                    I've saved my recovery secret somewhere safe.
                  </label>
                  <div>
                    <label htmlFor="last-five" className="text-sm font-semibold text-ink-strong">
                      To check, type the last 5 characters of your recovery secret
                    </label>
                    <input
                      id="last-five"
                      value={lastFive}
                      onChange={(e) => setLastFive(e.target.value.slice(0, 7))}
                      autoComplete="off"
                      spellCheck={false}
                      className="mt-1.5 block w-40 rounded-2xl border border-line/20 bg-paper px-4 py-2.5 font-mono text-lg uppercase tracking-widest focus:border-lavender-ink focus:outline-none focus:ring-2 focus:ring-lavender-ink/30"
                    />
                  </div>
                  {confirmError && (
                    <p role="alert" className="text-sm font-medium text-danger">
                      {confirmError}
                    </p>
                  )}
                </div>
                <div className="mt-8 flex justify-end">
                  <Button onClick={confirmSaved} disabled={busy}>
                    {busy ? 'Opening your space…' : 'I have saved it — continue'}
                  </Button>
                </div>
              </>
            )}
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
