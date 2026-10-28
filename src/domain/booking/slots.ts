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
/** Minutes since midnight for a '09:00 AM' style time, for sorting. */
export function timeToMinutes(time: string): number {
  const m = time.match(/^(\d{1,2}):(\d{2}) (AM|PM)$/);
  if (!m) return 0;
  return ((Number(m[1]) % 12) + (m[3] === 'PM' ? 12 : 0)) * 60 + Number(m[2]);
}

/** Groups active weekly slots (from the admin's opening hours) by weekday. */
export function weeklyFromRows(rows: { weekday: number; slot_time: string; active: boolean }[]): Map<number, string[]> {
  const map = new Map<number, string[]>();
  for (const r of rows) {
    if (!r.active) continue;
    map.set(r.weekday, [...(map.get(r.weekday) ?? []), r.slot_time]);
  }
  for (const [d, times] of map) map.set(d, times.sort((a, b) => timeToMinutes(a) - timeToMinutes(b)));
  return map;
}

/**
 * Builds selectable days from tomorrow (Nairobi time) for the booking window.
 * With `weekly` (opening hours set in the admin console) each weekday offers
 * its own times; without it, weekdays use the default times and weekends are
 * closed. Closed dates are excluded; booked slots are marked unavailable.
 */
export function buildSchedule(opts: {
  today: string;
  booked: Set<string>;
  closed: Set<string>;
  days?: number;
  slotTimes?: string[];
  weekly?: Map<number, string[]> | null;
}): DaySlots[] {
  const { today, booked, closed, days = BOOKING_WINDOW_DAYS, slotTimes = DEFAULT_SLOT_TIMES, weekly } = opts;
  const out: DaySlots[] = [];
  for (let i = 1; i <= days; i += 1) {
    const date = addDays(today, i);
    const weekday = weekdayOf(date);
    if (closed.has(date)) continue;
    const times = weekly && weekly.size ? weekly.get(weekday) ?? [] : weekday === 0 || weekday === 6 ? [] : slotTimes;
    if (!times.length) continue;
    out.push({ date, weekday, slots: times.map((time) => ({ time, available: !booked.has(slotKey(date, time)) })) });
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
