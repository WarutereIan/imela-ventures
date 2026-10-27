/**
 * Urgent-help contacts shown whenever someone may be in danger.
 *
 * VERIFY BEFORE LAUNCH: these Kenyan numbers are widely published national
 * lines, but Imela must confirm each one (and add any partner helplines it has
 * verified) before go-live. Do not add numbers that have not been checked.
 */
export interface CrisisContact {
  label: string;
  detail: string;
  display: string;
  href: string;
}

export const CRISIS_CONTACTS: CrisisContact[] = [
  {
    label: 'Emergency services (Kenya)',
    detail: 'Police, ambulance and fire. Free to call.',
    display: '999 or 112',
    href: 'tel:999',
  },
  {
    label: 'Kenya Red Cross',
    detail: 'Toll-free emergency and psychosocial support line.',
    display: '1199',
    href: 'tel:1199',
  },
];

export const CRISIS_OUTSIDE_KENYA =
  "If you are outside Kenya, contact your local emergency number or go to the nearest hospital emergency department.";

export const CRISIS_DISCLAIMER =
  'Imela Ventures is not an emergency service and this website is not monitored around the clock. If you are in immediate danger, please contact emergency services now.';
