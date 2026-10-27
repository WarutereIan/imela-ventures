/**
 * Session availability. The weekly template matches the hours the legacy
 * booking form offered (weekdays, 9am–5pm with a lunch break). Booked and
 * closed slots come from the database via privacy-safe RPCs (no client data).
 */
export const DEFAULT_SLOT_TIMES = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];
export const BOOKING_WINDOW_DAYS = 30;

export interface DaySlots {
  date: string; // YYYY-MM-DD in Africa/Nairobi
  weekday: number; // 0 = Sunday
  slots: { time: string; available: boolean }[];
}

/** YYYY-MM-DD for a date as seen in Nairobi, regardless of the device time zone. */
export function nairobiDate(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Nairobi', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

export function weekdayOf(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function slotKey(date: string, time: string) {
  return `${date}|${time}`;
}

/**
 * Builds selectable days from tomorrow (Nairobi time) for the booking window.
 * Weekends and closed dates are excluded; booked slots are marked unavailable.
 */
export function buildSchedule(opts: {
  today: string;
  booked: Set<string>;
  closed: Set<string>;
  days?: number;
  slotTimes?: string[];
}): DaySlots[] {
  const { today, booked, closed, days = BOOKING_WINDOW_DAYS, slotTimes = DEFAULT_SLOT_TIMES } = opts;
  const out: DaySlots[] = [];
  for (let i = 1; i <= days; i += 1) {
    const date = addDays(today, i);
    const weekday = weekdayOf(date);
    if (weekday === 0 || weekday === 6 || closed.has(date)) continue;
    out.push({ date, weekday, slots: slotTimes.map((time) => ({ time, available: !booked.has(slotKey(date, time)) })) });
  }
  return out;
}

export function formatDayLabel(iso: string, style: 'long' | 'short' = 'long'): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', {
    timeZone: 'UTC',
    weekday: style === 'long' ? 'long' : 'short',
    day: 'numeric',
    month: style === 'long' ? 'long' : 'short',
  });
}
