import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, CheckCheck, Inbox, MessageCircleHeart, Trash2 } from 'lucide-react';
import { clearReadNotifications, loadSettings, notificationHref, saveSetting, type AdminNotification } from '../../domain/admin/api';
import { Spinner, TextField } from '../../components/ui/primitives';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/cn';
import { useAdmin } from './useAdmin';
import { DESKTOP_ALERTS_KEY } from './format';
import { AdminPageHeader, MigrationNeeded, Segmented } from './ui';
import { notificationBody, timeAgo } from './format';

type Filter = 'all' | 'unread' | 'bookings' | 'cases' | 'enquiries';

const ICON = { session: CalendarDays, persona_case: MessageCircleHeart, enquiry: Inbox } as const;
const ICON_TONE = { session: 'bg-butter text-butter-ink', persona_case: 'bg-lavender-soft text-lavender-ink', enquiry: 'bg-sky-soft text-sky-ink' } as const;

function Switch({ checked, onChange, labelledBy }: { checked: boolean; onChange: (v: boolean) => void; labelledBy: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      onClick={() => onChange(!checked)}
      className={cn('relative h-7 w-12 shrink-0 rounded-pill transition-colors', checked ? 'bg-sage-ink' : 'bg-ink/20')}
    >
      <span className={cn('absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-6' : 'translate-x-1')} />
    </button>
  );
}

