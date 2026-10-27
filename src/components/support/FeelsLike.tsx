import { Check } from 'lucide-react';
import { cn } from '../../lib/cn';
import type { FeelsStyle, HelpsStyle } from './groupStyles';

const STICKER_TONES = ['bg-lime', 'bg-lavender', 'bg-butter', 'bg-[#F29BA8]', 'bg-sky'];
const TILTS = [-3, 2.5, -1.5, 3, -2];

/** "It can feel like…" quotes in one of three tailored treatments. */
export function FeelsLike({ items, style }: { items: string[]; style: FeelsStyle }) {
  if (style === 'stickers') {
    return (
      <ul className="flex flex-wrap gap-x-4 gap-y-5 py-2">
        {items.map((q, i) => (
          <li
            key={q}
            className={cn(
              'max-w-full rounded-[1.4rem] border-[2.5px] border-ink-strong px-5 py-3 text-base font-semibold text-ink-strong shadow-sticker sm:max-w-[22rem]',
              STICKER_TONES[i % STICKER_TONES.length]
            )}
            style={{ transform: `rotate(${TILTS[i % TILTS.length]}deg)` }}
          >
            “{q}”
          </li>
        ))}
      </ul>
    );
  }

  if (style === 'notes') {
    return (
      <ul className="grid gap-4 sm:grid-cols-2">
        {items.map((q) => (
          <li
            key={q}
            className="relative rounded-card border border-line/10 bg-paper px-6 pb-5 pt-6 shadow-soft"
            style={{ backgroundImage: 'repeating-linear-gradient(transparent 0 31px, rgb(64 60 56 / 0.08) 31px 32px)' }}
          >
            <span aria-hidden className="absolute -top-2 left-6 h-4 w-12 -rotate-2 rounded-sm bg-butter/80" />
            <p className="font-hand text-[1.7rem] leading-[32px] text-ink-strong">{q}</p>
          </li>
        ))}
      </ul>
    );
  }

  // speech bubbles, alternating sides
  return (
    <ul className="space-y-4">
      {items.map((q, i) => {
        const right = i % 2 === 1;
        return (
          <li key={q} className={cn('flex', right ? 'justify-end' : 'justify-start')}>
            <p
              className={cn(
                'relative max-w-[min(30rem,92%)] rounded-[1.6rem] border border-line/10 bg-paper px-5 py-3.5 text-lg text-ink-strong shadow-soft',
                right ? 'rounded-br-md' : 'rounded-bl-md'
              )}
            >
              {q}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

/** "How talking with someone may help" as a checklist or numbered steps. */
export function HowSupportHelps({ items, style }: { items: string[]; style: HelpsStyle }) {
  if (style === 'steps') {
    return (
      <ol className="grid gap-4 md:grid-cols-3">
        {items.map((h, i) => (
          <li key={h} className="rounded-card border border-line/10 bg-paper p-5 shadow-soft">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-ink-strong font-display text-lg text-ivory">{i + 1}</span>
            <p className="mt-3 leading-relaxed text-ink">{h}</p>
          </li>
        ))}
      </ol>
    );
  }
  return (
    <ul className="space-y-3">
      {items.map((h) => (
        <li key={h} className="flex gap-3 text-lg leading-relaxed text-ink">
          <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sage-ink text-white">
            <Check className="h-3.5 w-3.5" aria-hidden />
          </span>
          {h}
        </li>
      ))}
    </ul>
  );
}
