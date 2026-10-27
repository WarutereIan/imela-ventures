import React from 'react';
import { AlertCircle, CheckCircle2, Info, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/cn';
import type { ServiceStatus } from '../../data/types';
import { STATUS_LABEL } from '../../data/services';

export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = 'left',
  as: Tag = 'h2',
  className,
  id,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  align?: 'left' | 'center';
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn(align === 'center' && 'mx-auto text-center', 'max-w-3xl', className)}>
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <Tag id={id} className={cn('font-display', Tag === 'h1' ? 'text-display-lg' : 'text-display-md')}>
        {title}
      </Tag>
      {lede && <p className={cn('mt-4 text-lg leading-relaxed text-ink-soft', align === 'center' && 'mx-auto max-w-2xl')}>{lede}</p>}
    </div>
  );
}

export function Chip({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'lavender' | 'sage' | 'butter' | 'rose' | 'sky' | 'clay' | 'ink';
  className?: string;
}) {
  const tones = {
    neutral: 'bg-ink/5 text-ink',
    lavender: 'bg-lavender-soft text-lavender-ink',
    sage: 'bg-sage text-sage-ink',
    butter: 'bg-butter/70 text-butter-ink',
    rose: 'bg-rose-soft text-rose-ink',
    sky: 'bg-sky-soft text-sky-ink',
    clay: 'bg-clay/50 text-clay-ink',
    ink: 'bg-ink-strong text-ivory',
  };
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-pill px-3 py-1 text-xs font-semibold', tones[tone], className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: ServiceStatus }) {
  const tone = { available: 'sage', awaiting_verification: 'butter', referral_only: 'sky', unavailable: 'neutral' } as const;
  return <Chip tone={tone[status]}>{STATUS_LABEL[status]}</Chip>;
}

type AlertTone = 'info' | 'success' | 'warning' | 'danger';
const alertIcon: Record<AlertTone, React.ElementType> = { info: Info, success: CheckCircle2, warning: AlertTriangle, danger: AlertCircle };
const alertTone: Record<AlertTone, string> = {
  info: 'bg-sky-soft text-sky-ink border-sky',
  success: 'bg-sage text-sage-ink border-sage-deep',
  warning: 'bg-butter/50 text-butter-ink border-butter',
  danger: 'bg-rose-soft text-rose-ink border-rose/40',
};

export function Alert({
  tone = 'info',
  title,
  children,
  className,
  live = false,
}: {
  tone?: AlertTone;
  title?: string;
  children?: React.ReactNode;
  className?: string;
  /** Announce to screen readers when it appears. */
  live?: boolean;
}) {
  const Icon = alertIcon[tone];
  return (
    <div
      role={live ? (tone === 'danger' ? 'alert' : 'status') : undefined}
      className={cn('flex gap-3 rounded-2xl border px-4 py-3 text-sm leading-relaxed', alertTone[tone], className)}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <div>
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && 'mt-0.5')}>{children}</div>}
      </div>
    </div>
  );
}

export function Spinner({ label = 'Loading', className }: { label?: string; className?: string }) {
  return (
    <span role="status" className={cn('inline-flex items-center gap-2 text-sm text-ink-soft', className)}>
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      {label}
    </span>
  );
}

export function Card({ className, children, as: Tag = 'div' }: { className?: string; children: React.ReactNode; as?: 'div' | 'article' | 'li' | 'section' }) {
  return <Tag className={cn('rounded-card border border-line/10 bg-paper shadow-soft', className)}>{children}</Tag>;
}

function useFieldId(id?: string) {
  const generated = React.useId();
  return id ?? generated;
}

const inputBase =
  'w-full rounded-2xl border border-line/20 bg-paper px-4 py-3 text-[0.98rem] text-ink-strong placeholder:text-ink-soft/70 transition-colors focus:border-lavender-ink focus:outline-none focus-visible:shadow-none focus:ring-2 focus:ring-lavender-ink/30 aria-[invalid=true]:border-danger';

interface FieldWrapProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
}

function FieldWrap({ id, label, hint, error, required, optional, children }: FieldWrapProps & { id: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-baseline gap-2 text-sm font-semibold text-ink-strong">
        {label}
        {required && <span className="text-rose-ink" aria-hidden>*</span>}
        {optional && <span className="text-xs font-normal text-ink-soft">(optional)</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-ink-soft">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextField({
  label,
  hint,
  error,
  required,
  optional,
  id,
  className,
  ...rest
}: FieldWrapProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const fid = useFieldId(id);
  return (
    <FieldWrap id={fid} label={label} hint={hint} error={error} required={required} optional={optional}>
      <input
        id={fid}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fid}-error` : hint ? `${fid}-hint` : undefined}
        className={cn(inputBase, className)}
        {...rest}
      />
    </FieldWrap>
  );
}

export function TextArea({
  label,
  hint,
  error,
  required,
  optional,
  id,
  className,
  ...rest
}: FieldWrapProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const fid = useFieldId(id);
  return (
    <FieldWrap id={fid} label={label} hint={hint} error={error} required={required} optional={optional}>
      <textarea
        id={fid}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fid}-error` : hint ? `${fid}-hint` : undefined}
        className={cn(inputBase, 'min-h-[7rem] resize-y', className)}
        {...rest}
      />
    </FieldWrap>
  );
}

export function SelectField({
  label,
  hint,
  error,
  required,
  optional,
  id,
  className,
  children,
  ...rest
}: FieldWrapProps & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const fid = useFieldId(id);
  return (
    <FieldWrap id={fid} label={label} hint={hint} error={error} required={required} optional={optional}>
      <select
        id={fid}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fid}-error` : hint ? `${fid}-hint` : undefined}
        className={cn(inputBase, 'appearance-none bg-[length:1rem] pr-10', className)}
        {...rest}
      >
        {children}
      </select>
    </FieldWrap>
  );
}

export function EmptyState({ title, children, art }: { title: string; children?: React.ReactNode; art?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-card border border-dashed border-line/25 bg-paper/60 px-6 py-12 text-center">
      {art}
      <p className="mt-4 font-display text-display-sm">{title}</p>
      {children && <div className="mt-2 max-w-md text-ink-soft">{children}</div>}
    </div>
  );
}
