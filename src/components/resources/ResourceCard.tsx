import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock } from 'lucide-react';
import Companion from '../characters/Companion';
import { categoryArt } from './categoryArt';
import { CATEGORY_BY_ID } from '../../data/resources';
import type { Resource } from '../../data/types';
import { cn } from '../../lib/cn';

export function DraftLabel({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center rounded-pill border border-dashed border-butter-ink/50 bg-butter/40 px-2.5 py-0.5 text-[0.7rem] font-semibold text-butter-ink', className)}>
      Draft · awaiting review by an Imela counsellor
    </span>
  );
}

/** Resource tile. `size="feature"` gives a larger, horizontal layout. */
export default function ResourceCard({ resource, size = 'regular', headingLevel = 'h3' }: { resource: Resource; size?: 'regular' | 'feature'; headingLevel?: 'h2' | 'h3' }) {
  const Heading = headingLevel;
  const art = categoryArt(resource.category);
  const category = CATEGORY_BY_ID[resource.category];
  const feature = size === 'feature';

  return (
    <article
      className={cn(
        'group relative flex overflow-hidden rounded-card border border-line/10 bg-paper shadow-soft transition-shadow duration-calm hover:shadow-lift',
        feature ? 'flex-col md:flex-row' : 'flex-col'
      )}
    >
      <div className={cn('relative flex items-end justify-center', art.surface, feature ? 'h-52 md:h-auto md:w-2/5' : 'h-40')}>
        <Companion variant={art.variant} mood={art.mood} tone={category?.tone} size={feature ? 150 : 104} animate="none" className="translate-y-3" />
      </div>
      <div className={cn('flex flex-1 flex-col', feature ? 'p-6 md:p-10' : 'p-5')}>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold uppercase tracking-[0.12em] text-ink-soft">{category?.label ?? 'Wellbeing'}</span>
          <span className="inline-flex items-center gap-1 text-ink-soft">
            <Clock className="h-3.5 w-3.5" aria-hidden /> {resource.readMinutes} min read
          </span>
        </div>
        <Heading className={cn('mt-2 font-display text-ink-strong', feature ? 'text-display-md' : 'text-xl leading-snug')}>
          <Link to={`/resources/${resource.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {resource.title}
          </Link>
        </Heading>
        <p className={cn('mt-2 text-ink-soft', feature ? 'text-lg' : 'text-sm leading-relaxed')}>{resource.excerpt}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          {resource.reviewStatus === 'draft' ? <DraftLabel /> : <span className="text-xs text-ink-soft">By {resource.author}</span>}
          <ArrowUpRight className="h-5 w-5 shrink-0 text-ink-soft transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
        </div>
      </div>
    </article>
  );
}
