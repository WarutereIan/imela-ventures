import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import { useResources } from '../../domain/resources';
import { RESOURCE_CATEGORIES } from '../../data/resources';
import ResourceCard from '../../components/resources/ResourceCard';
import Companion from '../../components/characters/Companion';
import Scene from '../../components/characters/Scene';
import { Alert, EmptyState, Spinner } from '../../components/ui/primitives';
import { Sticker } from '../../components/ui/Sticker';
import { buttonClasses } from '../../components/ui/Button';
import { cn } from '../../lib/cn';

export default function ResourcesPage() {
  useDocumentTitle('Resources');
  const { resources, loading, cmsUnavailable } = useResources();
  const [query, setQuery] = useState('');
  // The category filter lives in the URL so other pages can link to /resources?category=grief
  const [params, setParams] = useSearchParams();
  const requested = params.get('category');
  const category = RESOURCE_CATEGORIES.some((c) => c.id === requested) ? requested : null;
  const setCategory = (id: string | null) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (id) next.set('category', id);
        else next.delete('category');
        return next;
      },
      { replace: true }
    );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resources.filter(
      (r) =>
        (!category || r.category === category) &&
        (!q || r.title.toLowerCase().includes(q) || r.excerpt.toLowerCase().includes(q) || r.body.toLowerCase().includes(q))
    );
  }, [resources, query, category]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const r of resources) c[r.category] = (c[r.category] ?? 0) + 1;
    return c;
  }, [resources]);

  const filtering = Boolean(query.trim() || category);
  const [featured, ...rest] = filtered;

  return (
    <>
      <section className="shell grid items-center gap-10 pb-12 pt-14 md:grid-cols-[1.25fr_1fr] md:pt-20">
        <div>
          <p className="eyebrow">Read at your own pace</p>
          <h1 className="mt-2 font-display text-display-lg">Resources for the things that are hard to put into words.</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-soft">
            Short, practical reading on grief, relationships, worry, work and more. Take what helps and leave the rest.
          </p>
          <form role="search" className="mt-8 max-w-xl" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="resource-search" className="sr-only">
              Search resources
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" aria-hidden />
              <input
                id="resource-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search, e.g. sleep, grief, boundaries"
                className="h-14 w-full rounded-pill border border-line/20 bg-paper pl-12 pr-12 text-base shadow-soft placeholder:text-ink-soft/70 focus:border-lavender-ink focus:outline-none focus:ring-2 focus:ring-lavender-ink/30"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-ink-soft hover:bg-ink/5"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>
        </div>
        <Scene environment="scribble" framed className="h-72 md:h-80">
          <div className="relative flex h-72 items-end justify-center gap-2 pb-4 md:h-80">
            <Companion variant="cloud" mood="curious" pose="hold" hold="leaf" tone="sky" size={150} />
            <Companion variant="sprout" mood="calm" pose="wave" tone="butter" size={110} />
            <div className="absolute left-6 top-8">
              <Sticker tone="lime" tilt={-6}>
                take what helps
              </Sticker>
            </div>
            <div className="absolute right-6 top-20">
              <Sticker tone="paper" tilt={5}>
                no pressure
              </Sticker>
            </div>
          </div>
        </Scene>
      </section>

      <section aria-labelledby="library-heading" className="shell pb-8">
        <h2 id="library-heading" className="sr-only">
          Library
        </h2>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          <button
            type="button"
            aria-pressed={category === null}
            onClick={() => setCategory(null)}
            className={cn(
              'rounded-pill border px-4 py-2 text-sm font-semibold transition-colors',
              category === null ? 'border-ink-strong bg-ink-strong text-ivory' : 'border-line/20 bg-paper text-ink hover:border-ink/40'
            )}
          >
            All
          </button>
          {RESOURCE_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={category === c.id}
              onClick={() => setCategory(category === c.id ? null : c.id)}
              className={cn(
                'rounded-pill border px-4 py-2 text-sm font-semibold transition-colors',
                category === c.id ? 'border-ink-strong bg-ink-strong text-ivory' : 'border-line/20 bg-paper text-ink hover:border-ink/40'
              )}
            >
              {c.label}
              {counts[c.id] ? <span className="ml-1.5 font-normal opacity-70">{counts[c.id]}</span> : null}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {loading && <Spinner label="Loading the latest articles…" />}
          {cmsUnavailable && !loading && (
            <Alert tone="info">We couldn't load the latest articles just now, so you're seeing our starter guides. Please try again later.</Alert>
          )}
          <p className="text-sm text-ink-soft" aria-live="polite">
            {filtering ? `${filtered.length} ${filtered.length === 1 ? 'resource' : 'resources'} found` : ''}
          </p>
        </div>

        {filtered.length === 0 && !loading ? (
          <div className="mt-6">
            <EmptyState title="Nothing matches that yet." art={<Companion variant="cloud" mood="uncertain" tone="sky" size={110} animate="none" />}>
              <p>Try a different word or category — or tell us what you're looking for and we'll help you find support.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button type="button" className={buttonClasses('outline', 'sm')} onClick={() => { setQuery(''); setCategory(null); }}>
                  Clear filters
                </button>
                <Link to="/persona" className={buttonClasses('primary', 'sm')}>
                  Talk to Imela Persona
                </Link>
              </div>
            </EmptyState>
          </div>
        ) : (
          <div className="mt-6 grid gap-6">
            {featured && <ResourceCard resource={featured} size="feature" />}
            {rest.length > 0 && (
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((r, i) => {
                  // Avoid a lone card on the last row: let it span the row as a feature.
                  const orphan = rest.length > 1 && rest.length % 3 === 1 && i === rest.length - 1;
                  return (
                    <li key={r.slug} className={orphan ? 'flex sm:col-span-2 lg:col-span-3 [&>article]:flex-1' : 'flex [&>article]:flex-1'}>
                      <ResourceCard resource={r} size={orphan ? 'feature' : 'regular'} />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </section>

      <section className="shell pt-12">
        <div className="grid items-center gap-8 rounded-blob bg-ink-strong p-8 text-ivory md:grid-cols-[1fr_auto] md:p-12">
          <div>
            <p className="font-hand text-2xl text-lavender">Reading is a start</p>
            <h2 className="mt-1 font-display text-display-md text-ivory">Would it help to talk it through?</h2>
            <p className="mt-3 max-w-xl text-ivory/80">
              Articles can't know your situation. A counsellor can listen to what's actually going on and help you decide what comes next.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/book?service=consultation" className={buttonClasses('soft')}>
                Schedule Consultation
              </Link>
              <Link to="/persona" className={buttonClasses('outline', 'md', 'border-ivory/70 text-ivory hover:bg-ivory hover:text-ink-strong')}>
                Talk privately with Persona
              </Link>
            </div>
          </div>
          <Companion variant="heart" mood="hopeful" pose="hold" tone="rose" size={150} className="mx-auto" />
        </div>
      </section>
    </>
  );
}
