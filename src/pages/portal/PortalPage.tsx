import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Download, Lock, NotebookPen, Trash2 } from 'lucide-react';
import { config } from '../../lib/config';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import type { User } from '@supabase/supabase-js';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import { getService } from '../../data/services';
import { ORG } from '../../data/organisation';
import { SignInPanel, WorkspaceShell } from '../../components/workspace/WorkspaceStates';
import { SESSION_STATUS_LABEL, formatSessionDate } from '../../components/workspace/format';
import { useAsync, unwrap } from '../../components/workspace/useAsync';
import { Button, buttonClasses } from '../../components/ui/Button';
import { Alert, Card, Chip, Spinner, TextArea } from '../../components/ui/primitives';
import Companion from '../../components/characters/Companion';
import { nairobiDate } from '../../domain/booking/slots';

interface ClientSession {
  id: string;
  service: string;
  date: string;
  time: string;
  status: string;
}

interface Reflection {
  id: string;
  body: string;
  created_at: string;
}

const STATUS_TONE: Record<string, 'sage' | 'butter' | 'neutral' | 'rose'> = {
  confirmed: 'sage',
  pending: 'butter',
  completed: 'neutral',
  cancelled: 'rose',
};

function PortalUnavailable() {
  return (
    <section className="shell py-16 sm:py-24">
      <div className="mx-auto grid max-w-4xl items-center gap-10 rounded-blob bg-paper p-8 shadow-soft sm:p-12 md:grid-cols-[auto_1fr]">
        <Companion variant="pebble" mood="hopeful" pose="hold" hold="leaf" tone="sage" size={150} className="mx-auto" />
        <div>
          <p className="eyebrow mb-2">Client portal</p>
          <h1 className="font-display text-display-md">Your own space is on its way.</h1>
          <p className="mt-4 text-ink-soft">
            Soon you’ll be able to see your appointments, prepare for sessions and keep private reflections in one place. Accounts
            are optional — you never need one to get support.
          </p>
          <p className="mt-3 text-ink-soft">
            You can book a session today without creating an account. We’ll confirm your appointment by email.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/book" className={buttonClasses('primary')}>
              Book a session
            </Link>
            <Link to="/privacy" className={buttonClasses('ghost')}>
              How we handle your data
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function AppointmentRow({ session, onCancelled }: { session: ClientSession; onCancelled: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);
  const today = nairobiDate(new Date());
  const cancellable = session.date >= today && ['pending', 'confirmed'].includes(session.status);

  const cancel = async () => {
    setBusy(true);
    const { data, error } = await supabase.rpc('client_cancel_session', { session_id: session.id });
    setBusy(false);
    setConfirming(false);
    if (error || data !== true) {
      setMessage({ tone: 'danger', text: 'We couldn’t cancel this appointment online. Please call us and we’ll help.' });
      return;
    }
    setMessage({ tone: 'success', text: 'Your appointment has been cancelled.' });
    onCancelled();
  };

  return (
    <li className="rounded-2xl border border-line/10 bg-ivory p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{getService(session.service)?.name ?? 'Counselling session'}</p>
          <p className="text-sm text-ink-soft">
            {formatSessionDate(session.date)} · {session.time}
          </p>
        </div>
        <Chip tone={STATUS_TONE[session.status] ?? 'neutral'}>{SESSION_STATUS_LABEL[session.status] ?? session.status}</Chip>
      </div>
      {cancellable && !confirming && (
        <button className="mt-3 text-sm font-semibold text-rose-ink underline-offset-4 hover:underline" onClick={() => setConfirming(true)}>
          Cancel appointment
        </button>
      )}
      {confirming && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl bg-rose-soft/60 p-3 text-sm" role="group" aria-label="Confirm cancellation">
          <span className="mr-2">Cancel this appointment?</span>
          <Button size="sm" variant="danger" onClick={cancel} disabled={busy}>
            {busy ? 'Cancelling…' : 'Yes, cancel'}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
            Keep it
          </Button>
        </div>
      )}
      {message && (
        <Alert tone={message.tone} live className="mt-3">
          {message.text}
        </Alert>
      )}
    </li>
  );
}

function Appointments({ user }: { user: User }) {
  const sessions = useAsync<ClientSession[]>(
    async () =>
      unwrap(await supabase.from('sessions').select('id,service,date,time,status').eq('client_user_id', user.id).order('date', { ascending: true })),
    [user.id],
    'We couldn’t load your appointments right now.'
  );
  const today = nairobiDate(new Date());
  const upcoming = (sessions.data ?? []).filter((s) => s.date >= today && s.status !== 'cancelled');
  const past = (sessions.data ?? []).filter((s) => !upcoming.includes(s)).reverse();

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-display-sm">
          <CalendarCheck className="h-5 w-5" aria-hidden /> Appointments
        </h2>
        <Link to="/book" className={buttonClasses('soft', 'sm')}>
          Book another
        </Link>
      </div>
      {sessions.loading && <Spinner className="mt-4" />}
      {sessions.error && (
        <Alert tone="danger" className="mt-4">
          {sessions.error}
        </Alert>
      )}
      {sessions.data && (
        <>
          <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-ink-soft">Upcoming</h3>
          {upcoming.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">No upcoming appointments.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {upcoming.map((s) => (
                <AppointmentRow key={s.id} session={s} onCancelled={sessions.reload} />
              ))}
            </ul>
          )}
          {past.length > 0 && (
            <>
              <h3 className="mt-8 text-sm font-semibold uppercase tracking-wider text-ink-soft">Past & cancelled</h3>
              <ul className="mt-3 space-y-3">
                {past.map((s) => (
                  <AppointmentRow key={s.id} session={s} onCancelled={sessions.reload} />
                ))}
              </ul>
            </>
          )}
          <p className="mt-6 text-xs text-ink-soft">
            Appointments booked before you created an account, or with a different email, won’t appear here. Call {ORG.phoneDisplay} if
            you need help with one.
          </p>
        </>
      )}
    </Card>
  );
}

