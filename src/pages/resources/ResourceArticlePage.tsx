import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, LifeBuoy } from 'lucide-react';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import { recordView, useResources } from '../../domain/resources';
import { CATEGORY_BY_ID } from '../../data/resources';
import RichText from '../../components/content/RichText';
import ResourceCard, { DraftLabel } from '../../components/resources/ResourceCard';
import { categoryArt } from '../../components/resources/categoryArt';
import Companion from '../../components/characters/Companion';
import { NotFoundPage, PageLoader } from '../../components/layout/PageStates';
import { buttonClasses } from '../../components/ui/Button';
import { Alert } from '../../components/ui/primitives';

export default function ResourceArticlePage() {
  const { slug } = useParams();
  const { resources, loading } = useResources();
  const resource = resources.find((r) => r.slug === slug);
  useDocumentTitle(resource?.title ?? 'Resources');

  useEffect(() => {
    if (resource) recordView(resource);
  }, [resource]);

  const related = useMemo(
    () => (resource ? resources.filter((r) => r.slug !== resource.slug && r.category === resource.category).slice(0, 2) : []),
    [resource, resources]
  );
  const more = useMemo(
    () => (resource && related.length < 2 ? resources.filter((r) => r.slug !== resource.slug && !related.includes(r)).slice(0, 2 - related.length) : []),
    [resource, resources, related]
  );

  if (!resource) return loading ? <PageLoader /> : <NotFoundPage />;

  const category = CATEGORY_BY_ID[resource.category];
  const art = categoryArt(resource.category);
  const published = resource.publishedAt
    ? new Date(resource.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <article>
      <header className={`${art.surface} border-b border-line/10`}>
        <div className="shell grid items-end gap-8 pt-10 md:grid-cols-[1fr_auto] md:pt-14">
          <div className="pb-10 md:pb-14">
            <Link to="/resources" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-ink-strong">
              <ArrowLeft className="h-4 w-4" aria-hidden /> All resources
            </Link>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">{category?.label ?? 'Wellbeing'}</p>
            <h1 className="mt-2 max-w-3xl font-display text-display-lg">{resource.title}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-ink-soft">
              <span>By {resource.author}</span>
              {published && <span>· {published}</span>}
              <span className="inline-flex items-center gap-1">
                · <Clock className="h-4 w-4" aria-hidden /> {resource.readMinutes} min read
              </span>
            </div>
            {resource.reviewStatus === 'draft' && <DraftLabel className="mt-4" />}
          </div>
          <Companion variant={art.variant} mood={art.mood} tone={category?.tone} size={180} className="mx-auto hidden translate-y-4 md:block" />
        </div>
      </header>

      <div className="shell grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:py-16">
        <div>
          {resource.reviewStatus === 'draft' && (
            <Alert tone="warning" className="mb-8 max-w-prose">
              This is starter material written for general wellbeing. It hasn't yet been reviewed by an Imela counsellor and isn't professional
              advice for your situation.
            </Alert>
          )}
          <p className="mb-8 max-w-prose font-display text-display-sm text-ink">{resource.excerpt}</p>
          <RichText source={resource.body} />
        </div>

        <aside className="space-y-6 lg:sticky lg:top-32 lg:self-start" aria-label="Support options">
          <div className="rounded-card bg-lavender-soft p-6">
            <p className="font-hand text-2xl text-lavender-ink">Want to talk about it?</p>
            <p className="mt-2 text-sm leading-relaxed text-ink">You can explore privately with Persona, or book a short first conversation with a counsellor.</p>
            <div className="mt-4 flex flex-col gap-2">
              <Link to="/persona" className={buttonClasses('accent', 'sm')}>
                Talk to Imela Persona
              </Link>
              <Link to="/book?service=consultation" className={buttonClasses('outline', 'sm')}>
                Schedule Consultation
              </Link>
            </div>
          </div>
          <div className="rounded-card border border-rose/30 bg-paper p-6 text-sm">
            <p className="flex items-center gap-2 font-semibold text-rose-ink">
              <LifeBuoy className="h-4 w-4" aria-hidden /> If you're not safe right now
            </p>
            <p className="mt-2 text-ink">In Kenya, call 999 or 112 for emergency services. Use "Need urgent help?" at the top of any page for more contacts.</p>
          </div>
        </aside>
      </div>

      {(related.length > 0 || more.length > 0) && (
        <section aria-labelledby="related-heading" className="shell pt-4">
          <h2 id="related-heading" className="font-display text-display-sm">
            {related.length > 0 ? 'Related reading' : 'More to read'}
          </h2>
          <ul className="mt-6 grid gap-6 md:grid-cols-2">
            {[...related, ...more].map((r) => (
              <li key={r.slug} className="flex [&>article]:flex-1">
                <ResourceCard resource={r} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
