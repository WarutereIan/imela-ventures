import React, { Children, useCallback, useEffect, useId, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useReducedMotion } from '../../lib/useReducedMotion';

type Breakpoint = 'sm' | 'md' | 'lg';

/**
 * Swipeable, accessible carousel built on native CSS scroll-snap.
 *
 * - Touch swipe, trackpad and mouse drag-scroll come from the browser itself.
 * - Arrow buttons, a position counter and keyboard arrows for everyone else.
 * - The next slide peeks in so it's obvious there's more to see.
 * - Never auto-plays (auto-advancing content is hard to read and to control).
 * - `gridFrom` turns it back into a normal grid from that breakpoint up, so
 *   desktop keeps its layout while phones get a compact swipe row.
 *
 * Breakpoint class names are spelled out in full so Tailwind can see them.
 */
const GRID_FROM: Record<Breakpoint, { track: string; slide: string; controls: string }> = {
  sm: { track: 'sm:grid sm:overflow-visible sm:snap-none sm:mx-0 sm:px-0 sm:pb-0', slide: 'sm:w-auto', controls: 'sm:hidden' },
  md: { track: 'md:grid md:overflow-visible md:snap-none md:mx-0 md:px-0 md:pb-0', slide: 'md:w-auto', controls: 'md:hidden' },
  lg: { track: 'lg:grid lg:overflow-visible lg:snap-none lg:mx-0 lg:px-0 lg:pb-0', slide: 'lg:w-auto', controls: 'lg:hidden' },
};

export interface CarouselProps {
  /** Accessible name, e.g. "Areas we help with". */
  label: string;
  children: React.ReactNode;
  /** Width of each slide while in carousel mode (Tailwind width classes). */
  slideClassName?: string;
  /** Extra classes per slide, by index — e.g. grid column spans once `gridFrom` applies. */
  slideClassNames?: (string | undefined)[];
  /** Become a grid from this breakpoint up. Omit to stay a carousel everywhere. */
  gridFrom?: Breakpoint;
  /** Grid columns/gap used once `gridFrom` applies, e.g. "lg:grid-cols-3 lg:gap-5". */
  gridClassName?: string;
  className?: string;
  /** Tone of the control buttons for dark backgrounds. */
  tone?: 'light' | 'dark';
  /** Extend the track to the screen edges (inside .shell) so slides can peek. */
  bleed?: boolean;
}

export function Carousel({
  label,
  children,
  slideClassName = 'w-[84%] sm:w-[60%]',
  slideClassNames,
  gridFrom,
  gridClassName = '',
  className,
  tone = 'light',
  bleed = true,
}: CarouselProps) {
  const slides = Children.toArray(children).filter(Boolean);
  const count = slides.length;
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(count <= 1);
  const reduced = useReducedMotion();
  const id = useId();
  const grid = gridFrom ? GRID_FROM[gridFrom] : null;

  const update = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const { scrollLeft, scrollWidth, clientWidth } = track;
    setAtStart(scrollLeft <= 4);
    setAtEnd(scrollLeft + clientWidth >= scrollWidth - 4);
    const items = Array.from(track.children) as HTMLElement[];
    const left = track.getBoundingClientRect().left;
    let best = 0;
    let bestDist = Infinity;
    items.forEach((el, i) => {
      const dist = Math.abs(el.getBoundingClientRect().left - left - parseFloat(getComputedStyle(track).paddingLeft || '0'));
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setIndex(best);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    update();
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [update, count]);

  const goTo = (i: number) => {
    const track = trackRef.current;
    const target = track?.children[Math.max(0, Math.min(count - 1, i))] as HTMLElement | undefined;
    if (!track || !target) return;
    const padding = parseFloat(getComputedStyle(track).paddingLeft || '0');
    track.scrollTo({ left: target.offsetLeft - padding, behavior: reduced ? 'auto' : 'smooth' });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(index + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(index - 1);
    }
  };

  const btn = cn(
    'grid h-10 w-10 place-items-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-35',
    tone === 'dark' ? 'border-ivory/40 text-ivory hover:bg-ivory/10' : 'border-ink/20 bg-paper text-ink-strong shadow-soft hover:bg-lavender-soft'
  );

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label} className={cn('relative min-w-0 max-w-full', className)}>
      <div
        ref={trackRef}
        id={id}
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-label={`${label} — swipe or use arrow keys`}
        className={cn(
          'scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2 focus-visible:rounded-card',
          bleed && '-mx-[var(--gutter)] scroll-px-[var(--gutter)] px-[var(--gutter)]',
          grid?.track,
          gridClassName
        )}
      >
        {slides.map((child, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            className={cn('shrink-0 snap-start [&>*]:h-full', slideClassName, grid?.slide, slideClassNames?.[i])}
          >
            {child}
          </div>
        ))}
      </div>

      {count > 1 && (
        <div className={cn('mt-4 flex items-center justify-between gap-4', grid?.controls)}>
          <div className="flex items-center gap-1.5" aria-hidden>
            {slides.map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-calm',
                  i === index ? 'w-6' : 'w-1.5',
                  tone === 'dark' ? (i === index ? 'bg-ivory' : 'bg-ivory/35') : i === index ? 'bg-ink-strong' : 'bg-ink/20'
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className={cn('mr-1 text-xs font-semibold tabular-nums', tone === 'dark' ? 'text-ivory/80' : 'text-ink-soft')} aria-live="polite">
              {index + 1} / {count}
            </span>
            <button type="button" className={btn} onClick={() => goTo(index - 1)} disabled={atStart} aria-controls={id} aria-label="Previous">
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <button type="button" className={btn} onClick={() => goTo(index + 1)} disabled={atEnd} aria-controls={id} aria-label="Next">
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
