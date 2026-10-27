import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { CONCERN_GROUPS, concernsInGroup } from '../../data/concerns';
import type { ConcernGroupId } from '../../data/types';
import { cn } from '../../lib/cn';

const chip =
  'rounded-pill border border-ink/15 bg-paper px-3.5 py-2 text-sm font-medium text-ink-strong transition-colors hover:border-lavender-ink hover:bg-lavender-soft';

/**
 * Two-level picker: choose an area, then the closest concern. Used when Persona
 * hasn't understood, or when the person wants to correct its interpretation.
 */
export function ConcernPicker({
  onChoose,
  initialGroup,
  label = 'Choose an area that feels close',
}: {
  onChoose: (slug: string) => void;
  initialGroup?: ConcernGroupId;
  label?: string;
}) {
  const [group, setGroup] = useState<ConcernGroupId | null>(initialGroup ?? null);

  if (!group) {
    return (
      <div role="group" aria-label={label} className="flex flex-wrap gap-2">
        {CONCERN_GROUPS.map((g) => (
          <button key={g.id} type="button" className={chip} onClick={() => setGroup(g.id)}>
            {g.title}
          </button>
        ))}
      </div>
    );
  }

  const current = CONCERN_GROUPS.find((g) => g.id === group);
  return (
    <div role="group" aria-label={`Concerns in ${current?.title}`} className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={() => setGroup(null)} className={cn(chip, 'inline-flex items-center gap-1 bg-ivory-deep')}>
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> All areas
      </button>
      {concernsInGroup(group).map((c) => (
        <button key={c.slug} type="button" className={chip} onClick={() => onChoose(c.slug)}>
          {c.title}
        </button>
      ))}
    </div>
  );
}
