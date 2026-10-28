import { describe, expect, it } from 'vitest';
import { addDays, buildSchedule, nairobiDate, slotKey, weekdayOf, weeklyFromRows } from './slots';
import { validateContact, validateNeed } from './validation';

describe('schedule', () => {
  it('starts tomorrow, skips weekends and closed dates, marks booked slots', () => {
    // 2026-10-30 is a Friday
    const days = buildSchedule({
      today: '2026-10-29',
      booked: new Set([slotKey('2026-10-30', '10:00 AM')]),
      closed: new Set(['2026-11-02']),
      days: 5,
    });
    expect(days.map((d) => d.date)).toEqual(['2026-10-30', '2026-11-03']);
    expect(days[0].slots.find((s) => s.time === '10:00 AM')?.available).toBe(false);
    expect(days[0].slots.find((s) => s.time === '09:00 AM')?.available).toBe(true);
  });

  it('date helpers are timezone-stable', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(weekdayOf('2026-10-27')).toBe(2);
    // 22:30 UTC on the 27th is already the 28th in Nairobi (UTC+3)
    expect(nairobiDate(new Date('2026-10-27T22:30:00Z'))).toBe('2026-10-28');
  });
});

describe('validation', () => {
  const ok = { name: 'Wanjiku', email: 'w@example.com', phone: '+254 712 345 678', message: '' };
  it('accepts valid details', () => expect(validateContact(ok)).toEqual({}));
  it('rejects bad email and phone', () => {
    const e = validateContact({ ...ok, email: 'nope', phone: 'call me' });
    expect(e.email).toBeTruthy();
    expect(e.phone).toBeTruthy();
  });
  it('requires a name', () => expect(validateContact({ ...ok, name: '  ' }).name).toBeTruthy());
  it('validates need text', () => {
    expect(validateNeed('')).toBeTruthy();
    expect(validateNeed('hi')).toBeTruthy();
    expect(validateNeed('x'.repeat(1001))).toBeTruthy();
    expect(validateNeed('I feel overwhelmed')).toBeNull();
  });
});

describe('opening hours from the admin console', () => {
  it('uses each weekday’s own times, sorted, and can open a Saturday', () => {
    const weekly = weeklyFromRows([
      { weekday: 5, slot_time: '02:00 PM', active: true },
      { weekday: 5, slot_time: '09:00 AM', active: true },
      { weekday: 5, slot_time: '10:00 AM', active: false },
      { weekday: 6, slot_time: '10:00 AM', active: true },
    ]);
    // 2026-10-30 Fri, 2026-10-31 Sat, 2026-11-02 Mon (no hours)
    const days = buildSchedule({ today: '2026-10-29', booked: new Set(), closed: new Set(), days: 4, weekly });
    expect(days.map((d) => d.date)).toEqual(['2026-10-30', '2026-10-31']);
    expect(days[0].slots.map((s) => s.time)).toEqual(['09:00 AM', '02:00 PM']);
  });
});
