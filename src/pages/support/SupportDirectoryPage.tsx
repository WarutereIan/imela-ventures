import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ChevronDown, Search, Sparkles, X } from 'lucide-react';
import { CONCERN_GROUPS, concernsInGroup, getGroup } from '../../data/concerns';
import Companion from '../../components/characters/Companion';
import { Sticker } from '../../components/ui/Sticker';
import { buttonClasses } from '../../components/ui/Button';
import { GROUP_STYLE } from '../../components/support/groupStyles';
import { searchConcerns } from '../../components/support/search';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import { cn } from '../../lib/cn';
import { Carousel } from '../../components/ui/Carousel';

export default function SupportDirectoryPage() {
  useDocumentTitle('What we help with');
  const [params, setParams] = useSearchParams();
  // What someone types is kept in memory only — never written to the URL or browser history.
  // An incoming ?q= link pre-fills the search once, then is removed from the address bar.
  const [query, setQueryState] = useState(() => params.get('q') ?? '');
  const results = useMemo(() => searchConcerns(query), [query]);

  useEffect(() => {
    if (params.has('q')) setParams({}, { replace: true });
  }, [params, setParams]);

  const setQuery = (value: string) => setQueryState(value);

  return (
    <>
      <section className="relative overflow-hidden pb-6 pt-8 sm:pb-10 sm:pt-16">
        <div className="shell grid items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="eyebrow">Start wherever feels right</p>
            <h1 className="mt-1 font-display text-display-xl">What would you like support with?</h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink sm:mt-6 sm:text-xl">
              Browse the areas people most often bring to us, or search in your own words. Each page explains what it can feel like, how talking may help, and which support is available today.
            </p>
            <form role="search" className="mt-6 max-w-xl sm:mt-8" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="concern-search" className="sr-only">
                Search what we help with
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" aria-hidden />
                <input
                  id="concern-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value.slice(0, 120))}
                  placeholder="e.g. exams, my husband, can't sleep, betting…"
                  autoComplete="off"
                  className="h-14 w-full rounded-pill border-2 border-ink-strong/80 bg-paper pl-14 pr-12 text-base text-ink-strong shadow-sticker placeholder:text-ink-soft/70 focus:outline-none focus:ring-4 focus:ring-lavender/60"
                  aria-describedby="concern-search-help"
                />
                {query && (
                  <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-ink-soft hover:bg-ink/5" aria-label="Clear search">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p id="concern-search-help" className="mt-2 pl-5 text-xs text-ink-soft">
                Searching happens on your device — nothing you type here is sent anywhere.
              </p>
            </form>
          </div>
          <div className="relative hidden h-72 lg:block" aria-hidden>
            <div className="absolute bottom-0 left-0">
              <Companion variant="heart" mood="hopeful" pose="hold" tone="rose" size={150} />
            </div>
            <div className="absolute bottom-6 left-36">
              <Companion variant="sprout" mood="curious" pose="wave" tone="lavender" size={170} />
            </div>
            <div className="absolute bottom-0 right-0">
              <Companion variant="cloud" mood="calm" pose="idle" tone="sky" size={150} />
            </div>
            <div className="absolute left-4 top-6">
              <Sticker tone="lime" tilt={-6}>
                no wrong door
              </Sticker>
            </div>
            <div className="absolute right-6 top-0">
              <Sticker tone="butter" tilt={5}>
                your words are enough
              </Sticker>
            </div>
          </div>
        </div>
      </section>

      {query && (
        <section aria-labelledby="results-title" className="shell pb-6">
          <h2 id="results-title" className="font-display text-display-sm" aria-live="polite">
            {results.length > 0 ? `${results.length} ${results.length === 1 ? 'topic' : 'topics'} that may fit “${query}”` : `Nothing matched “${query}” yet`}
          </h2>
          {results.length > 0 ? (
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {results.slice(0, 9).map((c) => (
                <li key={c.slug}>
                  <Link to={`/support/${c.slug}`} className="group flex h-full items-start gap-3 rounded-card border border-line/10 bg-paper p-4 shadow-soft hover:-translate-y-0.5">
                    <Companion variant={c.character.variant} mood={c.character.mood} tone={c.character.tone} size={52} animate="none" className="shrink-0" />
                    <span className="flex-1">
                      <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">{getGroup(c.group)?.title}</span>
                      <span className="block font-semibold text-ink-strong">{c.title}</span>
                      <span className="mt-0.5 block text-sm text-ink-soft">{c.tagline}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-card bg-lavender-soft p-5">
              <p className="text-ink">Some things are hard to put into a search. Imela can help you explore it in your own words.</p>
              <Link to="/persona" className={buttonClasses('accent', 'sm')}>
                Talk it through
              </Link>
            </div>
          )}
        </section>
      )}

      <section aria-labelledby="areas-title" className="shell py-6 md:py-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3 md:mb-8 md:gap-4">
          <div>
            <p className="eyebrow">Nine areas</p>
            <h2 id="areas-title" className="font-display text-display-md">
              Explore by area
            </h2>
          </div>
          <p className="max-w-md text-sm text-ink-soft">These are discovery categories, not diagnoses. Each page shows honestly which support is available today and what we're still confirming.</p>
        </div>
        {/*
          Phones: a compact, expandable list so all nine areas are visible at a
          glance (a carousel would hide eight of them). Tablet and up: the bento.
        */}
        <ul className="space-y-2 md:hidden">
          {CONCERN_GROUPS.map((g) => {
            const s = GROUP_STYLE[g.id];
            const items = concernsInGroup(g.id).filter((c) => c.group === g.id);
            return (
              <li key={g.id}>
                <details className={cn('group overflow-hidden rounded-[1.4rem]', s.tile)}>
                  <summary className="flex cursor-pointer list-none items-center gap-3 p-3 pr-4 [&::-webkit-details-marker]:hidden">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-paper/40" aria-hidden>
                      <Companion variant={g.character.variant} mood={g.character.mood} tone={g.character.tone} animate="none" className="h-auto w-10" />
                    </span>
                    <span className="flex-1">
                      <span className="block font-display text-[1.2rem] leading-tight">{g.title}</span>
                      <span className={cn('block text-xs', s.tileSoft)}>{items.length} topics</span>
                    </span>
                    <ChevronDown className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
                  </summary>
                  <div className="px-4 pb-4">
                    <p className={cn('text-sm leading-relaxed', s.tileSoft)}>{g.blurb}</p>
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {items.map((c) => (
                        <li key={c.slug}>
                          <Link to={`/support/${c.slug}`} className={cn('inline-flex rounded-pill px-3 py-1.5 text-xs font-semibold', s.tileChip)}>
                            {c.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link to={`/support/area/${g.id}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-4">
                      Explore {g.title.toLowerCase()} <ArrowUpRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>

        <ul className="hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-6">
          {CONCERN_GROUPS.map((g) => {
            const s = GROUP_STYLE[g.id];
            const items = concernsInGroup(g.id).filter((c) => c.group === g.id);
            const big = g.id === 'emotional-wellbeing';
            return (
              <li key={g.id} className={cn('relative flex flex-col overflow-hidden rounded-blob p-6 sm:p-7', s.tile, s.span)}>
                <div className="relative z-10 flex flex-1 flex-col">
                  <h3 className={cn('font-display leading-tight [color:inherit]', big ? 'text-display-md' : 'text-[1.6rem]')}>
                    <Link to={`/support/area/${g.id}`} className="after:absolute after:inset-0 after:content-[''] hover:underline hover:underline-offset-4">
                      {g.title}
                    </Link>
                  </h3>
                  <p className={cn('mt-2 max-w-md text-sm leading-relaxed', s.tileSoft, big && 'text-base lg:pr-40')}>{g.blurb}</p>
                  <ul className={cn('relative z-10 mt-5 flex flex-wrap gap-1.5', big && 'lg:pr-44')}>
                    {items.map((c) => (
                      <li key={c.slug}>
                        <Link to={`/support/${c.slug}`} className={cn('inline-flex rounded-pill px-3 py-1.5 text-xs font-semibold transition-colors', s.tileChip)}>
                          {c.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold">
                    Explore area <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </span>
                </div>
                <div className={cn('pointer-events-none absolute', big ? 'bottom-3 right-5 hidden lg:block' : '-bottom-3 -right-2')} aria-hidden>
                  <Companion
                    variant={g.character.variant}
                    mood={g.character.mood}
                    pose={g.character.pose}
                    tone={g.character.tone}
                    size={big ? 170 : g.id === 'workplace' ? 130 : 96}
                    animate={big ? 'ambient' : 'none'}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-label="Other ways to begin" className="shell py-6 md:py-10">
        <Carousel label="Other ways to begin" gridFrom="md" gridClassName="md:grid-cols-2 md:gap-4" slideClassName="w-[86%] sm:w-[70%]">
          <Link to="/persona" className="group relative block overflow-hidden rounded-blob bg-lavender-ink p-6 text-white md:p-8">
            <Sparkles className="h-6 w-6" aria-hidden />
            <p className="mt-4 font-display text-display-sm text-white">Not sure? Talk it through with Imela.</p>
            <p className="mt-2 max-w-sm text-white/80">Begin in your own words, without telling us who you are.</p>
            <span className="mt-6 inline-flex items-center gap-1.5 font-semibold">
              Meet Persona <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </span>
            <div className="pointer-events-none absolute -bottom-4 right-4" aria-hidden>
              <Companion variant="drift" mood="curious" pose="wave" tone="lavender" size={120} animate="none" />
            </div>
          </Link>
          <Link to="/find-support" className="group relative block overflow-hidden rounded-blob border-[2.5px] border-ink-strong bg-butter p-6 text-ink-strong md:p-8">
            <Search className="h-6 w-6" aria-hidden />
            <p className="mt-4 font-display text-display-sm">Describe what you need, see what fits.</p>
            <p className="mt-2 max-w-sm text-ink">The service finder matches what you write to the support Imela offers today.</p>
            <span className="mt-6 inline-flex items-center gap-1.5 font-semibold">
              Open the service finder <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </span>
            <div className="pointer-events-none absolute -bottom-4 right-4" aria-hidden>
              <Companion variant="bloom" mood="hopeful" pose="hold" tone="butter" size={110} animate="none" />
            </div>
          </Link>
        </Carousel>
      </section>
    </>
  );
}
