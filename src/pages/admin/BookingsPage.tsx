import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarDays, Check, List, Mail, MessageCircle, Phone, RefreshCw, Search, X } from 'lucide-react';
import { SERVICES, getService } from '../../data/services';
import { nairobiDate, timeToMinutes } from '../../domain/booking/slots';
import { SESSION_STATUSES, listBookings, sendBookingConfirmation, updateBooking, type Booking, type SessionStatus } from '../../domain/admin/api';
import { SESSION_STATUS_LABEL, formatSessionDate } from '../../components/workspace/format';
import { Alert, Chip, EmptyState, Spinner } from '../../components/ui/primitives';
import { Button, buttonClasses } from '../../components/ui/Button';
import Companion from '../../components/characters/Companion';
import { cn } from '../../lib/cn';
import { useAdmin } from './useAdmin';
import { Drawer, NoteField } from './Drawer';
import { AdminPageHeader, Segmented } from './ui';

type View = 'action' | 'upcoming' | 'today' | 'past' | 'all';

const TONE: Record<string, 'butter' | 'sky' | 'sage' | 'neutral' | 'rose' | 'lavender'> = {
  pending: 'butter',
  confirmed: 'sky',
  completed: 'sage',
  cancelled: 'rose',
  responded: 'lavender',
  closed: 'neutral',
};

const serviceName = (id: string) => getService(id)?.name ?? id;
const byWhen = (a: Booking, b: Booking) => a.date.localeCompare(b.date) || timeToMinutes(a.time) - timeToMinutes(b.time);

/** Kenyan numbers to WhatsApp's international format (07… → 2547…). */
function whatsappHref(phone: string): string | null {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `254${digits.slice(1)}`;
  return digits.length >= 10 ? `https://wa.me/${digits}` : null;
}

function confirmationMailto(b: Booking): string {
  const subject = encodeURIComponent('Your Imela appointment');
  const body = encodeURIComponent(
    [`Dear ${b.customer_name},`, '', 'Your appointment with Imela Ventures is confirmed:', '', `Date: ${formatSessionDate(b.date)}`, `Time: ${b.time} (Nairobi time)`, '', 'If you need to reschedule or cancel, please contact us at least 24 hours in advance.', '', 'Warm regards,', 'Imela Ventures'].join('\n')
  );
  return `mailto:${b.email}?subject=${subject}&body=${body}`;
}

