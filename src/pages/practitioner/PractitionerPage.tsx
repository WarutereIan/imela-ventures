import React, { useState } from 'react';
import { ClipboardList, Lock, UserRound } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { config } from '../../lib/config';
import { supabase } from '../../lib/supabase';
import { useAuth, useRoles } from '../../lib/auth';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import { getService } from '../../data/services';
import { AccessDenied, SetupPending, SignInPanel, WorkspaceShell } from '../../components/workspace/WorkspaceStates';
import { SESSION_STATUS_LABEL, formatSessionDate } from '../../components/workspace/format';
import { useAsync, unwrap } from '../../components/workspace/useAsync';
import { Button, buttonClasses } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { Alert, Card, Chip, EmptyState, Spinner, TextArea } from '../../components/ui/primitives';
import Companion from '../../components/characters/Companion';
import { nairobiDate } from '../../domain/booking/slots';
import { cn } from '../../lib/cn';

interface AssignedSession {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  service: string;
  message: string | null;
  date: string;
  time: string;
  status: string;
}

interface Note {
  id: string;
  body: string;
  created_at: string;
  updated_at: string;
}

const STATUS_ACTIONS = [
  { status: 'confirmed', label: 'Mark confirmed' },
  { status: 'completed', label: 'Mark completed' },
  { status: 'cancelled', label: 'Mark cancelled' },
] as const;

function SectionLabel({ icon: Icon, children, tone }: { icon: React.ElementType; children: React.ReactNode; tone: string }) {
  return (
    <p className={cn('inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-xs font-semibold', tone)}>
      <Icon className="h-3.5 w-3.5" aria-hidden /> {children}
    </p>
  );
}