export default function NotificationsPage() {
  const { notifications, unread, markRead, refresh, toast, summary } = useAdmin();
  const [filter, setFilter] = useState<Filter>('all');
  const [settings, setSettings] = useState<Record<string, string> | null>(null);
  const [email, setEmail] = useState('');
  const [desktop, setDesktop] = useState(() => {
    try {
      return localStorage.getItem(DESKTOP_ALERTS_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    void loadSettings().then((res) => {
      const s = res.ok ? res.data : {};
      setSettings(s);
      setEmail(s.notification_email ?? '');
    });
  }, []);

  const shown = useMemo(
    () =>
      notifications.filter((n) => {
        if (filter === 'unread') return !n.read_at;
        if (filter === 'bookings') return n.ref_type === 'session';
        if (filter === 'cases') return n.ref_type === 'persona_case';
        if (filter === 'enquiries') return n.ref_type === 'enquiry';
        return true;
      }),
    [notifications, filter]
  );

  const groups = useMemo(() => {
    const todayStr = new Date().toDateString();
    const g: { label: string; items: AdminNotification[] }[] = [
      { label: 'Today', items: [] },
      { label: 'Earlier', items: [] },
    ];
    for (const n of shown) (new Date(n.created_at).toDateString() === todayStr ? g[0] : g[1]).items.push(n);
    return g.filter((x) => x.items.length);
  }, [shown]);

  const save = async (k: string, v: string, done: string) => {
    const res = await saveSetting(k, v);
    toast(res.ok ? { tone: 'success', text: done } : { tone: 'danger', text: 'Could not save that setting.' });
    if (res.ok) setSettings((prev) => ({ ...(prev ?? {}), [k]: v }));
  };

  const toggleDesktop = async (on: boolean) => {
    if (on && typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
      const p = await Notification.requestPermission();
      if (p !== 'granted') return toast({ tone: 'warning', text: 'Your browser blocked pop-ups. Allow notifications for this site in the browser settings.' });
    }
    try {
      localStorage.setItem(DESKTOP_ALERTS_KEY, on ? '1' : '0');
    } catch {
      /* ignore */
    }
    setDesktop(on);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Notifications"
        lede="Every booking request, cancellation, enquiry and anonymous case, as it happens."
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => void markRead('all')} disabled={!unread}>
              <CheckCheck className="h-4 w-4" aria-hidden /> Mark all read
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                const res = await clearReadNotifications();
                if (!res.ok) toast({ tone: 'danger', text: 'Could not clear notifications.' });
                await refresh();
              }}
            >
              <Trash2 className="h-4 w-4" aria-hidden /> Clear read
            </Button>
          </>
        }
      />

      {summary === 'missing' ? (
        <MigrationNeeded what="The notification inbox" />
      ) : (
        <>
          <Segmented<Filter>
            label="Filter notifications"
            value={filter}
            onChange={setFilter}
            options={[
              { id: 'all', label: 'All' },
              { id: 'unread', label: 'Unread', count: unread },
              { id: 'bookings', label: 'Bookings' },
              { id: 'cases', label: 'Cases' },
              { id: 'enquiries', label: 'Enquiries' },
            ]}
          />
          {groups.length === 0 && <p className="rounded-card bg-paper p-8 text-center text-sm text-ink-soft shadow-soft">Nothing here. You're all caught up.</p>}
          {groups.map((g) => (
            <section key={g.label} aria-label={g.label}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">{g.label}</h2>
              <ul className="overflow-hidden rounded-card bg-paper shadow-soft">
                {g.items.map((n) => {
                  const Icon = ICON[n.ref_type];
                  return (
                    <li key={n.id} className="border-b border-line/10 last:border-0">
                      <Link to={notificationHref(n)} onClick={() => !n.read_at && void markRead([n.id])} className={cn('flex items-center gap-3 px-4 py-3 hover:bg-lavender-soft/50', !n.read_at && 'bg-lavender-soft/25')}>
                        <span className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-full', n.urgent ? 'bg-rose text-white' : ICON_TONE[n.ref_type])}>
                          <Icon className="h-4 w-4" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={cn('block text-sm', n.read_at ? 'text-ink' : 'font-semibold text-ink-strong')}>{n.title}</span>
                          {n.body && <span className="block truncate text-xs text-ink-soft">{notificationBody(n.body)}</span>}
                        </span>
                        <span className="shrink-0 text-xs text-ink-soft">{timeAgo(n.created_at)}</span>
                        {!n.read_at && <span className="h-2 w-2 shrink-0 rounded-full bg-lavender-ink" aria-label="Unread" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </>
      )}

      <section aria-labelledby="alerts-title" className="rounded-card bg-paper p-5 shadow-soft">
        <h2 id="alerts-title" className="text-lg font-semibold text-ink-strong">
          Alerts
        </h2>
        {!settings ? (
          <Spinner />
        ) : (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-ivory p-4">
              <div>
                <p id="email-alerts" className="font-semibold text-ink-strong">
                  Email me about new bookings
                </p>
                <p className="text-sm text-ink-soft">Sent by the booking notification function. Emails never include the client's message.</p>
              </div>
              <Switch
                labelledBy="email-alerts"
                checked={(settings.notifications_enabled ?? 'true') === 'true'}
                onChange={(v) => void save('notifications_enabled', String(v), v ? 'Booking emails turned on.' : 'Booking emails turned off.')}
              />
            </div>
            <form
              className="flex flex-col gap-3 rounded-2xl bg-ivory p-4 sm:flex-row sm:items-end"
              onSubmit={(e) => {
                e.preventDefault();
                if (!email.includes('@')) return toast({ tone: 'danger', text: 'Please enter a valid email address.' });
                void save('notification_email', email.trim(), 'Notification email saved.');
              }}
            >
              <div className="flex-1">
                <TextField label="Send alerts to" type="email" value={email} onChange={(e) => setEmail(e.target.value)} hint="Use an inbox someone checks every day." />
              </div>
              <Button type="submit">Save</Button>
            </form>
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-ivory p-4">
              <div>
                <p id="desktop-alerts" className="font-semibold text-ink-strong">
                  Pop-up alerts on this device
                </p>
                <p className="text-sm text-ink-soft">While this console is open in a background tab. Only the alert title is shown — no names or messages.</p>
              </div>
              <Switch labelledBy="desktop-alerts" checked={desktop} onChange={(v) => void toggleDesktop(v)} />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
