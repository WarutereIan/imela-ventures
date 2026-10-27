import { CONCERN_LABEL, SUPPORT_LABEL, type PreferredSupport } from '../../domain/personaPortal/types';

export function concernLabels(concerns: string[]): string {
  return concerns.map((c) => CONCERN_LABEL[c] ?? c).join(', ');
}

export function supportLabel(s: PreferredSupport): string {
  return SUPPORT_LABEL[s] ?? s;
}

/** "3h", "2d 4h", "12m" — compact durations for queues. */
export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '—';
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return `${Math.max(mins, 1)}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h${mins % 60 ? ` ${mins % 60}m` : ''}`;
  const days = Math.floor(hours / 24);
  return `${days}d${hours % 24 ? ` ${hours % 24}h` : ''}`;
}

export function since(iso: string | null | undefined, now = Date.now()): string {
  return iso ? formatDuration(now - new Date(iso).getTime()) : '—';
}

export function between(from: string | null | undefined, to: string | null | undefined): string {
  if (!from || !to) return '—';
  return formatDuration(new Date(to).getTime() - new Date(from).getTime());
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', { timeZone: 'Africa/Nairobi', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function formatDay(date: string | null | undefined): string {
  if (!date) return '—';
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' });
}

/** Friendly message for a failed staff action. */
export function actionError(reason: string, message?: string): string {
  if (reason === 'forbidden') return "You don't have permission for this case.";
  if (reason === 'invalid') return message ?? 'Please check what you entered.';
  if (reason === 'not_found') return 'This case could not be found. It may have been deleted.';
  return 'That didn’t work. Please try again.';
}
