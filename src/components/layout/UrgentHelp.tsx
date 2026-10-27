import React, { useEffect, useRef } from 'react';
import { LifeBuoy, Phone, X } from 'lucide-react';
import { CRISIS_CONTACTS, CRISIS_DISCLAIMER, CRISIS_OUTSIDE_KENYA } from '../../data/crisis';
import { cn } from '../../lib/cn';

/** Inline list of verified urgent contacts. */
export function CrisisContacts({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <ul className={cn('grid gap-3', !compact && 'sm:grid-cols-2', className)}>
      {CRISIS_CONTACTS.map((c) => (
        <li key={c.label}>
          <a
            href={c.href}
            className="flex items-center gap-3 rounded-2xl border border-rose/30 bg-paper px-4 py-3 transition-colors hover:bg-rose-soft"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-rose text-white">
              <Phone className="h-4 w-4" aria-hidden />
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink-strong">{c.label}</span>
              <span className="block text-lg font-bold tracking-tight text-rose-ink">{c.display}</span>
              {!compact && <span className="block text-xs text-ink-soft">{c.detail}</span>}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Dialog reachable from every page header. Uses the native <dialog> for focus management. */
export function UrgentHelpDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="urgent-help-title"
      className="m-auto w-[min(92vw,34rem)] rounded-card bg-ivory p-0 text-ink shadow-lift backdrop:bg-ink-strong/50 backdrop:backdrop-blur-sm"
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-rose-soft text-rose-ink">
              <LifeBuoy className="h-5 w-5" aria-hidden />
            </span>
            <h2 id="urgent-help-title" className="font-display text-display-sm">
              Need help right now?
            </h2>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-ink-soft hover:bg-ink/5" aria-label="Close urgent help">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-4 text-ink">
          If you or someone else is in immediate danger, or you are thinking about ending your life, please contact emergency support now.
        </p>
        <CrisisContacts className="mt-5" compact />
        <p className="mt-4 text-sm text-ink-soft">{CRISIS_OUTSIDE_KENYA}</p>
        <p className="mt-2 text-xs text-ink-soft">{CRISIS_DISCLAIMER}</p>
      </div>
    </dialog>
  );
}

/**
 * Leaves the site immediately and replaces the current history entry, for
 * people who may be browsing somewhere they don't feel safe.
 */
export function QuickExit({ className }: { className?: string }) {
  const leave = () => {
    try {
      sessionStorage.clear();
    } catch {
      /* storage may be unavailable */
    }
    window.location.replace('https://www.google.com/search?q=weather');
  };
  return (
    <button
      type="button"
      onClick={leave}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill border border-ink/20 bg-paper px-3 py-1.5 text-xs font-semibold text-ink-strong hover:bg-ink-strong hover:text-ivory',
        className
      )}
      title="Leave this site quickly"
    >
      <X className="h-3.5 w-3.5" aria-hidden /> Quick exit
    </button>
  );
}

export const UrgentHelpContext = React.createContext<() => void>(() => {});
