import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Building2, ChevronRight, LifeBuoy, Phone, Search, Shield, Sparkle, Users, X } from 'lucide-react';
import { ORG } from '../../data/organisation';
import { cn } from '../../lib/cn';

const LINKS: { to: string; label: string; hint: string; icon: React.ElementType; tone: string }[] = [
  { to: '/who-we-are', label: 'Who We Are', hint: 'Our story & approach', icon: Sparkle, tone: 'bg-butter text-butter-ink' },
  { to: '/team', label: 'Team', hint: 'Meet the counsellors', icon: Users, tone: 'bg-rose-soft text-rose-ink' },
  { to: '/resources', label: 'Resources', hint: 'Gentle reading', icon: BookOpen, tone: 'bg-sage text-sage-ink' },
  { to: '/find-support', label: 'Service finder', hint: 'Describe what you need', icon: Search, tone: 'bg-sky-soft text-sky-ink' },
  { to: '/organisations', label: 'For organisations', hint: 'Workplace wellness', icon: Building2, tone: 'bg-ink-strong text-lime' },
  { to: '/privacy', label: 'Privacy', hint: 'How we handle data', icon: Shield, tone: 'bg-lavender-soft text-lavender-ink' },
];

/**
 * Bottom sheet opened from the tab bar's "More" tab. Portalled to <body> (the
 * header's backdrop-filter would otherwise trap a fixed element), with the
 * rest of the app made inert while it is open.
 */
export function MoreSheet({ open, onClose, onUrgentHelp }: { open: boolean; onClose: () => void; onUrgentHelp: () => void }) {
  const { pathname } = useLocation();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const root = document.getElementById('root');
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    root?.setAttribute('inert', '');
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      root?.removeAttribute('inert');
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] lg:hidden">
      <button type="button" aria-label="Close menu" onClick={onClose} className="fade-in absolute inset-0 h-full w-full cursor-default bg-ink-strong/35 backdrop-blur-[2px]" />
      <div
        id="more-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="more-sheet-title"
        className="glass-bar sheet-up absolute inset-x-2 bottom-2 max-h-[85dvh] overflow-y-auto overscroll-contain rounded-[2rem] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3"
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-ink/20" aria-hidden />
        <div className="flex items-center justify-between px-1">
          <h2 id="more-sheet-title" className="font-display text-display-sm">
            Explore Imela
          </h2>
          <button ref={closeRef} type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-ink/5 text-ink-strong hover:bg-ink/10" aria-label="Close">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <ul className="mt-4 grid grid-cols-2 gap-2.5">
          {LINKS.map(({ to, label, hint, icon: Icon, tone }, i) => {
            const active = pathname.startsWith(to);
            return (
              <li key={to} className="page-enter" style={{ animationDelay: `${60 + i * 40}ms` }}>
                <Link
                  to={to}
                  onClick={onClose}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex h-full flex-col gap-2 rounded-[1.4rem] border p-3 transition-transform duration-quick active:scale-[0.97]',
                    active ? 'border-lavender-ink bg-lavender-soft' : 'border-white/70 bg-paper/70'
                  )}
                >
                  <span className={cn('grid h-10 w-10 place-items-center rounded-2xl', tone)}>
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-ink-strong">{label}</span>
                    <span className="block text-xs text-ink-soft">{hint}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              onUrgentHelp();
            }}
            className="flex items-center justify-center gap-2 rounded-2xl bg-rose-soft px-3 py-3 text-sm font-semibold text-rose-ink active:scale-[0.97]"
          >
            <LifeBuoy className="h-4 w-4" aria-hidden /> Urgent help
          </button>
          <a href={ORG.phoneHref} className="flex items-center justify-center gap-2 rounded-2xl bg-paper px-3 py-3 text-sm font-semibold text-ink-strong active:scale-[0.97]">
            <Phone className="h-4 w-4" aria-hidden /> Call us
          </a>
        </div>
        <Link
          to="/book"
          onClick={onClose}
          className="mt-2.5 flex items-center justify-between rounded-2xl bg-ink-strong px-4 py-3.5 text-sm font-semibold text-ivory active:scale-[0.99]"
        >
          Schedule a consultation <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>,
    document.body
  );
}
