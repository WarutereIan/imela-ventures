import { CRISIS_CONTACTS, CRISIS_OUTSIDE_KENYA } from '../../data/crisis';

/** Pre-written message with verified emergency contacts. Staff review and edit it before sending. */
export function crisisMessageTemplate(): string {
  const lines = CRISIS_CONTACTS.map((c) => `• ${c.label}: ${c.display}`);
  return [
    'Thank you for telling us. What you’ve shared matters, and your safety comes first.',
    'If you are in danger or might act on thoughts of harming yourself, please contact emergency help now:',
    ...lines,
    CRISIS_OUTSIDE_KENYA,
    'This inbox is not monitored around the clock, so please don’t wait for our reply if you are not safe. When you can, write back and let us know how you are.',
  ].join('\n');
}