export default function BookingsPage() {
  const { toast, summary } = useAdmin();
  const [params, setParams] = useSearchParams();
  const [rows, setRows] = useState<Booking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('action');
  const [layout, setLayout] = useState<'list' | 'agenda'>('list');
  const [search, setSearch] = useState('');
  const [service, setService] = useState('all');
  const [busy, setBusy] = useState<string | null>(null);
  const today = nairobiDate(new Date());
  const openId = params.get('open');

  const load = useCallback(async () => {
    const res = await listBookings();
    if (res.ok) {
      setRows(res.data);
      setError(null);
    } else setError(res.reason === 'forbidden' ? 'Your account can’t read bookings.' : 'Could not load bookings. Check your connection.');
  }, []);

  // Reload whenever the live counters change (a new request, a cancellation…).
  useEffect(() => {
    void load();
  }, [load, summary]);

  const counts = useMemo(() => {
    const r = rows ?? [];
    return {
      action: r.filter((b) => b.status === 'pending').length,
      upcoming: r.filter((b) => b.date >= today && ['pending', 'confirmed'].includes(b.status)).length,
      today: r.filter((b) => b.date === today).length,
    };
  }, [rows, today]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (rows ?? [])
      .filter((b) => {
        if (view === 'action' && b.status !== 'pending') return false;
        if (view === 'upcoming' && !(b.date >= today && ['pending', 'confirmed'].includes(b.status))) return false;
        if (view === 'today' && b.date !== today) return false;
        if (view === 'past' && b.date >= today) return false;
        if (service !== 'all' && b.service !== service) return false;
        return !q || b.customer_name.toLowerCase().includes(q) || b.email.toLowerCase().includes(q) || b.phone.includes(q);
      })
      .sort((a, b) => (view === 'past' ? byWhen(b, a) : byWhen(a, b)));
  }, [rows, view, service, search, today]);

  const open = rows?.find((b) => b.id === openId) ?? null;
  const setOpen = (id: string | null) => {
    const next = new URLSearchParams(params);
    if (id) next.set('open', id);
    else next.delete('open');
    setParams(next, { replace: true });
  };

  const setStatus = async (b: Booking, status: SessionStatus) => {
    setBusy(b.id);
    const previous = b.status;
    setRows((prev) => prev?.map((x) => (x.id === b.id ? { ...x, status } : x)) ?? null);
    const res = await updateBooking(b.id, { status });
    if (!res.ok) {
      setRows((prev) => prev?.map((x) => (x.id === b.id ? { ...x, status: previous } : x)) ?? null);
      setBusy(null);
      toast({ tone: 'danger', text: 'Could not update the booking. Please try again.' });
      return false;
    }
    if (status === 'confirmed') {
      const emailed = await sendBookingConfirmation(b.id);
      toast(
        emailed
          ? { tone: 'success', text: `Confirmed — ${b.customer_name} has been emailed.` }
          : { tone: 'warning', text: `Confirmed. The email couldn’t be sent automatically — use “Email” to let ${b.customer_name.split(' ')[0]} know.` }
      );
    } else toast({ tone: 'success', text: `Marked ${SESSION_STATUS_LABEL[status]?.toLowerCase() ?? status}.` });
    setBusy(null);
    return true;
  };

  const serviceIds = useMemo(() => {
    const known = SERVICES.filter((s) => s.audience === 'individual').map((s) => s.id);
    const stored = (rows ?? []).map((b) => b.service).filter((id) => !known.includes(id));
    return [...known, ...new Set(stored)];
  }, [rows]);

  const grouped = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of filtered) map.set(b.date, [...(map.get(b.date) ?? []), b]);
    return [...map.entries()];
  }, [filtered]);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Bookings"
        lede="Requests from the website arrive here instantly. Confirm them, reply, and keep notes."
        actions={
          <>
            <div className="flex rounded-pill bg-paper p-1 shadow-soft" role="group" aria-label="Layout">
              {(['list', 'agenda'] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  aria-pressed={layout === l}
                  onClick={() => setLayout(l)}
                  className={cn('inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-sm font-semibold', layout === l ? 'bg-ink-strong text-ivory' : 'text-ink')}
                >
                  {l === 'list' ? <List className="h-4 w-4" aria-hidden /> : <CalendarDays className="h-4 w-4" aria-hidden />}
                  {l === 'list' ? 'List' : 'Agenda'}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => void load()}>
              <RefreshCw className="h-4 w-4" aria-hidden /> Refresh
            </Button>
          </>
        }
      />

      <Segmented<View>
        label="Booking views"
        value={view}
        onChange={setView}
        options={[
          { id: 'action', label: 'Needs confirming', count: counts.action },
          { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
          { id: 'today', label: 'Today', count: counts.today },
          { id: 'past', label: 'Past' },
          { id: 'all', label: 'All' },
        ]}
      />

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_16rem]">
        <label className="relative">
          <span className="sr-only">Search bookings</span>
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-ink-soft" aria-hidden />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email or phone" className="w-full rounded-pill border border-line/20 bg-paper py-2.5 pl-10 pr-4 text-sm" />
        </label>
        <select aria-label="Service" value={service} onChange={(e) => setService(e.target.value)} className="rounded-pill border border-line/20 bg-paper px-4 py-2.5 text-sm">
          <option value="all">All services</option>
          {serviceIds.map((id) => (
            <option key={id} value={id}>
              {serviceName(id)}
            </option>
          ))}
        </select>
      </div>

      {error && <Alert tone="danger">{error}</Alert>}
      {!rows && !error && <Spinner label="Loading bookings…" />}
      {rows && filtered.length === 0 && (
        <EmptyState title={view === 'action' ? 'Nothing to confirm.' : 'No bookings here.'} art={<Companion variant="pebble" mood="calm" tone="sage" size={84} />}>
          {view === 'action' ? 'New booking requests will appear here the moment they arrive.' : 'Try another view or clear the search.'}
        </EmptyState>
      )}

      {rows && filtered.length > 0 && layout === 'list' && (
        <ul className="grid grid-cols-1 gap-2.5">
          {filtered.map((b) => (
            <li key={b.id}>
              <div className={cn('flex flex-col gap-3 rounded-card bg-paper p-4 shadow-soft sm:flex-row sm:items-center', b.date === today && 'ring-2 ring-lavender')}>
                <button type="button" onClick={() => setOpen(b.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-lavender-soft text-center leading-tight text-lavender-ink">
                    <span className="text-[0.65rem] font-semibold uppercase">{new Date(`${b.date}T00:00:00`).toLocaleDateString('en-GB', { month: 'short' })}</span>
                    <span className="block text-lg font-bold">{new Date(`${b.date}T00:00:00`).getDate()}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-semibold text-ink-strong">{b.customer_name}</span>
                      <Chip tone={TONE[b.status] ?? 'neutral'}>{SESSION_STATUS_LABEL[b.status] ?? b.status}</Chip>
                    </span>
                    <span className="block truncate text-sm text-ink-soft">
                      {serviceName(b.service)} · {b.time}
                      {b.admin_note ? ' · 📝' : ''}
                    </span>
                  </span>
                </button>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {b.status === 'pending' && (
                    <Button size="sm" onClick={() => void setStatus(b, 'confirmed')} disabled={busy === b.id}>
                      <Check className="h-4 w-4" aria-hidden /> {busy === b.id ? 'Confirming…' : 'Confirm'}
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setOpen(b.id)}>
                    Details
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {rows && filtered.length > 0 && layout === 'agenda' && (
        <div className="space-y-5">
          {grouped.map(([date, items]) => (
            <section key={date} aria-label={formatSessionDate(date)}>
              <h2 className={cn('sticky top-14 z-10 -mx-1 bg-ivory/95 px-1 py-2 text-sm font-semibold backdrop-blur lg:top-16', date === today ? 'text-lavender-ink' : 'text-ink-strong')}>
                {date === today ? 'Today · ' : ''}
                {formatSessionDate(date)}
              </h2>
              <ol className="relative ml-3 space-y-2 border-l-2 border-lavender pl-5">
                {items.map((b) => (
                  <li key={b.id} className="relative">
                    <span className={cn('absolute -left-[1.72rem] top-4 h-3 w-3 rounded-full border-2 border-ivory', b.status === 'pending' ? 'bg-butter-ink' : 'bg-lavender-ink')} aria-hidden />
                    <button type="button" onClick={() => setOpen(b.id)} className="flex w-full items-center gap-3 rounded-2xl bg-paper p-3 text-left shadow-soft hover:bg-lavender-soft/50">
                      <span className="w-[4.5rem] shrink-0 font-mono text-sm text-ink-strong">{b.time}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{b.customer_name}</span>
                        <span className="block truncate text-xs text-ink-soft">{serviceName(b.service)}</span>
                      </span>
                      <Chip tone={TONE[b.status] ?? 'neutral'}>{SESSION_STATUS_LABEL[b.status] ?? b.status}</Chip>
                    </button>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}

      <Drawer
        open={Boolean(open)}
        onClose={() => setOpen(null)}
        title={open?.customer_name ?? ''}
        subtitle={open && `${serviceName(open.service)} · ${formatSessionDate(open.date)} at ${open.time} (Nairobi)`}
        footer={
          open && (
            <>
              {open.status === 'pending' && (
                <Button onClick={() => void setStatus(open, 'confirmed')} disabled={busy === open.id}>
                  <Check className="h-4 w-4" aria-hidden /> Confirm & email
                </Button>
              )}
              {open.status === 'confirmed' && (
                <Button onClick={() => void setStatus(open, 'completed')} disabled={busy === open.id}>
                  Mark completed
                </Button>
              )}
              {!['cancelled', 'closed', 'completed'].includes(open.status) && (
                <Button
                  variant="ghost"
                  className="text-rose-ink"
                  onClick={() => window.confirm(`Cancel ${open.customer_name}'s booking? The time becomes free again.`) && void setStatus(open, 'cancelled')}
                  disabled={busy === open.id}
                >
                  <X className="h-4 w-4" aria-hidden /> Cancel booking
                </Button>
              )}
            </>
          )
        }
      >
        {open && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Chip tone={TONE[open.status] ?? 'neutral'}>{SESSION_STATUS_LABEL[open.status] ?? open.status}</Chip>
              {open.created_at && <span className="text-xs text-ink-soft">Requested {new Date(open.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</span>}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <a href={`tel:${open.phone}`} className={buttonClasses('soft', 'sm', 'flex-col gap-1 py-3 h-auto')}>
                <Phone className="h-4 w-4" aria-hidden /> Call
              </a>
              {whatsappHref(open.phone) ? (
                <a href={whatsappHref(open.phone)!} target="_blank" rel="noreferrer" className={buttonClasses('soft', 'sm', 'flex-col gap-1 py-3 h-auto')}>
                  <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
                </a>
              ) : (
                <span />
              )}
              <a href={confirmationMailto(open)} className={buttonClasses('soft', 'sm', 'flex-col gap-1 py-3 h-auto')}>
                <Mail className="h-4 w-4" aria-hidden /> Email
              </a>
            </div>
            <dl className="grid gap-3 rounded-2xl bg-paper p-4 text-sm">
              <div>
                <dt className="text-ink-soft">Email</dt>
                <dd className="break-all font-medium">{open.email}</dd>
              </div>
              <div>
                <dt className="text-ink-soft">Phone</dt>
                <dd className="font-medium">{open.phone}</dd>
              </div>
              <div>
                <dt className="text-ink-soft">Message from the client</dt>
                <dd className="whitespace-pre-wrap">{open.message || '—'}</dd>
              </div>
            </dl>
            <label className="block text-sm">
              <span className="font-semibold text-ink-strong">Status</span>
              <select
                value={open.status}
                onChange={(e) => void setStatus(open, e.target.value as SessionStatus)}
                className="mt-1.5 w-full rounded-2xl border border-line/20 bg-paper px-4 py-2.5"
              >
                {SESSION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {SESSION_STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </label>
            <NoteField
              key={open.id}
              initial={open.admin_note ?? ''}
              disabled={open.admin_note === undefined}
              onSave={async (v) => {
                const res = await updateBooking(open.id, { admin_note: v || null });
                if (res.ok) setRows((prev) => prev?.map((x) => (x.id === open.id ? { ...x, admin_note: v } : x)) ?? null);
                return res.ok;
              }}
            />
          </>
        )}
      </Drawer>
    </div>
  );
}
