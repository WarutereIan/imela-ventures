import { Link } from 'react-router-dom';
import { ArrowRight, Clock, MapPin, Wallet } from 'lucide-react';
import type { Service } from '../../data/types';
import { durationLabel, feeLabel, formatsLabel, isBookable } from '../../data/services';
import { getPractitioner } from '../../data/team';
import { buttonClasses } from '../ui/Button';
import { Chip, StatusBadge } from '../ui/primitives';
import { cn } from '../../lib/cn';

/** Where "Book" leads: individual slot booking, or the right enquiry form. */
export function bookingHref(service: Service, via?: string): string {
  const q = new URLSearchParams({ service: service.id });
  if (via) q.set('via', via);
  if (service.audience === 'organisation') return `/organisations?${q.toString()}#enquire`;
  return `/book?${q.toString()}`;
}

export function exploreHref(service: Service): string {
  return `/find-support?service=${encodeURIComponent(service.id)}#catalogue`;
}

/**
 * Canonical presentation of a catalogue service, used by Persona, the service
 * finder, speciality pages and the booking table (mobile).
 */
export function ServiceCard({
  service,
  reason,
  via,
  className,
  compact = false,
  headingLevel = 'h3',
}: {
  service: Service;
  /** Why this may be relevant — shown when the card is a recommendation. */
  reason?: string;
  via?: string;
  className?: string;
  compact?: boolean;
  headingLevel?: 'h2' | 'h3' | 'h4';
}) {
  const Heading = headingLevel;
  const bookable = isBookable(service);
  const practitioner = service.practitionerIds.map(getPractitioner).find(Boolean);

  return (
    <article className={cn('flex flex-col rounded-card border border-line/10 bg-paper p-5 shadow-soft sm:p-6', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={service.status} />
        {service.audienceNote && <Chip>{service.audienceNote}</Chip>}
      </div>
      <Heading className="mt-3 text-lg font-semibold leading-snug text-ink-strong">{service.name}</Heading>
      {reason ? (
        <p className="mt-2 rounded-2xl bg-lavender-soft/70 px-3 py-2 text-sm leading-relaxed text-ink">
          <span className="font-semibold text-lavender-ink">Why this may help: </span>
          {reason}
        </p>
      ) : (
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{service.summary}</p>
      )}
      {!compact && (
        <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink">
          <div className="flex items-center gap-2">
            <dt className="sr-only">Duration</dt>
            <Clock className="h-4 w-4 shrink-0 text-ink-soft" aria-hidden />
            <dd>{durationLabel(service)}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="sr-only">Format</dt>
            <MapPin className="h-4 w-4 shrink-0 text-ink-soft" aria-hidden />
            <dd>{formatsLabel(service)}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="sr-only">Fee</dt>
            <Wallet className="h-4 w-4 shrink-0 text-ink-soft" aria-hidden />
            <dd>{feeLabel(service)}</dd>
          </div>
        </dl>
      )}
      {!compact && practitioner && (
        <p className="mt-3 text-xs text-ink-soft">
          With{' '}
          <Link to={`/team/${practitioner.slug}`} className="font-semibold text-ink underline-offset-4 hover:underline">
            {practitioner.name}
          </Link>
        </p>
      )}
      <div className="mt-5 flex flex-wrap gap-2 pt-1 sm:mt-auto">
        {bookable ? (
          <Link to={bookingHref(service, via)} className={buttonClasses('primary', 'sm')}>
            {service.bookingMode === 'slot' ? 'Book session' : 'Request this'}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : (
          <Link to={`/book?service=consultation${via ? `&via=${via}` : ''}`} className={buttonClasses('soft', 'sm')}>
            {service.status === 'referral_only' ? 'Talk to us about a referral' : 'Ask about this in a consultation'}
          </Link>
        )}
        <Link to={exploreHref(service)} className={buttonClasses('ghost', 'sm')}>
          Explore service
        </Link>
      </div>
    </article>
  );
}
