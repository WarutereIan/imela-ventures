/** Display helpers shared by the workspaces. */
export function formatSessionDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  if (!y || !m || !d) return date;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export const SESSION_STATUS_LABEL: Record<string, string> = {
  pending: 'Requested',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  responded: 'Responded',
  closed: 'Closed',
};
