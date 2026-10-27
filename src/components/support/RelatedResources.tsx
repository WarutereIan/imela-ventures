import { Link } from 'react-router-dom';
import { BookOpen, ArrowUpRight, Clock } from 'lucide-react';
import { useResources } from '../../domain/resources';
import { Chip } from '../ui/primitives';

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
        <ul className="grid gap-4 md:grid-cols-3">
          {articles.map((r) => (
            <li key={r.slug}>
              <Link
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
            </li>
          ))}
        </ul>
      )}
      <ul className="grid gap-3 sm:grid-cols-2">
        {categories.map((id) => (
          <li key={id}>
            <Link
              to={`/resources?category=${encodeURIComponent(id)}`}
              className="group flex items-center gap-4 rounded-card border border-line/10 bg-paper px-5 py-4 shadow-soft transition-transform duration-quick hover:-translate-y-0.5"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-butter/70 text-butter-ink">
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
