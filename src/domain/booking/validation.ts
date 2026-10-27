/** Shared client-side validation. The database enforces the same limits (see migrations). */
export interface ContactDetails {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export const LIMITS = { name: 120, email: 254, phone: 32, message: 2000 } as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9 ()-]{7,20}$/;

export function validateContact(d: ContactDetails, opts: { phoneRequired?: boolean } = {}): FieldErrors<ContactDetails> {
  const errors: FieldErrors<ContactDetails> = {};
  const name = d.name.trim();
  const email = d.email.trim();
  const phone = d.phone.trim();

  if (!name) errors.name = 'Please tell us what to call you.';
  else if (name.length > LIMITS.name) errors.name = `Please keep this under ${LIMITS.name} characters.`;

  if (!email) errors.email = 'We need an email address to confirm your appointment.';
  else if (email.length > LIMITS.email || !EMAIL_RE.test(email)) errors.email = 'That email address doesn’t look quite right.';

  if (opts.phoneRequired !== false && !phone) errors.phone = 'A phone number helps us reach you if a time needs to change.';
  else if (phone && !PHONE_RE.test(phone)) errors.phone = 'Please use digits, spaces and an optional + only, e.g. +254 7XX XXX XXX.';

  if (d.message.length > LIMITS.message) errors.message = `Please keep this under ${LIMITS.message} characters.`;
  return errors;
}

/**
 * Natural-language finder input: at least a few characters of real text and
 * a sensible maximum.
 */
export function validateNeed(text: string): string | null {
  const t = text.trim();
  if (t.length === 0) return 'Write a few words about what’s going on — or choose one of the suggestions.';
  if (t.length < 3) return 'Could you add a little more? Even a few words helps.';
  if (t.length > 1000) return 'Please keep this under 1,000 characters.';
  return null;
}
