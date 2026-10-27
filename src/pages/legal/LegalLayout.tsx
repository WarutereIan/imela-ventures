import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Companion, { type CompanionVariant } from '../../components/characters/Companion';

export interface LegalSection {
  id: string;
  title: string;
  body: React.ReactNode;
}

/** Shared reading layout for the privacy notice and terms: sticky contents + long-form sections. */
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
  return (
    <>
      <header className="shell grid items-end gap-8 pb-10 pt-14 md:grid-cols-[1fr_auto] md:pt-20">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-2 font-display text-display-lg">{title}</h1>
          <div className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">{intro}</div>
          <p className="mt-4 text-sm text-ink-soft">Last updated: {updated}</p>
        </div>
        <Companion variant={companion} mood="calm" pose="hold" hold="lantern" tone="lavender" size={150} className="mx-auto hidden md:block" />
      </header>

      <div className="shell">
        <div
          role="note"
          className="flex gap-3 rounded-card border-2 border-dashed border-butter-ink/50 bg-butter/40 p-5 text-butter-ink"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <p className="text-sm leading-relaxed">
            <strong>This notice needs review by a qualified data-protection professional before launch.</strong> It describes how this website
            currently works, in plain language. It is not a statement of legal compliance.
          </p>
        </div>
      </div>

      <div className="shell grid gap-12 py-12 lg:grid-cols-[240px_minmax(0,1fr)]">
        <nav aria-label="On this page" className="lg:sticky lg:top-32 lg:self-start">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">On this page</p>
          <ol className="mt-3 space-y-1.5 text-sm">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="block rounded-lg px-2 py-1 text-ink hover:bg-ink/5 hover:text-ink-strong">
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="space-y-12">
          {sections.map((s) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-32">
              <h2 id={`${s.id}-h`} className="font-display text-display-sm">
                {s.title}
              </h2>
              <div className="prose-imela mt-4 [&>p:last-child]:mb-0">{s.body}</div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
