import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertTriangle, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn';
import Companion, { type CompanionVariant } from '../../components/characters/Companion';

export interface LegalSection {
  id: string;
  title: string;
  body: React.ReactNode;
}

const DESKTOP = '(min-width: 1024px)';

function useIsDesktop() {
  const [desktop, setDesktop] = useState(() => typeof window === 'undefined' || !window.matchMedia || window.matchMedia(DESKTOP).matches);
  useEffect(() => {
    const mql = window.matchMedia?.(DESKTOP);
    if (!mql) return;
    const onChange = () => setDesktop(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  return desktop;
}

/**
 * Shared reading layout for the privacy notice and terms.
 * Desktop: sticky contents + long-form sections.
 * Phones: a swipeable "On this page" chip row and collapsible sections, so the
 * page isn't eight screens of text; linked sections (e.g. /privacy#persona) open automatically.
 */
export default function LegalLayout({
  eyebrow,
  title,
  intro,
  updated,
  sections,
  companion = 'drift',
}: {
  eyebrow: string;
  title: string;
  intro: React.ReactNode;
  updated: string;
  sections: LegalSection[];
  companion?: CompanionVariant;
}) {
  const desktop = useIsDesktop();
  const { hash } = useLocation();
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(sections[0] ? [sections[0].id] : []));

  // Open a section reached by a link like /privacy#persona, then bring it into view.
  useEffect(() => {
    const id = hash.slice(1);
    if (!id || !sections.some((s) => s.id === id)) return;
    setOpenIds((cur) => new Set(cur).add(id));
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
  }, [hash, sections]);

  const toggle = (id: string) =>
    setOpenIds((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const jumpTo = (id: string) => (e: React.MouseEvent) => {
    if (desktop) return;
    e.preventDefault();
    setOpenIds((cur) => new Set(cur).add(id));
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }));
  };

  return (
    <>
      <header className="shell grid items-end gap-8 pb-6 pt-8 md:grid-cols-[1fr_auto] md:pb-10 md:pt-20">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-2 font-display text-display-lg">{title}</h1>
          <div className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft md:mt-5 md:text-lg">{intro}</div>
          <p className="mt-4 text-sm text-ink-soft">Last updated: {updated}</p>
        </div>
        <Companion variant={companion} mood="calm" pose="hold" hold="lantern" tone="lavender" size={150} className="mx-auto hidden md:block" />
      </header>

      <div className="shell">
        <div
          role="note"
          className="flex gap-3 rounded-card border-2 border-dashed border-butter-ink/50 bg-butter/40 p-4 text-butter-ink md:p-5"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <p className="text-sm leading-relaxed">
            <strong>This notice needs review by a qualified data-protection professional before launch.</strong> It describes how this website
            currently works, in plain language. It is not a statement of legal compliance.
          </p>
        </div>
      </div>

      <div className="shell grid gap-6 py-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12 lg:py-12">
        <nav aria-label="On this page" className="min-w-0 lg:sticky lg:top-32 lg:self-start">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">On this page</p>
          <ol className="scrollbar-hide -mx-[var(--gutter)] mt-3 flex gap-2 overflow-x-auto px-[var(--gutter)] text-sm lg:mx-0 lg:block lg:space-y-1.5 lg:overflow-visible lg:px-0">
            {sections.map((s) => (
              <li key={s.id} className="shrink-0">
                <a
                  href={`#${s.id}`}
                  onClick={jumpTo(s.id)}
                  className="block whitespace-nowrap rounded-pill border border-line/15 bg-paper px-3 py-1.5 text-ink hover:bg-ink/5 hover:text-ink-strong lg:whitespace-normal lg:rounded-lg lg:border-0 lg:bg-transparent lg:px-2 lg:py-1"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="space-y-3 lg:space-y-12">
          {sections.map((s) => {
            const open = desktop || openIds.has(s.id);
            return (
              <section
                key={s.id}
                id={s.id}
                aria-labelledby={`${s.id}-h`}
                className="scroll-mt-24 rounded-card border border-line/10 bg-paper/70 lg:scroll-mt-32 lg:rounded-none lg:border-0 lg:bg-transparent"
              >
                <h2 id={`${s.id}-h`} className="font-display text-display-sm">
                  {desktop ? (
                    s.title
                  ) : (
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={`${s.id}-body`}
                      onClick={() => toggle(s.id)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
                    >
                      {s.title}
                      <ChevronDown className={cn('h-5 w-5 shrink-0 transition-transform duration-calm', open && 'rotate-180')} aria-hidden />
                    </button>
                  )}
                </h2>
                <div id={`${s.id}-body`} hidden={!open} className="prose-imela px-4 pb-4 lg:mt-4 lg:px-0 lg:pb-0 [&>p:last-child]:mb-0">
                  {s.body}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
