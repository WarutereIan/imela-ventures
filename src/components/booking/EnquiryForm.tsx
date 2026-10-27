import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import type { Service } from '../../data/types';
import { ORG } from '../../data/organisation';
import { enquiryMailto, sendEnquiry, type EnquiryInput } from '../../domain/booking/api';
import { validateContact, type ContactDetails, type FieldErrors } from '../../domain/booking/validation';
import { Alert, TextArea, TextField } from '../ui/primitives';
import { Button } from '../ui/Button';

/**
 * Request form for individual services that are arranged by the team rather
 * than booked into a slot (e.g. family sessions). Never shows success unless
 * the request was actually stored.
 */
export function EnquiryForm({ service }: { service: Service }) {
  const [details, setDetails] = useState<ContactDetails>({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState<FieldErrors<ContactDetails>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'fallback' | 'error'>('idle');

  const input: EnquiryInput = { kind: 'individual', serviceId: service.id, ...details };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateContact(details, { phoneRequired: false });
    setErrors(found);
    if (Object.keys(found).length) return;
    setStatus('sending');
    const outcome = await sendEnquiry(input);
    if (outcome.ok) setStatus('sent');
    else if (outcome.reason === 'table_missing' || outcome.reason === 'not_configured') setStatus('fallback');
    else setStatus('error');
  };

  if (status === 'sent') {
    return (
      <Alert tone="success" title="Request received" live>
        Thank you. The Imela team will contact you to arrange your {service.name.toLowerCase()}.
      </Alert>
    );
  }

  const set = (k: keyof ContactDetails) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setDetails((d) => ({ ...d, [k]: e.target.value }));

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Your name" required autoComplete="name" value={details.name} onChange={set('name')} error={errors.name} />
        <TextField label="Email" type="email" required autoComplete="email" value={details.email} onChange={set('email')} error={errors.email} />
      </div>
      <TextField label="Phone" optional type="tel" autoComplete="tel" value={details.phone} onChange={set('phone')} error={errors.phone} />
      <TextArea
        label="Anything that helps us arrange it"
        optional
        hint="For example, who would attend and times that suit. Please keep personal health details for your session."
        value={details.message}
        onChange={set('message')}
        error={errors.message}
      />
      {status === 'fallback' && (
        <Alert tone="warning" title="Online requests aren't switched on yet" live>
          Your request has not been sent. You can send it from your own email app instead, or call us on {ORG.phoneDisplay}.
          <a href={enquiryMailto(ORG.email, input, service.name)} className="mt-2 flex items-center gap-1.5 font-semibold underline">
            <Mail className="h-4 w-4" aria-hidden /> Open in your email app
          </a>
        </Alert>
      )}
      {status === 'error' && (
        <Alert tone="danger" title="We couldn't send your request" live>
          Please check your connection and try again, or call us on {ORG.phoneDisplay}.
        </Alert>
      )}
      <Button type="submit" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send request'}
      </Button>
    </form>
  );
}
