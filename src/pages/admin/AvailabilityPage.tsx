import { useEffect, useMemo, useState } from 'react';
import { CalendarX, Plus, Trash2 } from 'lucide-react';
import { DEFAULT_SLOT_TIMES, addDays, formatDayLabel, nairobiDate, timeToMinutes } from '../../domain/booking/slots';
import { addClosedDay, listClosedDays, listWeeklySlots, removeClosedDay, setWeeklySlot, type ClosedDay, type WeeklySlot } from '../../domain/admin/api';
import { Alert, Spinner } from '../../components/ui/primitives';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/cn';
import { useAdmin } from './useAdmin';
import { AdminPageHeader, MigrationNeeded } from './ui';

const DAYS: { id: number; short: string; long: string }[] = [
  { id: 1, short: 'Mon', long: 'Monday' },
  { id: 2, short: 'Tue', long: 'Tuesday' },
  { id: 3, short: 'Wed', long: 'Wednesday' },
  { id: 4, short: 'Thu', long: 'Thursday' },
  { id: 5, short: 'Fri', long: 'Friday' },
  { id: 6, short: 'Sat', long: 'Saturday' },
  { id: 0, short: 'Sun', long: 'Sunday' },
];

const HOURS = Array.from({ length: 14 }, (_, i) => {
  const h = i + 7; // 7 AM – 8 PM
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, '0')}:00 ${h < 12 ? 'AM' : 'PM'}`;
});

const key = (d: number, t: string) => `${d}|${t}`;

export default function AvailabilityPage() {
  const { toast } = useAdmin();
  const [slots, setSlots] = useState<Map<string, boolean> | null>(null);
  const [extraTimes, setExtraTimes] = useState<string[]>([]);
  const [closed, setClosed] = useState<ClosedDay[] | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');
  const [newDate, setNewDate] = useState('');
  const [reason, setReason] = useState('');
  const [newTime, setNewTime] = useState('');
  const today = nairobiDate(new Date());

  useEffect(() => {
    void Promise.all([listWeeklySlots(), listClosedDays(today)]).then(([w, c]) => {
      if (!w.ok) return setState(w.reason === 'missing' ? 'missing' : 'error');
      setSlots(new Map(w.data.map((s: WeeklySlot) => [key(s.weekday, s.slot_time), s.active])));
      setClosed(c.ok ? c.data : []);
      setState('ready');
    });
  }, [today]);

  const times = useMemo(() => {
    const fromDb = slots ? [...slots.keys()].map((k) => k.split('|')[1]) : [];
    return [...new Set([...DEFAULT_SLOT_TIMES, ...fromDb, ...extraTimes])].sort((a, b) => timeToMinutes(a) - timeToMinutes(b));
  }, [slots, extraTimes]);

  const isOn = (d: number, t: string) => slots?.get(key(d, t)) === true;

  const toggle = async (d: number, t: string, next = !isOn(d, t)) => {
    setSlots((prev) => new Map(prev).set(key(d, t), next));
    const res = await setWeeklySlot(d, t, next);
    if (!res.ok) {
      setSlots((prev) => new Map(prev).set(key(d, t), !next));
      toast({ tone: 'danger', text: 'Could not change that time.' });
    }
  };

  const setDay = async (d: number, on: boolean) => {
    const changes = times.filter((t) => isOn(d, t) !== on && (on ? DEFAULT_SLOT_TIMES.includes(t) : true));
    for (const t of changes) await toggle(d, t, on);
    toast({ tone: 'success', text: `${DAYS.find((x) => x.id === d)?.long} ${on ? 'opened with the standard hours' : 'closed every week'}.` });
  };

  const addDay = async () => {
    if (!newDate) return;
    const res = await addClosedDay(newDate, reason);
    if (!res.ok) return toast({ tone: 'danger', text: 'Could not close that day.' });
    const refreshed = await listClosedDays(today);
    if (refreshed.ok) setClosed(refreshed.data);
    setNewDate('');
    setReason('');
    toast({ tone: 'success', text: `${formatDayLabel(newDate)} is now closed for booking.` });
  };

  const removeDay = async (c: ClosedDay) => {
    const res = await removeClosedDay(c.id);
    if (!res.ok) return toast({ tone: 'danger', text: 'Could not reopen that day.' });
    setClosed((prev) => prev?.filter((x) => x.id !== c.id) ?? null);
  };

  const openCount = slots ? [...slots.values()].filter(Boolean).length : 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Availability" lede="Set the weekly times people can book on the website, and close days for holidays or leave. Changes apply to the booking page straight away." />
      {state === 'loading' && <Spinner label="Loading availability…" />}
      {state === 'missing' && <MigrationNeeded what="Availability" file="20261027000002_harden_sessions.sql" />}
      {state === 'error' && <Alert tone="danger">Could not load availability.</Alert>}

      {state === 'ready' && (
        <>
          <section aria-labelledby="hours-title" className="rounded-card bg-paper p-4 shadow-soft sm:p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="hours-title" className="text-lg font-semibold text-ink-strong">
                  Weekly opening hours
                </h2>
                <p className="text-sm text-ink-soft">
                  Tap a time to open or close it. {openCount} bookable start times a week. Times are in Nairobi time.
                </p>
              </div>
              <form
                className="flex items-end gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newTime && !times.includes(newTime)) setExtraTimes((x) => [...x, newTime]);
                  setNewTime('');
                }}
              >
                <label className="text-sm">
                  <span className="sr-only">Add a start time</span>
                  <select value={newTime} onChange={(e) => setNewTime(e.target.value)} className="rounded-pill border border-line/20 bg-ivory px-3 py-2 text-sm">
                    <option value="">Add a start time…</option>
                    {HOURS.filter((h) => !times.includes(h)).map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </label>
                <Button size="sm" variant="outline" type="submit" disabled={!newTime}>
                  <Plus className="h-4 w-4" aria-hidden /> Add
                </Button>
              </form>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[34rem] border-separate border-spacing-1 text-sm">
                <thead>
                  <tr>
                    <th className="w-24 text-left text-xs font-semibold uppercase tracking-wider text-ink-soft">Time</th>
                    {DAYS.map((d) => (
                      <th key={d.id} className="text-center text-xs font-semibold uppercase tracking-wider text-ink-soft">
                        {d.short}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {times.map((t) => (
                    <tr key={t}>
                      <th scope="row" className="whitespace-nowrap pr-2 text-left font-mono text-xs font-medium text-ink">
                        {t}
                      </th>
                      {DAYS.map((d) => {
                        const on = isOn(d.id, t);
                        return (
                          <td key={d.id}>
                            <button
                              type="button"
                              aria-pressed={on}
                              aria-label={`${d.long} ${t}: ${on ? 'open' : 'closed'}`}
                              onClick={() => void toggle(d.id, t)}
                              className={cn(
                                'h-9 w-full rounded-xl text-xs font-semibold transition-colors',
                                on ? 'bg-lavender-ink text-white hover:bg-lavender-ink/85' : 'bg-ivory text-ink-soft hover:bg-lavender-soft'
                              )}
                            >
                              {on ? 'Open' : '—'}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr>
                    <td />
                    {DAYS.map((d) => {
                      const anyOn = times.some((t) => isOn(d.id, t));
                      return (
                        <td key={d.id} className="pt-1 text-center">
                          <button type="button" onClick={() => void setDay(d.id, !anyOn)} className="text-xs font-semibold text-lavender-ink hover:underline">
                            {anyOn ? 'Close day' : 'Open day'}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section aria-labelledby="closed-title" className="rounded-card bg-paper p-4 shadow-soft sm:p-5">
            <h2 id="closed-title" className="text-lg font-semibold text-ink-strong">
              Closed days
            </h2>
            <p className="text-sm text-ink-soft">Holidays, leave or training days. Nobody can book these dates. The reason is internal and never shown.</p>
            <form
              className="mt-4 grid gap-3 sm:grid-cols-[12rem_minmax(0,1fr)_auto] sm:items-end"
              onSubmit={(e) => {
                e.preventDefault();
                void addDay();
              }}
            >
              <label className="text-sm">
                <span className="font-semibold text-ink-strong">Date</span>
                <input type="date" required min={addDays(today, 1)} value={newDate} onChange={(e) => setNewDate(e.target.value)} className="mt-1.5 w-full rounded-2xl border border-line/20 bg-ivory px-4 py-2.5" />
              </label>
              <label className="text-sm">
                <span className="font-semibold text-ink-strong">
                  Reason <span className="font-normal text-ink-soft">(optional)</span>
                </span>
                <input value={reason} maxLength={200} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Public holiday" className="mt-1.5 w-full rounded-2xl border border-line/20 bg-ivory px-4 py-2.5" />
              </label>
              <Button type="submit" disabled={!newDate}>
                <CalendarX className="h-4 w-4" aria-hidden /> Close this day
              </Button>
            </form>
            <ul className="mt-4 divide-y divide-line/10">
              {closed?.length === 0 && <li className="py-6 text-center text-sm text-ink-soft">No upcoming closed days.</li>}
              {closed?.map((c) => (
                <li key={c.id} className="flex items-center gap-3 py-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-rose-soft text-sm font-bold text-rose-ink">{Number(c.date.slice(8))}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink-strong">{formatDayLabel(c.date)}</span>
                    {c.reason && <span className="block truncate text-xs text-ink-soft">{c.reason}</span>}
                  </span>
                  <button type="button" onClick={() => void removeDay(c)} className="rounded-full p-2 text-ink-soft hover:bg-rose-soft hover:text-rose-ink" aria-label={`Reopen ${formatDayLabel(c.date)}`}>
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