function Reflections({ user }: { user: User }) {
  const list = useAsync<Reflection[]>(
    async () => unwrap(await supabase.from('client_reflections').select('id,body,created_at').eq('user_id', user.id).order('created_at', { ascending: false })),
    [user.id],
    'We couldn’t load your reflections right now.'
  );
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return setError('Write something first — even a sentence is enough.');
    if (body.length > 5000) return setError('Please keep a reflection under 5,000 characters.');
    setBusy(true);
    setError(null);
    const { error: insertError } = await supabase.from('client_reflections').insert({ body });
    setBusy(false);
    if (insertError) return setError('Your reflection wasn’t saved. Please try again.');
    setDraft('');
    list.reload();
  };

  const remove = async (id: string) => {
    const { error: deleteError } = await supabase.from('client_reflections').delete().eq('id', id);
    if (deleteError) setError('That reflection couldn’t be deleted. Please try again.');
    else list.reload();
  };

  return (
    <Card className="p-6">
      <h2 className="flex items-center gap-2 font-display text-display-sm">
        <NotebookPen className="h-5 w-5" aria-hidden /> Private reflections
      </h2>
      <p className="mt-2 flex items-start gap-2 rounded-2xl bg-lavender-soft px-3 py-2 text-sm text-lavender-ink">
        <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        Private — not visible to your counsellor or anyone at Imela. Share anything you choose to in your session.
      </p>
      <form onSubmit={save} className="mt-4 space-y-3">
        <TextArea label="Write a reflection" value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={5000} error={error ?? undefined} hint="What’s on your mind before or after a session?" />
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? 'Saving…' : 'Save reflection'}
        </Button>
      </form>
      {list.loading && <Spinner className="mt-4" />}
      {list.error && (
        <Alert tone="danger" className="mt-4">
          {list.error}
        </Alert>
      )}
      <ul className="mt-6 space-y-3">
        {(list.data ?? []).map((r) => (
          <li key={r.id} className="rounded-2xl bg-ivory p-4">
            <p className="whitespace-pre-wrap text-sm">{r.body}</p>
            <div className="mt-2 flex items-center justify-between text-xs text-ink-soft">
              <time dateTime={r.created_at}>{new Date(r.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</time>
              <button onClick={() => remove(r.id)} className="inline-flex items-center gap-1 font-semibold text-rose-ink hover:underline" aria-label="Delete this reflection">
                <Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

const PREPARE = [
  'Find a quiet, private space if your session is online, and check your connection a few minutes early.',
  'You don’t need to prepare anything — but jotting down what’s been on your mind can help.',
  'It’s okay to say you don’t know where to start. Your counsellor will help.',
  'If you need to reschedule, please let us know at least 24 hours before.',
];

export default function PortalPage() {
  useDocumentTitle('Client portal');
  const auth = useAuth();

  if (!config.clientPortalEnabled) return <PortalUnavailable />;
  if (auth.loading) return <div className="shell grid min-h-[40vh] place-items-center"><Spinner /></div>;

  if (!auth.user) {
    return (
      <WorkspaceShell eyebrow="Client portal" title="Your space at Imela" lede="Optional — you can always book without an account.">
        <SignInPanel
          auth={auth}
          heading="Sign in"
          allowSignUp
          intro={<p>We only ask for an email address and password. Nothing about your wellbeing is needed to create an account.</p>}
        />
      </WorkspaceShell>
    );
  }

  const exportSubject = encodeURIComponent('Data request — client portal');
  const exportBody = encodeURIComponent(`Hello Imela team,\n\nI would like to request [a copy of / deletion of] the personal data linked to my account (${auth.user.email}).\n\nThank you.`);

  return (
    <WorkspaceShell
      eyebrow="Client portal"
      title="Welcome back"
      lede={`Signed in as ${auth.user.email}`}
      actions={
        <Button variant="outline" size="sm" onClick={auth.signOut}>
          Sign out
        </Button>
      }
    >
      <div className="grid items-start gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-8">
          <Appointments user={auth.user} />
          <Reflections user={auth.user} />
        </div>
        <div className="space-y-8">
          <Card className="p-6">
            <h2 className="font-display text-display-sm">Preparing for your session</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {PREPARE.map((p) => (
                <li key={p} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sage-ink" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
            <Link to="/resources" className="mt-5 inline-block text-sm font-semibold text-lavender-ink underline-offset-4 hover:underline">
              Browse resources
            </Link>
          </Card>
          <Card className="p-6">
            <h2 className="font-display text-display-sm">Privacy & your data</h2>
            <p className="mt-3 text-sm text-ink-soft">
              You can ask for a copy of your data, or for your account and data to be deleted. Requests are handled personally by the
              Imela team, who will confirm by email.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`mailto:${ORG.email}?subject=${exportSubject}&body=${exportBody}`} className={buttonClasses('soft', 'sm')}>
                <Download className="h-4 w-4" aria-hidden /> Request export or deletion
              </a>
              <Link to="/privacy" className={buttonClasses('ghost', 'sm')}>
                Privacy notice
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </WorkspaceShell>
  );
}
