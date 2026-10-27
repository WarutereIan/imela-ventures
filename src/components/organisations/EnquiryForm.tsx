import React, { useState } from 'react';
import { CheckCircle2, Mail } from 'lucide-react';
import { SERVICES, getService } from '../../data/services';
import { ORG } from '../../data/organisation';
import { enquiryMailto, sendEnquiry, type EnquiryInput } from '../../domain/booking/api';
import { validateContact, LIMITS } from '../../domain/booking/validation';
import { Button, buttonClasses } from '../ui/Button';
import { Alert, SelectField, TextArea, TextField } from '../ui/primitives';

const ORG_SERVICES = SERVICES.filter((s) => s.audience === 'organisation');
const TEAM_SIZES = ['1–20 people', '21–50 people', '51–200 people', '201–500 people', 'More than 500'];

interface FormState {
  name: string;
  email: string;
  phone: string;
  organisation: string;
  teamSize: string;
  serviceId: string;
  message: string;
  preferredContact: 'email' | 'phone';
}

type Errors = Partial<Record<keyof FormState, string>>;

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent' }
  | { kind: 'fallback'; reason: 'table_missing' | 'not_configured' }
  | { kind: 'error'; reason: 'rejected' | 'network' };

/**
 * Workplace programme enquiry. Success is shown only when the enquiry was
 * actually stored; otherwise the person is offered their own email app.
 */
export function EnquiryForm({ initialServiceId }: { initialServiceId?: string | null }) {
  const initial = initialServiceId && getService(initialServiceId)?.audience === 'organisation' ? initialServiceId : '';
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    organisation: '',
    teamSize: '',
    serviceId: initial,
    message: '',
    preferredContact: 'email',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const toInput = (): EnquiryInput => ({
    kind: 'organisation',
    serviceId: form.serviceId || undefined,
    name: form.name,
    email: form.email,
    phone: form.phone || undefined,
    organisation: form.organisation,
    teamSize: form.teamSize || undefined,
    preferredContact: form.preferredContact,
    message: form.message || undefined,
  });

  const validate = (): Errors => {
    const contact = validateContact({ name: form.name, email: form.email, phone: form.phone, message: form.message }, { phoneRequired: false });
    const e: Errors = { ...contact };
    if (!form.organisation.trim()) e.organisation = 'Please tell us which organisation you’re enquiring for.';
    else if (form.organisation.length > 160) e.organisation = 'Please keep this under 160 characters.';
    if (form.preferredContact === 'phone' && !form.phone.trim()) e.phone = 'Add a phone number if you’d like us to call you.';
    return e;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setStatus({ kind: 'idle' });
      return;
    }
    setStatus({ kind: 'sending' });
    const result = await sendEnquiry(toInput());
    if (result.ok) setStatus({ kind: 'sent' });
    else if (result.reason === 'table_missing' || result.reason === 'not_configured') setStatus({ kind: 'fallback', reason: result.reason });
    else setStatus({ kind: 'error', reason: result.reason });
  };

  if (status.kind === 'sent') {
    return (
      <div role="status" className="rounded-card bg-paper p-8 text-center shadow-soft">
        <CheckCircle2 className="mx-auto h-10 w-10 text-success" aria-hidden />
        <h3 className="mt-3 font-display text-display-sm">Thank you — your enquiry has been received.</h3>
        <p className="mt-2 text-ink-soft">
          The Imela team will be in touch by {form.preferredContact === 'phone' ? 'phone' : 'email'} to arrange a conversation about your
          organisation’s needs.
        </p>
      </div>
    );
  }

  const mailto = enquiryMailto(ORG.email, toInput(), getService(form.serviceId)?.name);
  const errorCount = Object.keys(errors).length;

  return (
    <form onSubmit={submit} noValidate className="space-y-5 rounded-card bg-paper p-6 shadow-soft sm:p-8" aria-describedby="enquiry-note">
      {errorCount > 0 && (
        <Alert tone="danger" live title="Please check the form">
          {errorCount === 1 ? 'One field needs attention.' : `${errorCount} fields need attention.`}
        </Alert>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Your name" autoComplete="name" value={form.name} onChange={(e) => set('name', e.target.value)} error={errors.name} maxLength={LIMITS.name} required />
        <TextField label="Work email" type="email" autoComplete="email" value={form.email} onChange={(e) => set('email', e.target.value)} error={errors.email} required />
        <TextField label="Organisation" autoComplete="organization" value={form.organisation} onChange={(e) => set('organisation', e.target.value)} error={errors.organisation} required />
        <TextField label="Phone" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} error={errors.phone} optional />
        <SelectField label="Team size" value={form.teamSize} onChange={(e) => set('teamSize', e.target.value)} optional>
          <option value="">Select…</option>
          {TEAM_SIZES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </SelectField>
        <SelectField label="Interested in" value={form.serviceId} onChange={(e) => set('serviceId', e.target.value)} optional>
          <option value="">Not sure yet — let’s talk</option>
          {ORG_SERVICES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </SelectField>
      </div>
      <TextArea
        label="What would you like to achieve?"
        value={form.message}
        onChange={(e) => set('message', e.target.value)}
        error={errors.message}
        maxLength={LIMITS.message}
        hint="Please don’t include personal details about individual employees."
        optional
      />
      <fieldset>
        <legend className="text-sm font-semibold text-ink-strong">How should we get back to you?</legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {(['email', 'phone'] as const).map((c) => (
            <label key={c} className="inline-flex cursor-pointer items-center gap-2 rounded-pill border border-line/20 bg-ivory px-4 py-2 text-sm has-[:checked]:border-lavender-ink has-[:checked]:bg-lavender-soft">
              <input type="radio" name="preferredContact" value={c} checked={form.preferredContact === c} onChange={() => set('preferredContact', c)} className="accent-[rgb(var(--c-lavender-ink))]" />
              {c === 'email' ? 'Email' : 'Phone call'}
            </label>
          ))}
        </div>
      </fieldset>

      {status.kind === 'fallback' && (
        <Alert tone="warning" live title="We couldn’t send this from the website just now">
          <p>Our online enquiry inbox isn’t switched on yet, so nothing has been sent. You can send the same details from your own email app instead.</p>
          <a href={mailto} className={buttonClasses('primary', 'sm', 'mt-3')}>
            <Mail className="h-4 w-4" aria-hidden /> Open in your email app
          </a>
        </Alert>
      )}
      {status.kind === 'error' && (
        <Alert tone="danger" live title="Your enquiry wasn’t sent">
          <p>
            {status.reason === 'network' ? 'We couldn’t reach our server. Please check your connection and try again.' : 'Something went wrong on our side. Please try again.'}{' '}
            You can also email <a className="underline" href={mailto}>{ORG.email}</a> or call <a className="underline" href={ORG.phoneHref}>{ORG.phoneDisplay}</a>.
          </p>
        </Alert>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p id="enquiry-note" className="text-xs text-ink-soft">
          We use these details only to respond to your enquiry.
        </p>
        <Button type="submit" size="lg" disabled={status.kind === 'sending'}>
          {status.kind === 'sending' ? 'Sending…' : 'Send enquiry'}
        </Button>
      </div>
    </form>
  );
}
