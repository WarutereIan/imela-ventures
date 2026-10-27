import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { portalAvailable, signInPersona, type SignInError } from '../../../domain/personaPortal/api';
import { Alert } from '../../../components/ui/primitives';
import { Button, buttonClasses } from '../../../components/ui/Button';
import Companion from '../../../components/characters/Companion';
import { useDocumentTitle } from '../../../lib/useDocumentTitle';

// Never say which of the two was wrong.
const ERRORS: Record<SignInError, string> = {
  invalid_format: "That doesn't look like a Persona ID and recovery secret. Please check what you saved and try again.",
  wrong_credentials: "That ID and secret don't match. Please check what you saved and try again.",
  not_a_persona: "That ID and secret don't match. Please check what you saved and try again.",
  rate_limited: 'Too many attempts. For your security, please wait a few minutes before trying again.',
  network: "We couldn't reach Imela. Please check your connection and try again.",
  unavailable: 'Anonymous counselling is not available right now. Please try again later.',
};

const input =
  'mt-1.5 block w-full rounded-2xl border border-line/20 bg-paper px-4 py-3 font-mono text-lg tracking-wider text-ink-strong focus:border-lavender-ink focus:outline-none focus:ring-2 focus:ring-lavender-ink/30';

export default function AccessPage() {
  useDocumentTitle('Return to your space');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [code, setCode] = useState('');
  const [secret, setSecret] = useState('');
  const [show, setShow] = useState(false);
  const [stay, setStay] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idle = params.get('reason') === 'idle';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !secret.trim()) {
      setError('Please enter both your Persona ID and your recovery secret.');
      return;
    }
    setBusy(true);
    setError(null);
    const res = await signInPersona(code, secret, stay);
    setBusy(false);
    if (!res.ok) {
      setError(ERRORS[res.reason]);
      return;
    }
    setSecret('');
    navigate('/persona/space', { replace: true });
  };

  return (
    <div className="shell grid gap-10 py-10 lg:grid-cols-[1fr_0.8fr] lg:items-center lg:py-16">
      <div className="max-w-xl">
        <p className="eyebrow">Welcome back</p>
        <h1 className="mt-2 font-display text-display-md">Return to your space</h1>
        <p className="mt-3 text-ink-soft">Enter the Persona ID and recovery secret you saved when you began.</p>

        {idle && (
          <Alert tone="info" className="mt-5">
            You were signed out after a period without activity, to keep your space private.
          </Alert>
        )}
        {!portalAvailable && (
          <Alert tone="info" className="mt-5" title="Anonymous counselling is being set up">
            Sign-in isn't available yet.{' '}
            <Link to="/persona/explore" className="font-semibold underline">
              Explore privately
            </Link>{' '}
            in the meantime.
          </Alert>
        )}

        <form onSubmit={submit} noValidate className="mt-6 space-y-5">
          <div>
            <label htmlFor="persona-code" className="text-sm font-semibold text-ink-strong">
              Persona ID
            </label>
            <input
              id="persona-code"
              value={code}
              onChange={(e) => setCode(e.target.value.slice(0, 40))}
              placeholder="IMP-XXXX-XXXX-XXXX"
              autoComplete="username"
              autoCapitalize="characters"
              spellCheck={false}
              className={input}
            />
          </div>
          <div>
            <label htmlFor="persona-secret" className="text-sm font-semibold text-ink-strong">
              Recovery secret
            </label>
            <div className="relative">
              <input
                id="persona-secret"
                type={show ? 'text' : 'password'}
                value={secret}
                onChange={(e) => setSecret(e.target.value.slice(0, 80))}
                placeholder="Your 30-character secret"
                autoComplete="current-password"
                spellCheck={false}
                className={`${input} pr-14`}
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full text-ink-soft hover:bg-ink/5"
                aria-label={show ? 'Hide recovery secret' : 'Show recovery secret'}
                aria-pressed={show}
              >
                {show ? <EyeOff className="h-5 w-5" aria-hidden /> : <Eye className="h-5 w-5" aria-hidden />}
              </button>
            </div>
            <p className="mt-1 text-xs text-ink-soft">Dashes and spaces are optional. Letters can be upper or lower case.</p>
          </div>
          <label className="flex items-start gap-3 text-sm text-ink">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#2A2623]" checked={stay} onChange={(e) => setStay(e.target.checked)} />
            <span>
              Stay signed in while this tab is open
              <span className="block text-xs text-ink-soft">Leave this off on a shared or borrowed device. Closing the tab always signs you out.</span>
            </span>
          </label>
          {error && (
            <Alert tone="danger" live>
              {error}
            </Alert>
          )}
          <Button type="submit" size="lg" disabled={busy || !portalAvailable} className="w-full sm:w-auto">
            <KeyRound className="h-4 w-4" aria-hidden />
            {busy ? 'Opening…' : 'Open my space'}
          </Button>
        </form>

        <p className="mt-6 text-sm text-ink-soft">
          Lost your recovery secret? Imela can't recover it — that's what protects your anonymity. You can{' '}
          <Link to="/persona/start" className="font-semibold text-lavender-ink underline underline-offset-2">
            start again with a new Persona ID
          </Link>
          .
        </p>
      </div>
      <div className="hidden justify-center lg:flex" aria-hidden>
        <Companion variant="cloud" mood="hopeful" pose="wave" tone="sky" size={220} />
      </div>
      <p className="sr-only" aria-live="polite">
        {busy ? 'Signing in' : ''}
      </p>
      <Link to="/persona" className={buttonClasses('ghost', 'sm', 'justify-self-start lg:col-span-2')}>
        Back to Imela Persona
      </Link>
    </div>
  );
}
