import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { SERVICES, durationLabel, feeLabel, formatsLabel, isBookable } from '../../data/services';
import { getPractitioner } from '../../data/team';
import type { Service, ServiceAudience } from '../../data/types';
import { bookingHref, ServiceCard } from '../services/ServiceCard';
import { StatusBadge } from '../ui/primitives';
import { Carousel } from '../ui/Carousel';
import { buttonClasses } from '../ui/Button';
import { useAvailability, firstOpenSlot } from '../../domain/booking/useAvailability';
import { formatDayLabel } from '../../domain/booking/slots';
import { cn } from '../../lib/cn';

type SortKey = 'recommended' | 'name' | 'duration';

const STATUS_ORDER = { available: 0, awaiting_verification: 1, referral_only: 2, unavailable: 3 } as const;

function AvailabilityCell({ service, nextOpen, live }: { service: Service; nextOpen: string | null; live: boolean | null }) {
  if (!isBookable(service)) return <span className="text-ink-soft">Not bookable yet</span>;
  if (service.bookingMode === 'enquiry') return <span>On request</span>;
  if (live === null) return <span className="text-ink-soft">Checking…</span>;
  if (!live) return <span>Choose a time; we confirm it</span>;
  return nextOpen ? <span>Next: {nextOpen}</span> : <span>No open times in the next 30 days</span>;
}

/**
 * Themed catalogue table. On small screens it becomes a list of cards — a
 * table with eight columns is unreadable on a phone.
 */
export function ServiceTable({ highlight }: { highlight?: string | null }) {
  const [audience, setAudience] = useState<ServiceAudience | 'all'>('individual');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sort, setSort] = useState<SortKey>('recommended');
  const { state } = useAvailability();

  const live = state.status === 'loading' ? null : state.status === 'ready' && state.snapshot.source === 'live';
  const nextOpen = useMemo(() => {
    if (state.status === 'loading') return null;
    const slot = firstOpenSlot(state.days);
    return slot ? `${formatDayLabel(slot.date, 'short')}, ${slot.time}` : null;
  }, [state]);

  const rows = useMemo(() => {
    let list = SERVICES.filter((s) => (audience === 'all' || s.audience === audience) && (!onlyAvailable || s.status === 'available'));
    list = [...list].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'duration') return (a.durationMinutes ?? 999) - (b.durationMinutes ?? 999);
      return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    });
    return list;
  }, [audience, onlyAvailable, sort]);

  const seg = (on: boolean) =>
    cn('rounded-pill px-4 py-2 text-sm font-semibold transition-colors', on ? 'bg-ink-strong text-ivory' : 'text-ink hover:bg-ink/5');

  return (
    <div>
      <div className="flex flex-col gap-4 rounded-card bg-paper/70 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label="Who is it for" className="flex flex-wrap gap-1">
          {(
            [
              ['individual', 'Individuals & families'],
              ['organisation', 'Organisations'],
              ['all', 'Everything'],
            ] as const
          ).map(([v, label]) => (
            <button key={v} type="button" aria-pressed={audience === v} onClick={() => setAudience(v)} className={seg(audience === v)}>
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4 px-2 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="h-4 w-4 accent-[#4E3D99]" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} />
            Available now only
          </label>
          <label className="flex items-center gap-2">
            Sort
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="rounded-pill border border-line/20 bg-paper px-3 py-1.5">
              <option value="recommended">Availability</option>
              <option value="name">Name</option>
              <option value="duration">Duration</option>
            </select>
          </label>
        </div>
      </div>

      <p className="mt-3 text-sm text-ink-soft" aria-live="polite">
        Showing {rows.length} service{rows.length === 1 ? '' : 's'}. Fees are confirmed during your consultation.
      </p>

      {/* Desktop table */}
      <div className="mt-4 hidden overflow-hidden rounded-card border border-line/10 bg-paper shadow-soft lg:block">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">Imela services, formats, durations, fees and availability</caption>
          <thead className="bg-ink-strong text-ivory">
            <tr>
              {['Service', 'What it supports', 'Format', 'Practitioner', 'Duration', 'Fee', 'Availability', ''].map((h, i) => (
                <th key={h || i} scope="col" className="px-4 py-3 font-semibold first:pl-6 last:pr-6">
                  {h || <span className="sr-only">Action</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              const practitioner = s.practitionerIds.map(getPractitioner).find(Boolean);
              return (
                <tr key={s.id} id={`svc-${s.id}`} className={cn('border-t border-line/10 align-top', highlight === s.id && 'bg-lavender-soft/70')}>
                  <th scope="row" className="py-4 pl-6 pr-4 font-normal">
                    <span className="block font-semibold text-ink-strong">{s.name}</span>
                    <span className="mt-1.5 inline-block">
                      <StatusBadge status={s.status} />
                    </span>
                  </th>
                  <td className="max-w-[16rem] px-4 py-4 text-ink">{s.supports.slice(0, 3).join(' · ')}</td>
                  <td className="px-4 py-4">{formatsLabel(s)}</td>
                  <td className="px-4 py-4">
                    {practitioner ? (
                      <Link to={`/team/${practitioner.slug}`} className="underline-offset-4 hover:underline">
                        {practitioner.name}
                      </Link>
                    ) : (
                      <span className="text-ink-soft">To be confirmed</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">{durationLabel(s)}</td>
                  <td className="px-4 py-4">{feeLabel(s)}</td>
                  <td className="px-4 py-4">
                    <AvailabilityCell service={s} nextOpen={nextOpen} live={live} />
                  </td>
                  <td className="py-4 pl-4 pr-6 text-right">
                    {isBookable(s) ? (
                      <Link to={bookingHref(s, 'finder')} className={buttonClasses('primary', 'sm', 'whitespace-nowrap')} aria-label={`${s.bookingMode === 'slot' ? 'Book' : 'Request'} ${s.name}`}>
                        {s.bookingMode === 'slot' ? 'Book' : 'Request'} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                      </Link>
                    ) : (
                      <Link to="/book?service=consultation&via=finder" className={buttonClasses('soft', 'sm', 'whitespace-nowrap')} aria-label={`Ask about ${s.name}`}>
                        Ask us
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Phones & tablets: a swipe row of cards — eight table columns don't fit a small screen. */}
      <Carousel label="Imela services" className="mt-4 lg:hidden" slideClassName="w-[86%] sm:w-[48%]">
        {rows.map((s) => (
          <div key={s.id} id={`svc-m-${s.id}`} className="relative scroll-mt-28">
            <ServiceCard service={s} via="finder" className={cn('h-full', highlight === s.id && 'ring-2 ring-lavender-ink')} />
          </div>
        ))}
      </Carousel>
    </div>
  );
}
