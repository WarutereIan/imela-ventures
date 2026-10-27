import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { Service } from '../../data/types';
import { exploreHref, ServiceCard } from '../services/ServiceCard';
import { Alert, StatusBadge } from '../ui/primitives';
import { Carousel } from '../ui/Carousel';

/**
 * Phones: services that can't be booked are listed as compact rows instead of
 * full cards. They still show their honest status and never offer booking.
 */
function CompactList({ services, note }: { services: Service[]; note: string }) {
  return (
    <ul className="mt-3 divide-y divide-line/10 rounded-card border border-line/10 bg-paper md:hidden">
      {services.map((s) => (
        <li key={s.id}>
          <Link to={exploreHref(s)} className="flex items-center gap-3 px-4 py-3">
            <span className="flex-1">
              <span className="block text-sm font-semibold text-ink-strong">{s.name}</span>
              <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
                <StatusBadge status={s.status} /> {note}
              </span>
            </span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-ink-soft" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * Lists services honestly by verification status: what can be booked today
 * first, then what Imela is still confirming, then referral guidance.
 */
export function ServicesByStatus({ services, via }: { services: Service[]; via: string }) {
  const available = services.filter((s) => s.status === 'available');
  const pending = services.filter((s) => s.status === 'awaiting_verification');
  const referral = services.filter((s) => s.status === 'referral_only');

  return (
    <div className="space-y-8 md:space-y-10">
      {available.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft">Available now</h3>
          <Carousel
            label="Services available now"
            className="mt-4"
            gridFrom="md"
            gridClassName="md:grid-cols-2 md:gap-5"
            slideClassName="w-[86%] sm:w-[62%]"
          >
            {available.map((s) => (
              // `relative` keeps the card's visually-hidden labels clipped inside the swipe row.
              <div key={s.id} className="relative">
                <ServiceCard service={s} via={via} headingLevel="h4" className="h-full" />
              </div>
            ))}
          </Carousel>
        </div>
      )}
      {pending.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft">Being confirmed</h3>
          <Alert tone="warning" className="mt-3">
            <span className="md:hidden">Not bookable yet — ask about them in an initial consultation.</span>
            <span className="hidden md:inline">
              Imela is still confirming these services, so they can't be booked yet. You're welcome to ask about them in an initial consultation.
            </span>
          </Alert>
          <CompactList services={pending} note="Ask in a consultation" />
          <div className="mt-4 hidden gap-5 md:grid md:grid-cols-2">
            {pending.map((s) => (
              <ServiceCard key={s.id} service={s} via={via} compact headingLevel="h4" className="bg-paper/70" />
            ))}
          </div>
        </div>
      )}
      {referral.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft">Referral guidance</h3>
          <p className="mt-2 hidden max-w-2xl text-sm text-ink-soft md:block">
            Some support needs a specialist outside Imela. We can talk with you about where to look — we won't present it as something we provide ourselves.
          </p>
          <CompactList services={referral} note="We can advise where to go" />
          <div className="mt-4 hidden gap-5 md:grid md:grid-cols-2">
            {referral.map((s) => (
              <ServiceCard key={s.id} service={s} via={via} compact headingLevel="h4" className="bg-sky-soft/60" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
