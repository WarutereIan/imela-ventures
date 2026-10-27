import React from 'react';
import { cn } from '../../lib/cn';

const tones = {
  lime: 'bg-lime text-ink-strong',
  lavender: 'bg-lavender text-ink-strong',
  rose: 'bg-rose-soft text-rose-ink',
  butter: 'bg-butter text-ink-strong',
  sky: 'bg-sky text-ink-strong',
  paper: 'bg-paper text-ink-strong',
  ink: 'bg-ink-strong text-ivory',
} as const;

/**
 * A die-cut "sticker" label — thick outline, slight tilt, hard shadow. Used
 * sparingly as a playful accent on hero art and section headers.
 */
export function Sticker({
  children,
  tone = 'paper',
  tilt = -4,
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  tilt?: number;
  className?: string;
}) {
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-pill border-[2.5px] border-ink-strong px-3.5 py-1.5 text-sm font-bold shadow-sticker', tones[tone], className)}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      {children}
    </span>
  );
}
