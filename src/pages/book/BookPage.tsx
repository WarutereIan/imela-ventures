import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarCheck, Check, Clock, Lock, Phone } from 'lucide-react';
import { SERVICES, durationLabel, formatsLabel, getService, isBookable, isSlotBookable } from '../../data/services';
import { ORG } from '../../data/organisation';
import { getPractitioner } from '../../data/team';
import type { Service } from '../../data/types';
import { requestBooking, type BookingOutcome } from '../../domain/booking/api';
import { formatDayLabel } from '../../domain/booking/slots';
import { useAvailability } from '../../domain/booking/useAvailability';
import { LIMITS, validateContact, type ContactDetails, type FieldErrors } from '../../domain/booking/validation';
import { SlotPicker } from '../../components/booking/SlotPicker';
import { EnquiryForm } from '../../components/booking/EnquiryForm';
import Companion from '../../components/characters/Companion';
import { Alert, Chip, StatusBadge, TextArea, TextField } from '../../components/ui/primitives';
import { Button, buttonClasses } from '../../components/ui/Button';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import { cn } from '../../lib/cn';

type Step = 1 | 2 | 3 | 4;
const STEPS = ['Service', 'Time', 'Your details', 'Review'];

const individualServices = SERVICES.filter((s) => s.audience === 'individual' && isBookable(s));