function SessionNotes({ sessionId }: { sessionId: string }) {
  const notes = useAsync<Note[]>(
    async () => unwrap(await supabase.from('practitioner_notes').select('id,body,created_at,updated_at').eq('session_id', sessionId).order('created_at', { ascending: true })),
    [sessionId],
    'Your notes couldn’t be loaded.'
  );
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return setError('Write a note first.');
    setBusy(true);
    setError(null);
    const { error: insertError } = await supabase.from('practitioner_notes').insert({ session_id: sessionId, body });
    setBusy(false);
    if (insertError) return setError('The note wasn’t saved. Please try again.');
    setDraft('');
    notes.reload();
  };

  return (
    <div>
      {notes.loading && <Spinner />}
      {notes.error && <Alert tone="danger">{notes.error}</Alert>}
      <ul className="space-y-3">
        {(notes.data ?? []).map((n) => (
          <li key={n.id} className="rounded-2xl bg-ivory p-3 text-sm">
            <p className="whitespace-pre-wrap">{n.body}</p>
            <time className="mt-1 block text-xs text-ink-soft" dateTime={n.created_at}>
              {new Date(n.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
            </time>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="mt-4 space-y-3">
        <TextArea label="Add a note" value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={20000} error={error ?? undefined} />
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? 'Saving…' : 'Save note'}
        </Button>
      </form>
    </div>
  );
}

function SessionDetail({ session, onChanged }: { session: AssignedSession; onChanged: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);

  const setStatus = async (status: string) => {
    setBusy(status);
    setResult(null);
    const { error } = await supabase.from('sessions').update({ status }).eq('id', session.id);
    setBusy(null);
    if (error) setResult({ tone: 'danger', text: 'The status couldn’t be updated.' });
    else {
      setResult({ tone: 'success', text: `Status updated to ${SESSION_STATUS_LABEL[status]?.toLowerCase() ?? status}.` });
      onChanged();
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <SectionLabel icon={UserRound} tone="bg-sky-soft text-sky-ink">
          Client-provided
        </SectionLabel>
        <h2 className="mt-3 font-display text-display-sm">{session.customer_name}</h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-ink-soft">Email</dt>
            <dd>
              <a className="underline" href={`mailto:${session.email}`}>
                {session.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-ink-soft">Phone</dt>
            <dd>
              <a className="underline" href={`tel:${session.phone}`}>
                {session.phone}
              </a>
            </dd>
          </div>
        </dl>
        <div className="mt-4">
          <p className="text-sm text-ink-soft">Message shared when booking</p>
          <p className="mt-1 whitespace-pre-wrap rounded-2xl bg-ivory p-3 text-sm">{session.message || 'No message was shared.'}</p>
        </div>
      </Card>

      <Card className="p-6">
        <SectionLabel icon={ClipboardList} tone="bg-ink/5 text-ink">
          Administrative
        </SectionLabel>
        <p className="mt-3 text-sm">
          {getService(session.service)?.name ?? session.service} · {formatSessionDate(session.date)} · {session.time}
        </p>
        <p className="mt-1 text-sm">
          Status: <strong>{SESSION_STATUS_LABEL[session.status] ?? session.status}</strong>
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {STATUS_ACTIONS.filter((a) => a.status !== session.status).map((a) => (
            <Button key={a.status} size="sm" variant={a.status === 'cancelled' ? 'ghost' : 'outline'} onClick={() => setStatus(a.status)} disabled={busy !== null}>
              {busy === a.status ? 'Updating…' : a.label}
            </Button>
          ))}
        </div>
        {result && (
          <Alert tone={result.tone} live className="mt-3">
            {result.text}
          </Alert>
        )}
        <p className="mt-3 text-xs text-ink-soft">Status changes are recorded in an audit history that administrators can review.</p>
      </Card>

      <Card className="p-6">
        <SectionLabel icon={Lock} tone="bg-lavender-soft text-lavender-ink">
          Your notes (private to you)
        </SectionLabel>
        <p className="mt-2 text-xs text-ink-soft">Only you can read these notes. They are not shared with the client, administrators or organisations.</p>
        <div className="mt-4">
          <SessionNotes sessionId={session.id} />
        </div>
      </Card>
    </div>
  );
}

function PractitionerDashboard({ user }: { user: User }) {
  const profile = useAsync<{ id: string; display_name: string }[]>(
    async () => unwrap(await supabase.from('practitioners').select('id,display_name').eq('user_id', user.id)),
    [user.id],
    'Your practitioner profile couldn’t be loaded.'
  );
  const practitionerId = profile.data?.[0]?.id ?? null;
  const sessions = useAsync<AssignedSession[]>(
    practitionerId
      ? async () =>
          unwrap(
            await supabase
              .from('sessions')
              .select('id,customer_name,email,phone,service,message,date,time,status')
              .eq('practitioner_id', practitionerId)
              .order('date', { ascending: true })
          )
      : null,
    [practitionerId],
    'Your appointments couldn’t be loaded.'
  );
  const [view, setView] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (profile.loading) return <Spinner />;
  if (profile.error) return <Alert tone="danger">{profile.error}</Alert>;
  if (!practitionerId)
    return (
      <EmptyState title="Your login isn’t linked to a practitioner profile yet" art={<Companion variant="cloud" mood="curious" tone="sky" size={110} />}>
        An administrator needs to connect your account to your practitioner profile.
      </EmptyState>
    );

  const today = nairobiDate(new Date());
  const all = sessions.data ?? [];
  const list = view === 'upcoming' ? all.filter((s) => s.date >= today) : all.filter((s) => s.date < today).reverse();
  const selected = all.find((s) => s.id === selectedId) ?? null;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.3fr]">
      <Card className="p-6">
        <div className="flex gap-2" role="tablist" aria-label="Appointments">
          {(['upcoming', 'past'] as const).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={cn('rounded-pill px-4 py-1.5 text-sm font-semibold', view === v ? 'bg-ink-strong text-ivory' : 'text-ink hover:bg-ink/5')}
            >
              {v === 'upcoming' ? 'Upcoming' : 'Past'}
            </button>
          ))}
        </div>
        {sessions.loading && <Spinner className="mt-4" />}
        {sessions.error && (
          <Alert tone="danger" className="mt-4">
            {sessions.error}
          </Alert>
        )}
        {!sessions.loading && list.length === 0 && <p className="mt-6 text-sm text-ink-soft">No {view} appointments assigned to you.</p>}
        <ul className="mt-4 space-y-2">
          {list.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => setSelectedId(s.id)}
                aria-current={selectedId === s.id || undefined}
                className={cn('w-full rounded-2xl border p-3 text-left transition-colors', selectedId === s.id ? 'border-lavender-ink bg-lavender-soft' : 'border-line/10 bg-ivory hover:bg-ivory-deep')}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{s.customer_name}</span>
                  <Chip>{SESSION_STATUS_LABEL[s.status] ?? s.status}</Chip>
                </span>
                <span className="mt-1 block text-xs text-ink-soft">
                  {formatSessionDate(s.date)} · {s.time} · {getService(s.service)?.name ?? s.service}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Card>
      <div>
        {selected ? (
          <SessionDetail session={selected} onChanged={sessions.reload} />
        ) : (
          <EmptyState title="Select an appointment" art={<Companion variant="drift" mood="calm" tone="sage" size={100} />}>
            Choose an appointment to see what the client shared, update its status and keep your private notes.
          </EmptyState>
        )}
      </div>
    </div>
  );
}

export default function PractitionerPage() {
  useDocumentTitle('Practitioner workspace');
  const auth = useAuth();
  const { roles, loading: rolesLoading, error: rolesError } = useRoles(auth.user);

  if (!config.platformDbReady) {
    return (
      <SetupPending title="Practitioner workspace">
        <p>Practitioners will see only the appointments assigned to them, with private session notes that no one else can read.</p>
      </SetupPending>
    );
  }
  if (auth.loading) return <div className="shell grid min-h-[40vh] place-items-center"><Spinner /></div>;
  if (!auth.user) {
    return (
      <WorkspaceShell eyebrow="For practitioners" title="Practitioner workspace">
        <SignInPanel auth={auth} heading="Sign in" intro={<p>For Imela practitioners. Access is set up by an administrator.</p>} />
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell
      eyebrow="Practitioner workspace"
      title="Your appointments"
      lede="Only appointments assigned to you are shown. Access is enforced by the database."
      actions={
        <>
          {config.personaPortalEnabled && (
            <Link to="/staff/persona" className={buttonClasses('soft', 'sm')}>
              Anonymous cases
            </Link>
          )}
          <Button variant="outline" size="sm" onClick={auth.signOut}>
            Sign out
          </Button>
        </>
      }
    >
      {rolesLoading ? (
        <Spinner />
      ) : rolesError ? (
        <Alert tone="danger">{rolesError}</Alert>
      ) : roles.includes('practitioner') ? (
        <PractitionerDashboard user={auth.user} />
      ) : (
        <AccessDenied what="Imela practitioners" onSignOut={auth.signOut} />
      )}
    </WorkspaceShell>
  );
}
