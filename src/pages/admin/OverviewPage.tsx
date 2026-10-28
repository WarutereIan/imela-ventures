import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CalendarDays, FileText, Inbox, MessageCircleHeart } from 'lucide-react';
import { getService } from '../../data/services';
import { nairobiDate, timeToMinutes } from '../../domain/booking/slots';
import { listBookings, listEnquiries, notificationHref, type Booking, type Enquiry } from '../../domain/admin/api';
import { formatSessionDate } from '../../components/workspace/format';
import { cn } from '../../lib/cn';
import { useAdmin } from './useAdmin';
import { AdminPageHeader, StatTile } from './ui';
import { notificationBody, timeAgo } from './format';

function greeting(): string {
  const h = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Africa/Nairobi' }).format(new Date()));
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

const serviceName = (id: string) => getService(id)?.name ?? id;

export default function OverviewPage() {
  const { summary, notifications, user } = useAdmin();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[] | null>(null);
  const today = nairobiDate(new Date());

  useEffect(() => {
    let active = true;
    void Promise.all([listBookings(), listEnquiries()]).then(([b, e]) => {
      if (!active) return;
      setBookings(b.ok ? b.data : []);
      setEnquiries(e.ok ? e.data : []);
    });
    return () => {
      active = false;
    };
    // Re-load when the live counters move.
  }, [summary]);

  const s = summary && summary !== 'missing' ? summary : null;
  const pending = useMemo(() => (bookings ?? []).filter((b) => b.status === 'pending').sort((a, b) => a.date.localeCompare(b.date) || timeToMinutes(a.time) - timeToMinutes(b.time)), [bookings]);
  const todays = useMemo(
    () => (bookings ?? []).filter((b) => b.date === today && ['pending', 'confirmed'].includes(b.status)).sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)),
    [bookings, today]
  );
  const newEnquiries = (enquiries ?? []).filter((e) => e.status === 'new');
  const series = s?.bookings_by_day ?? [];
  const peak = Math.max(1, ...series.map((d) => d.count));
  const name = user.email?.split('@')[0];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow={new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Africa/Nairobi' })}
        title={`${greeting()}${name ? `, ${name}` : ''}`}
        lede="Everything that needs you today, across bookings, anonymous cases and enquiries."
      />

      {s && s.cases_urgent > 0 && (
        <Link to="/admin/cases" className="flex items-start gap-3 rounded-card border-2 border-rose bg-rose-soft p-4 text-rose-ink hover:shadow-soft">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <span className="flex-1 text-sm">
            <strong>
              {s.cases_urgent} anonymous case{s.cases_urgent === 1 ? '' : 's'} flagged for urgent review.
            </strong>{' '}
            A counsellor should look at {s.cases_urgent === 1 ? 'it' : 'them'} as soon as possible.
          </span>
          <ArrowRight className="mt-0.5 h-4 w-4" aria-hidden />
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Awaiting confirmation"
          value={s?.bookings_pending ?? (bookings ? pending.length : '—')}
          note={s ? `${s.bookings_week} sessions in the next 7 days` : 'Booking requests'}
          to="/admin/bookings"
          tone="butter"
          icon={CalendarDays}
        />
        <StatTile
          label="Cases to review"
          value={s ? s.cases_awaiting : '—'}
          note={s ? `${s.cases_unassigned} unassigned · ${s.cases_open} open` : 'Anonymous counselling'}
          to="/admin/cases"
          tone={s?.cases_urgent ? 'rose' : 'lavender'}
          icon={MessageCircleHeart}
        />
        <StatTile label="New enquiries" value={s?.enquiries_new ?? (enquiries ? newEnquiries.length : '—')} note="Workplace & service requests" to="/admin/enquiries" tone="sky" icon={Inbox} />
        <StatTile
          label="Published articles"
          value={s?.articles_published ?? '—'}
          note={s ? `${s.articles_draft} drafts · ${s.article_views.toLocaleString()} views` : 'Resources library'}
          to="/admin/articles"
          tone="sage"
          icon={FileText}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section aria-labelledby="attention-title" className="rounded-card bg-paper p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <h2 id="attention-title" className="text-lg font-semibold text-ink-strong">
              Needs your attention
            </h2>
            <Link to="/admin/bookings" className="text-sm font-semibold text-lavender-ink hover:underline">
              All bookings
            </Link>
          </div>
          <ul className="mt-3 divide-y divide-line/10">
            {bookings === null && <li className="py-6 text-sm text-ink-soft">Loading…</li>}
            {pending.slice(0, 5).map((b) => (
              <li key={b.id}>
                <Link to={`/admin/bookings?open=${b.id}`} className="flex items-center gap-3 py-3 hover:bg-lavender-soft/40">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-butter/80 text-xs font-bold text-butter-ink">
                    {new Date(`${b.date}T00:00:00`).getDate()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-ink-strong">{b.customer_name}</span>
                    <span className="block truncate text-xs text-ink-soft">
                      {serviceName(b.service)} · {formatSessionDate(b.date)} at {b.time}
                    </span>
                  </span>
                  <span className="rounded-pill bg-butter px-2.5 py-1 text-xs font-semibold text-butter-ink">Confirm</span>
                </Link>
              </li>
            ))}
            {newEnquiries.slice(0, 3).map((e) => (
              <li key={e.id}>
                <Link to={`/admin/enquiries?open=${e.id}`} className="flex items-center gap-3 py-3 hover:bg-lavender-soft/40">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-soft text-sky-ink">
                    <Inbox className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-ink-strong">
                      {e.name}
                      {e.organisation && <span className="font-normal text-ink-soft"> · {e.organisation}</span>}
                    </span>
                    <span className="block truncate text-xs text-ink-soft">New enquiry · {timeAgo(e.created_at)}</span>
                  </span>
                  <span className="rounded-pill bg-sky-soft px-2.5 py-1 text-xs font-semibold text-sky-ink">Reply</span>
                </Link>
              </li>
            ))}
            {bookings !== null && pending.length === 0 && newEnquiries.length === 0 && (
              <li className="py-8 text-center text-sm text-ink-soft">Nothing waiting. New requests will appear here instantly.</li>
            )}
          </ul>
        </section>

        <section aria-labelledby="today-title" className="rounded-card bg-ink-strong p-5 text-ivory shadow-soft">
          <h2 id="today-title" className="text-lg font-semibold text-ivory">
            Today's sessions
          </h2>
          <ol className="mt-3 space-y-2">
            {todays.length === 0 && <li className="rounded-2xl bg-ivory/10 px-4 py-6 text-center text-sm text-ivory/80">No sessions today.</li>}
            {todays.map((b) => (
              <li key={b.id}>
                <Link to={`/admin/bookings?open=${b.id}`} className="flex items-center gap-3 rounded-2xl bg-ivory/10 px-4 py-3 hover:bg-ivory/15">
                  <span className="w-16 shrink-0 font-mono text-sm text-lime">{b.time}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{b.customer_name}</span>
                    <span className="block truncate text-xs text-ivory/70">{serviceName(b.service)}</span>
                  </span>
                  {b.status === 'pending' && <span className="rounded-pill bg-butter px-2 py-0.5 text-xs font-semibold text-butter-ink">Unconfirmed</span>}
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section aria-labelledby="ahead-title" className="rounded-card bg-paper p-5 shadow-soft">
          <h2 id="ahead-title" className="text-lg font-semibold text-ink-strong">
            The next two weeks
          </h2>
          <p className="text-sm text-ink-soft">Pending and confirmed sessions per day.</p>
          {series.length === 0 ? (
            <p className="mt-6 text-sm text-ink-soft">Appears once the latest database update is applied.</p>
          ) : (
            <div className="mt-5 flex h-40 items-end gap-1.5" role="img" aria-label={`Sessions per day for the next 14 days: ${series.map((d) => d.count).join(', ')}`}>
              {series.map((d) => {
                const date = new Date(`${d.date}T00:00:00`);
                const weekend = date.getDay() === 0 || date.getDay() === 6;
                return (
                  <div key={d.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                    <span className="text-[0.65rem] font-semibold text-ink-soft">{d.count || ''}</span>
                    <span
                      className={cn('w-full rounded-t-lg transition-[height] duration-calm', d.date === today ? 'bg-lavender-ink' : weekend ? 'bg-ink/10' : 'bg-lavender')}
                      style={{ height: `${Math.max(4, (d.count / peak) * 100)}%` }}
                    />
                    <span className={cn('text-[0.65rem]', d.date === today ? 'font-bold text-ink-strong' : 'text-ink-soft')}>
                      {date.toLocaleDateString('en-GB', { weekday: 'narrow' })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section aria-labelledby="activity-title" className="rounded-card bg-paper p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <h2 id="activity-title" className="text-lg font-semibold text-ink-strong">
              Recent activity
            </h2>
            <Link to="/admin/notifications" className="text-sm font-semibold text-lavender-ink hover:underline">
              Inbox
            </Link>
          </div>
          <ul className="mt-3 space-y-1">
            {notifications.length === 0 && <li className="py-6 text-sm text-ink-soft">New bookings, cases and enquiries will show here.</li>}
            {notifications.slice(0, 6).map((n) => (
              <li key={n.id}>
                <Link to={notificationHref(n)} className="flex items-start gap-3 rounded-2xl px-2 py-2 hover:bg-lavender-soft/50">
                  <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.urgent ? 'bg-rose' : n.read_at ? 'bg-ink/20' : 'bg-lavender-ink')} aria-hidden />
                  <span className="min-w-0 flex-1 text-sm">
                    <span className={cn('block', n.read_at ? 'text-ink' : 'font-semibold text-ink-strong')}>{n.title}</span>
                    {n.body && <span className="block truncate text-xs text-ink-soft">{notificationBody(n.body)}</span>}
                  </span>
                  <span className="shrink-0 text-xs text-ink-soft">{timeAgo(n.created_at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
