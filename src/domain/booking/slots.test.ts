import { describe, expect, it } from 'vitest';
import { addDays, buildSchedule, nairobiDate, slotKey, weekdayOf } from './slots';
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
