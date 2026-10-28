import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Detail panel: slides in from the right on larger screens and up from the
 * bottom on phones. Escape or the backdrop closes it.
 */
export function Drawer({ open, onClose, title, subtitle, children, footer }: { open: boolean; onClose: () => void; title: React.ReactNode; subtitle?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[75]">
      <button type="button" aria-label="Close" onClick={onClose} className="fade-in absolute inset-0 h-full w-full cursor-default bg-ink-strong/40 backdrop-blur-[2px]" />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : 'Details'}
        className="sheet-up absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col rounded-t-[2rem] bg-ivory shadow-lift sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[30rem] sm:rounded-none sm:rounded-l-[2rem] sm:[animation-name:fade-in]"
      >
        <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-ink/20 sm:hidden" aria-hidden />
        <header className="flex items-start justify-between gap-3 border-b border-line/10 px-5 pb-4 pt-3 sm:pt-6">
          <div className="min-w-0">
            <h2 className="font-display text-display-sm">{title}</h2>
            {subtitle && <div className="mt-1 text-sm text-ink-soft">{subtitle}</div>}
          </div>
          <button ref={closeRef} type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink/5 hover:bg-ink/10" aria-label="Close">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>
        <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 py-5">{children}</div>
        {footer && <footer className="flex flex-wrap gap-2 border-t border-line/10 bg-paper/70 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{footer}</footer>}
      </section>
    </div>,
    document.body
  );
}

/** Autosaving note field for internal notes. */
export function NoteField({ initial, onSave, disabled, label = 'Internal note' }: { initial: string; onSave: (v: string) => Promise<boolean>; disabled?: boolean; label?: string }) {
  const [value, setValue] = React.useState(initial);
  const [state, setState] = React.useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const change = (v: string) => {
    setValue(v);
    setState('saving');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => setState((await onSave(v)) ? 'saved' : 'error'), 800);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor="admin-note" className="text-sm font-semibold text-ink-strong">
          {label} <span className="font-normal text-ink-soft">(only staff see this)</span>
        </label>
        <span className="text-xs text-ink-soft" role="status">
          {state === 'saving' ? 'Saving…' : state === 'saved' ? 'Saved' : state === 'error' ? 'Not saved' : ''}
        </span>
      </div>
      <textarea
        id="admin-note"
        value={value}
        disabled={disabled}
        onChange={(e) => change(e.target.value.slice(0, 2000))}
        rows={3}
        placeholder={disabled ? 'Notes need the latest database update.' : 'Calls made, preferences, next steps…'}
        className="mt-1.5 w-full rounded-2xl border border-line/20 bg-paper px-4 py-3 text-sm focus:border-lavender-ink focus:outline-none focus:ring-2 focus:ring-lavender-ink/30 disabled:opacity-60"
      />
    </div>
  );
}
