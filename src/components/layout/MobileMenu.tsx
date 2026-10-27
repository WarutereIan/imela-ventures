import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink } from 'react-router-dom';
import { ArrowUpRight, LifeBuoy, Phone, X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { buttonClasses } from '../ui/Button';
import Companion from '../characters/Companion';
import { ORG } from '../../data/organisation';

const MAIN = [
  { to: '/', label: 'Home', end: true },
  { to: '/who-we-are', label: 'Who We Are' },
  { to: '/resources', label: 'Resources' },
  { to: '/team', label: 'Team' },
  { to: '/persona', label: 'Imela Persona' },
];

const PATHWAYS = [
  { to: '/support', label: 'What we help with', tone: 'bg-sage' },
  { to: '/find-support', label: 'Service finder', tone: 'bg-butter' },
  { to: '/organisations', label: 'For organisations', tone: 'bg-ink-strong text-ivory' },
];

/**
 * Full-screen mobile navigation.
 *
 * Rendered through a portal into <body>: the sticky header uses
 * backdrop-filter, which makes `position: fixed` children size themselves to
 * the header instead of the viewport — that clipped the old menu to ~100px.
 * While open, the rest of the app is made `inert` so focus and screen readers
 * stay inside the menu.
 */
export function MobileMenu({ open, onClose, onUrgentHelp }: { open: boolean; onClose: () => void; onUrgentHelp: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const root = document.getElementById('root');
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    root?.setAttribute('inert', '');
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      root?.removeAttribute('inert');
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="fixed inset-0 z-[70] flex h-[100dvh] flex-col overflow-hidden bg-lavender text-ink-strong lg:hidden"
    >
      <div className="flex h-[4.25rem] shrink-0 items-center justify-between px-[var(--gutter)]">
        <Link to="/" onClick={onClose} aria-label="Imela Ventures — home">
          <img src="/logo-transparent.png" alt="" width={70} height={56} className="h-12 w-auto" />
        </Link>
        <button ref={closeRef} type="button" onClick={onClose} className={buttonClasses('primary', 'sm')}>
          <X className="h-4 w-4" aria-hidden /> Close
        </button>
      </div>

      <nav
        aria-label="Mobile"
        className="flex flex-1 flex-col overflow-y-auto overscroll-contain px-[var(--gutter)] [&>*]:shrink-0 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2"
      >
        <ul className="space-y-0.5">
          {MAIN.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between rounded-2xl px-3 py-2 font-display text-[1.75rem] leading-tight [@media(max-height:700px)]:py-1.5 [@media(max-height:700px)]:text-[1.5rem]',
                    isActive ? 'bg-paper/80' : 'active:bg-paper/50'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && <span className="h-2.5 w-2.5 rounded-full bg-lavender-ink" aria-hidden />}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <p className="mt-6 px-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink">Find your way</p>
        <ul className="mt-2 grid gap-2">
          {PATHWAYS.map((p) => (
            <li key={p.to}>
              <Link to={p.to} onClick={onClose} className={cn('flex h-full items-center justify-between gap-2 rounded-2xl px-3 py-3 text-sm font-semibold', p.tone)}>
                {p.label}
                <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>

        <Link to="/book" onClick={onClose} className={buttonClasses('primary', 'lg', 'mt-6 w-full')}>
          Schedule Consultation
        </Link>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onUrgentHelp();
            }}
            className="flex items-center justify-center gap-2 rounded-2xl bg-paper px-3 py-3 text-sm font-semibold text-rose-ink"
          >
            <LifeBuoy className="h-4 w-4" aria-hidden /> Urgent help
          </button>
          <a href={ORG.phoneHref} className="flex items-center justify-center gap-2 rounded-2xl bg-paper px-3 py-3 text-sm font-semibold">
            <Phone className="h-4 w-4" aria-hidden /> Call us
          </a>
        </div>

        <div className="mt-auto flex items-end justify-between pt-6" aria-hidden>
          <p className="max-w-[12rem] font-hand text-2xl leading-tight text-lavender-ink">One small step at a time.</p>
          <Companion variant="sprout" mood="joyful" pose="wave" tone="butter" size={90} />
        </div>
      </nav>
    </div>,
    document.body
  );
}
