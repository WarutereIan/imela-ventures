import React from 'react';
import { Link } from 'react-router-dom';
import { Database } from 'lucide-react';
import { cn } from '../../lib/cn';
import type { Badge } from './nav';

/** Small count pill used in the sidebar, tab bar and page headers. */
export function CountBadge({ badge, className }: { badge: Badge | null; className?: string }) {
  if (!badge || badge.count <= 0) return null;
  return (
    <span
      className={cn(
        'inline-grid min-w-[1.25rem] place-items-center rounded-pill px-1.5 text-[0.68rem] font-bold leading-5',
        badge.urgent ? 'bg-rose text-white' : 'bg-lavender-ink text-white',
        className
      )}
    >
      {badge.count > 99 ? '99+' : badge.count}
    </span>
  );
}

export function AdminPageHeader({ title, lede, actions, eyebrow }: { title: string; lede?: React.ReactNode; actions?: React.ReactNode; eyebrow?: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="font-display text-display-md">{title}</h1>
        {lede && <p className="mt-1 max-w-2xl text-sm text-ink-soft sm:text-base">{lede}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Shown when a table or function from a migration isn't in the database yet. */
export function MigrationNeeded({ what, file = '20261029000008_admin_console.sql' }: { what: string; file?: string }) {
  return (
    <div className="flex gap-3 rounded-card border-2 border-dashed border-butter-ink/40 bg-butter/40 p-5 text-sm text-ink">
      <Database className="mt-0.5 h-5 w-5 shrink-0 text-butter-ink" aria-hidden />
      <div>
        <p className="font-semibold text-ink-strong">{what} needs a database update</p>
        <p className="mt-1">
          In Supabase, open <strong>SQL Editor</strong>, paste <code className="break-all">supabase/migrations/{file}</code> (or the whole{' '}
          <code>supabase/apply_all.sql</code>) and click <strong>Run</strong>. It is safe to run more than once.
        </p>
      </div>
    </div>
  );
}

/** Segmented filter control (pills). */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string; count?: number }[];
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="scrollbar-hide -mx-1 flex max-w-full gap-1 overflow-x-auto px-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="tab"
          aria-selected={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-pill px-3.5 py-2 text-sm font-semibold transition-colors',
            value === o.id ? 'bg-ink-strong text-ivory' : 'bg-paper text-ink shadow-soft hover:bg-lavender-soft'
          )}
        >
          {o.label}
          {o.count !== undefined && o.count > 0 && (
            <span className={cn('rounded-pill px-1.5 text-xs', value === o.id ? 'bg-ivory/20' : 'bg-lavender-soft text-lavender-ink')}>{o.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

export function StatTile({
  label,
  value,
  note,
  to,
  tone = 'paper',
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  note?: React.ReactNode;
  to?: string;
  tone?: 'paper' | 'lavender' | 'butter' | 'rose' | 'sage' | 'sky';
  icon?: React.ElementType;
}) {
  const tones = {
    paper: 'bg-paper',
    lavender: 'bg-lavender-soft',
    butter: 'bg-butter/70',
    rose: 'bg-rose-soft',
    sage: 'bg-sage',
    sky: 'bg-sky-soft',
  };
  const inner = (
    <>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-ink">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-ink-soft" aria-hidden />}
      </div>
      <p className="mt-2 font-display text-4xl leading-none text-ink-strong">{value}</p>
      {note && <p className="mt-2 truncate text-xs text-ink-soft">{note}</p>}
    </>
  );
  const cls = cn('block rounded-card p-4 shadow-soft transition-transform duration-calm ease-gentle sm:p-5', tones[tone], to && 'hover:-translate-y-0.5');
  return to ? (
    <Link to={to} className={cls}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}
