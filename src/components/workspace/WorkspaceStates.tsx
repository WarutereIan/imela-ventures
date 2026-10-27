import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import Companion from '../characters/Companion';
import { Button, buttonClasses } from '../ui/Button';
import { Alert, TextField } from '../ui/primitives';
import type { AuthState } from '../../lib/auth';
import { cn } from '../../lib/cn';

/** Page frame shared by the signed-in workspaces. */
export function WorkspaceShell({
  eyebrow,
  title,
  lede,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  lede?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="shell py-12 sm:py-16">
      <div className="flex flex-col gap-4 border-b border-line/10 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow mb-1">{eyebrow}</p>
          <h1 className="font-display text-display-md">{title}</h1>
          {lede && <p className="mt-3 text-ink-soft">{lede}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      <div className="pt-8">{children}</div>
    </section>
  );
}

/** Honest state shown while the secure database setup has not been applied. */
export function SetupPending({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <section className="shell py-16 sm:py-24">
      <div className="mx-auto grid max-w-4xl items-center gap-10 rounded-blob bg-paper p-8 shadow-soft sm:p-12 md:grid-cols-[auto_1fr]">
        <div className="flex justify-center">
          <Companion variant="sprout" mood="recovering" pose="hold" hold="lantern" tone="sage" size={150} />
        </div>
        <div>
          <p className="eyebrow mb-2">Coming soon</p>
          <h1 className="font-display text-display-md">{title}</h1>
          <p className="mt-4 text-ink-soft">
            This workspace becomes available once Imela completes its secure setup — the database protections that make sure
            each person can only ever see what they are meant to see.
          </p>
          {children && <div className="mt-4 text-ink-soft">{children}</div>}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/book" className={buttonClasses('primary')}>
              Schedule Consultation
            </Link>
            <Link to="/" className={buttonClasses('ghost')}>
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AccessDenied({ what, onSignOut }: { what: string; onSignOut: () => void }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center rounded-card bg-paper p-10 text-center shadow-soft">
      <Companion variant="cloud" mood="uncertain" tone="sky" size={120} />
      <h2 className="mt-4 font-display text-display-sm">This area is for {what}.</h2>
      <p className="mt-2 text-ink-soft">
        Your account doesn’t have access here. If you think it should, please contact the Imela team and they can check your
        account.
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={onSignOut}>
          Sign out
        </Button>
        <Link to="/" className={buttonClasses('ghost')}>
          Go home
        </Link>
      </div>
    </div>
  );
}

/**
 * Email + password sign-in (and optional account creation). Collects only the
 * minimum needed: an email address and a password.
 */
export function SignInPanel({
  auth,
  heading,
  intro,
  allowSignUp = false,
  className,
  headingLevel = 'h2',
}: {
  auth: AuthState;
  heading: string;
  /** Use 'h1' when the panel is the only content on the page. */
  headingLevel?: 'h1' | 'h2';
  intro?: React.ReactNode;
  allowSignUp?: boolean;
  className?: string;
}) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!email.includes('@')) return setError('Please enter the email address you use with Imela.');
    if (password.length < 8) return setError('Passwords are at least 8 characters.');
    setBusy(true);
    if (mode === 'signin') {
      const res = await auth.signIn(email, password);
      if (res.error) setError(res.error);
    } else {
      const res = await auth.signUp(email, password);
      if (res.error) setError(res.error);
      else if (res.needsConfirmation) setNotice('Check your inbox — we’ve sent a link to confirm your email address.');
    }
    setBusy(false);
  };

  return (
    <div className={cn('mx-auto w-full max-w-md rounded-card border border-line/10 bg-paper p-6 shadow-soft sm:p-8', className)}>
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-lavender-soft text-lavender-ink">
          <LockKeyhole className="h-5 w-5" aria-hidden />
        </span>
        {React.createElement(headingLevel, { className: 'font-display text-display-sm' }, mode === 'signup' ? 'Create your account' : heading)}
      </div>
      {intro && <div className="mt-3 text-sm text-ink-soft">{intro}</div>}
      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <TextField label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <TextField
          label="Password"
          type="password"
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint={mode === 'signup' ? 'At least 8 characters.' : undefined}
          required
        />
        {error && (
          <Alert tone="danger" live>
            {error}
          </Alert>
        )}
        {notice && (
          <Alert tone="success" live>
            {notice}
          </Alert>
        )}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </Button>
      </form>
      {allowSignUp && (
        <p className="mt-4 text-center text-sm text-ink-soft">
          {mode === 'signin' ? 'New here? ' : 'Already have an account? '}
          <button type="button" className="font-semibold text-lavender-ink underline-offset-4 hover:underline" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
            {mode === 'signin' ? 'Create an account' : 'Sign in'}
          </button>
        </p>
      )}
      <p className="mt-4 flex items-start gap-2 text-xs text-ink-soft">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <span>
          We only use your email to sign you in and send appointment information. See our{' '}
          <Link to="/privacy" className="underline">
            privacy notice
          </Link>
          .
        </span>
      </p>
    </div>
  );
}
