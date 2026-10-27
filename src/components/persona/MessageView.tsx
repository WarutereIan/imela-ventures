import { Link } from 'react-router-dom';
import { Info, Sparkles } from 'lucide-react';
import type { PersonaMessage } from '../../domain/persona/machine';
import { ServiceCard } from '../services/ServiceCard';
import { Carousel } from '../ui/Carousel';
import { CrisisContacts } from '../layout/UrgentHelp';
import { CRISIS_OUTSIDE_KENYA } from '../../data/crisis';
import { cn } from '../../lib/cn';

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 rounded-3xl rounded-bl-md bg-paper px-4 py-3 shadow-soft" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span key={i} className="typing-dot h-2 w-2 rounded-full bg-ink-soft" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  );
}

function Bubble({ from, children, className }: { from: 'persona' | 'person'; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex', from === 'person' ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[min(36rem,92%)] whitespace-pre-wrap break-words rounded-3xl px-4 py-3 text-[0.98rem] leading-relaxed',
          from === 'person' ? 'rounded-br-md bg-lavender-ink text-white' : 'rounded-bl-md bg-paper text-ink-strong shadow-soft',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function MessageView({ message }: { message: PersonaMessage }) {
  if (message.from === 'person') {
    return (
      <Bubble from="person">
        <span className="sr-only">You said: </span>
        {message.text}
      </Bubble>
    );
  }

  switch (message.kind) {
    case 'reflection':
      return (
        <Bubble from="persona" className="border border-lavender bg-lavender-soft/60">
          <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-lavender-ink">
            <Info className="h-3.5 w-3.5" aria-hidden />
            Persona's understanding · not a diagnosis
          </span>
          {message.text}
        </Bubble>
      );

    case 'ai':
      return (
        <Bubble from="persona">
          <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            AI-generated reflection
          </span>
          {message.text}
        </Bubble>
      );

    case 'safety':
      return (
        <div role="alert" className="rounded-card border-2 border-rose/40 bg-rose-soft/60 p-4 sm:p-5">
          <p className="font-semibold text-ink-strong">{message.text}</p>
          <CrisisContacts className="mt-4" compact />
          <p className="mt-3 text-sm text-ink">{CRISIS_OUTSIDE_KENYA}</p>
          <p className="mt-2 text-xs text-ink-soft">
            Persona is an automated guide. No one is monitoring this conversation, so it can't send help to you.
          </p>
        </div>
      );

    case 'recommendations': {
      const { result } = message;
      return (
        // w-0 + min-w-full: fills the chat column without letting the carousel's width stretch it.
        <section aria-label="Support options" className="w-0 min-w-full space-y-3">
          {message.text && <Bubble from="persona">{message.text}</Bubble>}
          <Carousel label="Suggested support options" bleed={false} gridFrom="lg" gridClassName="lg:grid-cols-2 lg:gap-3" slideClassName="w-[88%] sm:w-[62%]">
            {result.recommendations.map((r) => (
              <div key={r.service.id} className="relative">
                <ServiceCard service={r.service} reason={r.reason} via="persona" headingLevel="h3" className="h-full" />
              </div>
            ))}
          </Carousel>
          {result.referrals.length > 0 && (
            <div className="rounded-2xl bg-sky-soft px-4 py-3 text-sm text-sky-ink">
              <p className="font-semibold">Specialist support outside Imela</p>
              <p className="mt-1">
                {result.referrals.map((s) => s.name).join(', ')} {result.referrals.length > 1 ? 'are' : 'is'} provided by specialist clinicians. A counsellor can talk
                with you about where to go.
              </p>
            </div>
          )}
          <p className="px-1 text-xs leading-relaxed text-ink-soft">
            These suggestions come from Imela's own list of services and are a starting point, not a clinical assessment. If you book, we'll ask for your name and
            contact details on the next page — what you've typed here is <strong>not</strong> attached to your booking.{' '}
            <Link to="/support" className="underline underline-offset-2">
              Browse all areas
            </Link>
          </p>
        </section>
      );
    }

    default:
      return <Bubble from="persona">{message.text}</Bubble>;
  }
}
