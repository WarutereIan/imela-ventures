import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import { STATUS_LABEL, type CaseStatus } from '../../domain/personaPortal/types';
import { formatRecoverySecret } from '../../../supabase/functions/_shared/personaCredentials';
import { credentialsText } from './text';
import { downloadText } from '../persona/summary';
import { Button } from '../ui/Button';
import { cn } from '../../lib/cn';

/** Focuses a step heading when it mounts, so screen-reader and keyboard users land on the new step. */
export function StepHeading({ children, className, eyebrow }: { children: React.ReactNode; className?: string; eyebrow?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <div>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 ref={ref} tabIndex={-1} className={cn('mt-1 font-display text-display-md focus:outline-none focus-visible:shadow-none', className)}>
        {children}
      </h1>
    </div>
  );
}

const STATUS_TONE: Record<CaseStatus, string> = {
  awaiting_review: 'bg-butter/70 text-butter-ink',
  in_progress: 'bg-sky-soft text-sky-ink',
  counsellor_replied: 'bg-lavender-ink text-white',
  closed: 'bg-ink/10 text-ink',
};

export function CaseStatusChip({ status }: { status: CaseStatus }) {
  return <span className={cn('inline-flex items-center rounded-pill px-3 py-1 text-xs font-semibold', STATUS_TONE[status])}>{STATUS_LABEL[status]}</span>;
}

/** The honest limits of anonymity, repeated wherever someone decides what to share. */
export function PrivacyLimits({ compact = false }: { compact?: boolean }) {
  const items = [
    <>
      <strong className="text-ink-strong">No name, email or phone number.</strong> Your Persona ID and recovery secret are all you need.
    </>,
    <>
      <strong className="text-ink-strong">Counsellors read what you write.</strong> The Imela counsellors and administrators handling your conversation can see your
      chosen support areas, your messages and when they were sent — but not who you are.
    </>,
    <>
      <strong className="text-ink-strong">Not absolute anonymity.</strong> Like any website, the services that host Imela record technical data such as IP addresses.
      Imela does not link that to your conversations, and anything you choose to write about yourself could identify you.
    </>,
    <>
      <strong className="text-ink-strong">Safety comes first.</strong> If what you share suggests someone may be at serious and imminent risk, a counsellor reviews it
      and follows Imela's safeguarding process, within Kenyan law. No automated system makes that decision.
    </>,
    <>
      <strong className="text-ink-strong">Not an emergency service.</strong> Messages are answered by people during working hours. Nobody is watching in real time.
    </>,
  ];
  return (
    <ul className={cn('space-y-3 text-sm leading-relaxed text-ink', compact && 'space-y-2')}>
      {(compact ? items.slice(1, 5) : items).map((item, i) => (
        <li key={i} className="flex gap-2.5">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-lavender-ink" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  return (
    <Button size="sm" variant="soft" onClick={copy} aria-label={`Copy ${label}`}>
      {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
      {copied ? 'Copied' : 'Copy'}
    </Button>
  );
}

/** Shows a Persona ID and/or recovery secret with copy and download actions. */
export function CredentialCard({ personaCode, recoverySecret }: { personaCode?: string; recoverySecret?: string }) {
  return (
    <div className="space-y-4 rounded-card border-2 border-ink-strong bg-paper p-5 shadow-sticker sm:p-6">
      {personaCode && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">Persona ID</p>
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
            <code className="break-all font-mono text-2xl font-bold tracking-wider text-ink-strong">{personaCode}</code>
            <CopyButton value={personaCode} label="Persona ID" />
          </div>
        </div>
      )}
      {recoverySecret && (
        <div className="border-t border-line/10 pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-ink">Recovery secret — keep private</p>
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
            <code className="break-all font-mono text-xl font-bold tracking-wider text-ink-strong sm:text-2xl">{formatRecoverySecret(recoverySecret)}</code>
            <CopyButton value={formatRecoverySecret(recoverySecret)} label="recovery secret" />
          </div>
        </div>
      )}
      {personaCode && recoverySecret && (
        <Button size="sm" variant="outline" onClick={() => downloadText('imela-persona.txt', credentialsText(personaCode, recoverySecret))}>
          <Download className="h-4 w-4" aria-hidden /> Download as a text file
        </Button>
      )}
    </div>
  );
}
