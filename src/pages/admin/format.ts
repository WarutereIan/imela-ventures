import { getService } from '../../data/services';
import { CONCERN_LABEL } from '../../domain/personaPortal/types';

/** Remembers, per device, whether pop-up alerts are on. */
export const DESKTOP_ALERTS_KEY = 'imela-admin-desktop-alerts';

export function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)} d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/** Turns ids stored in a notification (services, support areas) into readable names. */
export function notificationBody(body: string | null): string | null {
  if (!body) return body;
  return body
    .split(' · ')
    .map((part) =>
      part
        .split(', ')
        .map((token) => getService(token)?.name ?? CONCERN_LABEL[token] ?? token)
        .join(', ')
    )
    .join(' · ');
}