function StepIndicator({ step }: { step: Step }) {
  return (
    <ol className="flex flex-wrap items-center gap-2 text-sm" aria-label="Booking steps">
      {STEPS.map((label, i) => {
        const n = (i + 1) as Step;
        const done = n < step;
        const current = n === step;
        return (
          <li key={label} className="flex items-center gap-2" aria-current={current ? 'step' : undefined}>
            <span
              className={cn(
                'grid h-7 w-7 place-items-center rounded-full text-xs font-bold',
                done && 'bg-sage-ink text-white',
                current && 'bg-ink-strong text-ivory',
                !done && !current && 'bg-ink/10 text-ink-soft'
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : n}
            </span>
            <span className={cn(current ? 'font-semibold text-ink-strong' : 'text-ink-soft', 'hidden sm:inline')}>{label}</span>
            {i < STEPS.length - 1 && <span className="mx-1 hidden h-px w-6 bg-line/20 sm:block" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}

function ServiceOption({ service, selected, onSelect }: { service: Service; selected: boolean; onSelect: () => void }) {
  return (
    <label
      className={cn(
        'flex cursor-pointer gap-4 rounded-card border-2 bg-paper p-4 transition-colors sm:p-5',
        selected ? 'border-ink-strong shadow-sticker' : 'border-transparent shadow-soft hover:border-lavender'
      )}
    >
      <input type="radio" name="service" className="mt-1 h-4 w-4 accent-[#2A2623]" checked={selected} onChange={onSelect} />
      <span className="flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-ink-strong">{service.name}</span>
          {service.audienceNote && <Chip>{service.audienceNote}</Chip>}
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-ink-soft">{service.summary}</span>
        <span className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden /> {durationLabel(service)}
          </span>
          <span>{formatsLabel(service)}</span>
          {service.bookingMode === 'enquiry' && <span className="font-semibold text-lavender-ink">Arranged with you by the team</span>}
        </span>
      </span>
    </label>
  );
}

export default function BookPage() {
  useDocumentTitle('Schedule a consultation');
  const [params] = useSearchParams();
  const initial = getService(params.get('service'));
  const practitioner = getPractitioner(params.get('practitioner') ?? undefined);

  // Only verified, individual services can be preselected; anything else falls back to a consultation.
  const preselect = initial && initial.audience === 'individual' && isBookable(initial) ? initial.id : 'consultation';
  const [serviceId, setServiceId] = useState<string>(preselect);
  const [step, setStep] = useState<Step>(preselect === initial?.id ? 2 : 1);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [details, setDetails] = useState<ContactDetails>({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState<FieldErrors<ContactDetails>>({});
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [outcome, setOutcome] = useState<BookingOutcome | null>(null);
  const [slotError, setSlotError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { state: availability, reload } = useAvailability();

  const service = individualServices.find((s) => s.id === serviceId) ?? individualServices[0];
  const unavailableRequested = initial && !isBookable(initial) ? initial : null;
  const orgRequested = initial?.audience === 'organisation' ? initial : null;

  useEffect(() => {
    headingRef.current?.focus();
  }, [step, outcome]);

  const go = (s: Step) => setStep(s);

  const nextFromDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateContact(details);
    setErrors(found);
    setConsentError(!consent);
    if (Object.keys(found).length || !consent) return;
    go(4);
  };

  const submit = async () => {
    if (!date || !time || submitting) return;
    setSubmitting(true);
    const result = await requestBooking({ service, date, time, contact: details });
    setSubmitting(false);
    if (!result.ok && result.reason === 'slot_taken') {
      setSlotError('Someone has just requested that time. Please choose another — we’ve refreshed what’s available.');
      setTime(null);
      void reload();
      go(2);
      return;
    }
    setOutcome(result);
  };

  const summaryRows = useMemo(
    () => [
      ['Service', service.name],
      ['When', date && time ? `${formatDayLabel(date)} at ${time} (Nairobi time)` : '—'],
      ['Duration', durationLabel(service)],
      ['With', practitioner?.name ?? service.practitionerIds.map((id) => getPractitioner(id)?.name).filter(Boolean)[0] ?? 'Assigned by Imela'],
      ['Name', details.name],
      ['Email', details.email],
      ['Phone', details.phone],
    ],
    [service, date, time, details, practitioner]
  );

  // --- Confirmation (only after the database accepted the request) ---
  if (outcome?.ok) {
    return (
      <section className="shell section">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex justify-center">
            <Companion variant="bloom" mood="joyful" pose="reach" tone="butter" size={150} />
          </div>
          <h1 ref={headingRef} tabIndex={-1} className="mt-6 font-display text-display-md focus:outline-none focus-visible:shadow-none">
            Your request has been received.
          </h1>
          <p className="mt-4 text-lg text-ink-soft">
            It isn't confirmed yet. The Imela team will review it and confirm by email or phone — usually within one working day.
          </p>
        </div>
        <div className="mx-auto mt-10 max-w-2xl rounded-card bg-paper p-6 shadow-soft">
          <p className="text-sm text-ink-soft">
            Reference <span className="font-mono font-semibold text-ink-strong">{outcome.id.slice(0, 8).toUpperCase()}</span>
          </p>
          <dl className="mt-4 divide-y divide-line/10">
            {summaryRows.slice(0, 4).map(([k, v]) => (
              <div key={k} className="grid grid-cols-3 gap-4 py-2.5 text-sm">
                <dt className="text-ink-soft">{k}</dt>
                <dd className="col-span-2 font-medium text-ink-strong">{v}</dd>
              </div>
            ))}
          </dl>
          {!outcome.notified && (
            <Alert tone="info" className="mt-4">
              Your request is saved and visible to the team in their dashboard. If you haven't heard back within one working day, please call {ORG.phoneDisplay}.
            </Alert>
          )}
          <h2 className="mt-6 font-semibold">What happens next</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-ink">
            <li>You'll receive a confirmation once the time is confirmed.</li>
            <li>To change or cancel, call {ORG.phoneDisplay} or email {ORG.email} — ideally 24 hours before.</li>
            <li>Before your session, it can help to note down what you'd most like to talk about. There's no need to prepare anything else.</li>
          </ul>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className={buttonClasses('primary')}>
            Back to home
          </Link>
          <Link to="/resources" className={buttonClasses('outline')}>
            Read gentle resources
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="shell py-10 lg:py-14">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div>
          <p className="eyebrow">Schedule a consultation</p>
          <h1 ref={headingRef} tabIndex={-1} className="mt-1 font-display text-display-md focus:outline-none focus-visible:shadow-none">
            {step === 1 && 'What would you like to book?'}
            {step === 2 && (service.bookingMode === 'slot' ? 'Choose a time that suits you' : `Request ${service.name.toLowerCase()}`)}
            {step === 3 && 'A few details so we can reach you'}
            {step === 4 && 'Check everything looks right'}
          </h1>
          <div className="mt-5">
            <StepIndicator step={step} />
          </div>

          {orgRequested && (
            <Alert tone="info" className="mt-6" title={`${orgRequested.name} is arranged with organisations directly`}>
              <Link to={`/organisations?service=${orgRequested.id}#enquire`} className="font-semibold underline">
                Go to the workplace enquiry form
              </Link>
            </Alert>
          )}
          {unavailableRequested && !orgRequested && (
            <Alert tone="warning" className="mt-6" title={`${unavailableRequested.name} isn't bookable yet`}>
              Imela is still confirming this service. An initial consultation is a good way to talk about it and find the right next step.
            </Alert>
          )}

          <div className="mt-8">
            {step === 1 && (
              <fieldset className="min-w-0">
                <legend className="sr-only">Service</legend>
                <div className="grid gap-3">
                  {individualServices.map((s) => (
                    <ServiceOption
                      key={s.id}
                      service={s}
                      selected={s.id === serviceId}
                      onSelect={() => {
                        setServiceId(s.id);
                        setDate(null);
                        setTime(null);
                      }}
                    />
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <Button onClick={() => go(2)}>
                    Continue <ArrowRight className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </fieldset>
            )}

            {step === 2 && !isSlotBookable(service) && (
              <div className="space-y-6">
                <p className="text-ink-soft">{service.summary} The team will contact you to agree a time that works for everyone.</p>
                <EnquiryForm service={service} />
                <Button variant="ghost" onClick={() => go(1)}>
                  <ArrowLeft className="h-4 w-4" aria-hidden /> Choose a different service
                </Button>
              </div>
            )}

            {step === 2 && isSlotBookable(service) && (
              <div>
                {slotError && (
                  <Alert tone="warning" className="mb-5" live>
                    {slotError}
                  </Alert>
                )}
                <SlotPicker
                  state={availability}
                  onReload={reload}
                  date={date}
                  time={time}
                  onChange={(d, t) => {
                    setDate(d);
                    setTime(t);
                    setSlotError(null);
                  }}
                />
                <div className="mt-8 flex justify-between gap-3">
                  <Button variant="ghost" onClick={() => go(1)}>
                    <ArrowLeft className="h-4 w-4" aria-hidden /> Service
                  </Button>
                  <Button onClick={() => go(3)} disabled={!date || !time}>
                    Continue <ArrowRight className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={nextFromDetails} noValidate className="space-y-5">
                <Alert tone="info">
                  We only ask for what we need to arrange your appointment. There's no need to describe what you're going through — you can share that in your
                  session, when you're ready.
                </Alert>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Your name"
                    hint="The name you'd like us to use."
                    required
                    autoComplete="name"
                    maxLength={LIMITS.name}
                    value={details.name}
                    onChange={(e) => setDetails({ ...details, name: e.target.value })}
                    error={errors.name}
                  />
                  <TextField
                    label="Email"
                    type="email"
                    required
                    autoComplete="email"
                    maxLength={LIMITS.email}
                    value={details.email}
                    onChange={(e) => setDetails({ ...details, email: e.target.value })}
                    error={errors.email}
                  />
                </div>
                <TextField
                  label="Phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  placeholder="+254 7XX XXX XXX"
                  maxLength={LIMITS.phone}
                  value={details.phone}
                  onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                  error={errors.phone}
                />
                <TextArea
                  label="Anything practical we should know?"
                  optional
                  hint="For example, accessibility needs or the best time to call. Please don't include detailed health information."
                  maxLength={LIMITS.message}
                  value={details.message}
                  onChange={(e) => setDetails({ ...details, message: e.target.value })}
                  error={errors.message}
                />
                <div>
                  <label className="flex items-start gap-3 text-sm text-ink">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 accent-[#2A2623]"
                      checked={consent}
                      onChange={(e) => {
                        setConsent(e.target.checked);
                        setConsentError(false);
                      }}
                      aria-invalid={consentError || undefined}
                      aria-describedby={consentError ? 'consent-error' : undefined}
                    />
                    <span>
                      I agree that Imela Ventures stores these details to arrange my appointment, as described in the{' '}
                      <Link to="/privacy#bookings" className="font-semibold underline underline-offset-2" target="_blank" rel="noreferrer">
                        privacy notice
                      </Link>
                      .
                    </span>
                  </label>
                  {consentError && (
                    <p id="consent-error" className="mt-1 text-xs font-medium text-danger">
                      Please confirm so we can store your request.
                    </p>
                  )}
                </div>
                <div className="flex justify-between gap-3 pt-2">
                  <Button variant="ghost" onClick={() => go(2)}>
                    <ArrowLeft className="h-4 w-4" aria-hidden /> Time
                  </Button>
                  <Button type="submit">
                    Review <ArrowRight className="h-4 w-4" aria-hidden />
                  </Button>
                </div>
              </form>
            )}

            {step === 4 && (
              <div>
                <dl className="divide-y divide-line/10 rounded-card bg-paper px-5 shadow-soft">
                  {summaryRows.map(([k, v]) => (
                    <div key={k} className="grid grid-cols-3 gap-4 py-3 text-sm">
                      <dt className="text-ink-soft">{k}</dt>
                      <dd className="col-span-2 break-words font-medium text-ink-strong">{v}</dd>
                    </div>
                  ))}
                </dl>
                {outcome && !outcome.ok && (
                  <Alert tone="danger" className="mt-5" title="Your request wasn't sent" live>
                    {outcome.reason === 'network' && 'We couldn’t reach our booking system. Please check your connection and try again.'}
                    {outcome.reason === 'not_configured' && `Online booking is temporarily unavailable. Please call ${ORG.phoneDisplay} or email ${ORG.email}.`}
                    {outcome.reason === 'rejected' && `Something in the request couldn’t be accepted. Please review your details, or call ${ORG.phoneDisplay}.`}
                  </Alert>
                )}
                <p className="mt-5 text-sm text-ink-soft">
                  This sends a booking <strong>request</strong>. It's confirmed once the Imela team has reviewed it.
                </p>
                <div className="mt-6 flex justify-between gap-3">
                  <Button variant="ghost" onClick={() => go(3)} disabled={submitting}>
                    <ArrowLeft className="h-4 w-4" aria-hidden /> Edit details
                  </Button>
                  <Button variant="accent" size="lg" onClick={submit} disabled={submitting}>
                    <CalendarCheck className="h-4 w-4" aria-hidden />
                    {submitting ? 'Sending request…' : 'Send booking request'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4 lg:sticky lg:top-32 lg:self-start">
          <div className="rounded-card bg-lavender p-5">
            <div className="flex items-center gap-3">
              <Companion variant="heart" mood="calm" pose="hold" hold="lantern" tone="rose" size={70} />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink">You're booking</p>
                <p className="font-semibold text-ink-strong">{service.name}</p>
                <div className="mt-1">
                  <StatusBadge status={service.status} />
                </div>
              </div>
            </div>
            {date && time && (
              <p className="mt-4 rounded-2xl bg-paper/70 px-3 py-2 text-sm">
                {formatDayLabel(date)} · {time}
              </p>
            )}
          </div>
          <div className="rounded-card bg-paper p-5 text-sm shadow-soft">
            <p className="flex items-center gap-2 font-semibold text-ink-strong">
              <Lock className="h-4 w-4" aria-hidden /> Private and confidential
            </p>
            <p className="mt-1.5 text-ink-soft">Your details are only used to arrange your care. If you came from Imela Persona, that conversation is not attached.</p>
            <p className="mt-4 flex items-center gap-2 font-semibold text-ink-strong">
              <Phone className="h-4 w-4" aria-hidden /> Prefer to talk?
            </p>
            <p className="mt-1.5 text-ink-soft">
              Call{' '}
              <a href={ORG.phoneHref} className="font-semibold text-ink underline underline-offset-2">
                {ORG.phoneDisplay}
              </a>
              . Imela is not an emergency service.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
