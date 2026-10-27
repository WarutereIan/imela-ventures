import type { Service } from '../../data/types';
import { ServiceCard } from '../services/ServiceCard';
import { Alert } from '../ui/primitives';

/**
 * Lists services honestly by verification status: what can be booked today
 * first, then what Imela is still confirming, then referral guidance.
 */
export function ServicesByStatus({ services, via }: { services: Service[]; via: string }) {
  const available = services.filter((s) => s.status === 'available');
  const pending = services.filter((s) => s.status === 'awaiting_verification');
  const referral = services.filter((s) => s.status === 'referral_only');

  return (
    <div className="space-y-10">
      {available.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft">Available now</h3>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            {available.map((s) => (
              <ServiceCard key={s.id} service={s} via={via} headingLevel="h4" />
            ))}
          </div>
        </div>
      )}
      {pending.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft">Being confirmed</h3>
          <Alert tone="warning" className="mt-3">
            Imela is still confirming these services, so they can't be booked yet. You're welcome to ask about them in an initial consultation.
          </Alert>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            {pending.map((s) => (
              <ServiceCard key={s.id} service={s} via={via} compact headingLevel="h4" className="bg-paper/70" />
            ))}
          </div>
        </div>
      )}
      {referral.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft">Referral guidance</h3>
          <p className="mt-2 max-w-2xl text-sm text-ink-soft">
            Some support needs a specialist outside Imela. We can talk with you about where to look — we won't present it as something we provide ourselves.
          </p>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            {referral.map((s) => (
              <ServiceCard key={s.id} service={s} via={via} compact headingLevel="h4" className="bg-sky-soft/60" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
