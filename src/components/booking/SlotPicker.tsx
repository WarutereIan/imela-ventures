import { useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import type { AvailabilityState } from '../../domain/booking/useAvailability';
import { formatDayLabel } from '../../domain/booking/slots';
import { Alert, Spinner } from '../ui/primitives';
import { Button } from '../ui/Button';
import { cn } from '../../lib/cn';

export function SlotPicker({
  state,
  onReload,
  date,
  time,
  onChange,
}: {
  state: AvailabilityState;
  onReload: () => void;
  date: string | null;
  time: string | null;
  onChange: (date: string, time: string | null) => void;
}) {
  const days = useMemo(() => (state.status === 'loading' ? [] : state.days), [state]);
  const [activeDate, setActiveDate] = useState<string | null>(date);

  useEffect(() => {
    if (!activeDate && days.length) setActiveDate(days.find((d) => d.slots.some((s) => s.available))?.date ?? days[0].date);
  }, [days, activeDate]);

  if (state.status === 'loading') return <Spinner label="Checking available times…" className="py-10" />;

  const day = days.find((d) => d.date === activeDate);

  return (
    <div className="space-y-5">
      {state.status === 'error' && (
        <Alert tone="warning" title="We couldn't load live availability">
          You can still request a time below — the team will confirm it or suggest another.
          <Button size="sm" variant="ghost" className="ml-2 h-7 px-2" onClick={onReload}>
            <RefreshCw className="h-3.5 w-3.5" aria-hidden /> Try again
          </Button>
        </Alert>
      )}
      {state.status === 'ready' && state.snapshot.source === 'unknown' && (
        <Alert tone="info">Times shown are Imela's usual hours. Your request is confirmed by the team, who will suggest another time if needed.</Alert>
      )}

      <fieldset className="min-w-0">
        <legend className="text-sm font-semibold text-ink-strong">Choose a day</legend>
        <div className="-mx-1 mt-3 flex snap-x gap-2 overflow-x-auto px-1 pb-2">
          {days.map((d) => {
            const open = d.slots.filter((s) => s.available).length;
            const selected = d.date === activeDate;
            const [weekday, ...rest] = formatDayLabel(d.date, 'short').split(' ');
            return (
              <button
                key={d.date}
                type="button"
                aria-pressed={selected}
                disabled={open === 0}
                onClick={() => {
                  setActiveDate(d.date);
                  onChange(d.date, null);
                }}
                className={cn(
                  'flex w-[4.75rem] shrink-0 snap-start flex-col items-center rounded-2xl border px-2 py-3 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                  selected ? 'border-ink-strong bg-ink-strong text-ivory' : 'border-line/15 bg-paper hover:border-lavender-ink'
                )}
              >
                <span className="text-xs font-semibold uppercase tracking-wide">{weekday.replace(',', '')}</span>
                <span className="mt-0.5 text-xl font-bold leading-none">{rest[0]}</span>
                <span className="text-xs">{rest.slice(1).join(' ')}</span>
                <span className={cn('mt-1 text-[0.7rem]', selected ? 'text-ivory/80' : 'text-ink-soft')}>{open ? `${open} open` : 'Full'}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {day && (
        <fieldset className="min-w-0">
          <legend className="text-sm font-semibold text-ink-strong">Times on {formatDayLabel(day.date)} (Nairobi time)</legend>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {day.slots.map((s) => {
              const selected = date === day.date && time === s.time;
              return (
                <button
                  key={s.time}
                  type="button"
                  aria-pressed={selected}
                  disabled={!s.available}
                  onClick={() => onChange(day.date, s.time)}
                  className={cn(
                    'rounded-2xl border px-3 py-3 text-sm font-semibold transition-colors',
                    selected && 'border-lavender-ink bg-lavender-ink text-white',
                    !selected && s.available && 'border-line/15 bg-paper text-ink-strong hover:border-lavender-ink hover:bg-lavender-soft',
                    !s.available && 'cursor-not-allowed border-dashed border-line/20 bg-transparent text-ink-soft line-through'
                  )}
                >
                  {s.time}
                  {!s.available && <span className="sr-only"> (booked)</span>}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}
      {days.length === 0 && <Alert tone="info">There are no open times in the next 30 days. Please call us and we'll find a time together.</Alert>}
    </div>
  );
}
