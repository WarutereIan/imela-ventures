import { Link } from 'react-router-dom';
import { BookOpen, ArrowUpRight, Clock } from 'lucide-react';
import { useResources } from '../../domain/resources';
import { Chip } from '../ui/primitives';
import { Carousel } from '../ui/Carousel';

const CATEGORY_LABEL: Record<string, string> = {
  grief: 'Grief & loss',
  relationships: 'Relationships',
  anxiety: 'Anxiety & worry',
  stress: 'Stress',
  addiction: 'Addiction & recovery',
  family: 'Family wellbeing',
  identity: 'Identity',
  workplace: 'Workplace wellbeing',
  coping: 'Coping skills',
};

/** Up to three matching articles from the library, plus links to each category. */
export function RelatedResources({ categories }: { categories: string[] }) {
  const { resources } = useResources();
  if (categories.length === 0) return null;
  const articles = resources.filter((r) => categories.includes(r.category)).slice(0, 3);

  return (
    <div className="space-y-6">
      {articles.length > 0 && (
        <Carousel label="Related resources" gridFrom="md" gridClassName="md:grid-cols-3 md:gap-4" slideClassName="w-[80%] sm:w-[55%]">
          {articles.map((r) => (
              <Link
                key={r.slug}
                to={`/resources/${r.slug}`}
                className="group flex h-full flex-col rounded-card border border-line/10 bg-paper p-5 shadow-soft transition-transform duration-quick hover:-translate-y-1"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Chip tone="butter">{CATEGORY_LABEL[r.category] ?? r.category}</Chip>
                  {r.reviewStatus === 'draft' && <Chip>Draft · awaiting review</Chip>}
                </div>
                <span className="mt-3 block font-semibold leading-snug text-ink-strong group-hover:underline group-hover:underline-offset-4">{r.title}</span>
                <span className="mt-2 line-clamp-3 block text-sm text-ink-soft">{r.excerpt}</span>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-xs text-ink-soft">
                  <Clock className="h-3.5 w-3.5" aria-hidden /> {r.readMinutes} min read
                </span>
              </Link>
          ))}
        </Carousel>
      )}
      <ul className="grid gap-2 sm:grid-cols-2 sm:gap-3">
        {categories.map((id) => (
          <li key={id}>
            <Link
              to={`/resources?category=${encodeURIComponent(id)}`}
              className="group flex items-center gap-3 rounded-card border border-line/10 bg-paper px-4 py-3 shadow-soft transition-transform duration-quick hover:-translate-y-0.5 sm:gap-4 sm:px-5 sm:py-4"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-butter/70 text-butter-ink sm:h-11 sm:w-11">
                <BookOpen className="h-5 w-5" aria-hidden />
              </span>
              <span className="flex-1">
                <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-ink-soft">Browse the library</span>
                <span className="block font-semibold text-ink-strong">All {(CATEGORY_LABEL[id] ?? id).toLowerCase()} resources</span>
              </span>
              <ArrowUpRight className="h-5 w-5 text-ink-soft transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
