import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, BookOpen, Lock, Send, StickyNote } from 'lucide-react';
import type { CaseMessage, CaseNote, CaseResource, CaseStatus, Counsellor, StaffCase, Urgency } from '../../domain/personaPortal/types';
import { STATUS_LABEL, URGENCY_LABEL } from '../../domain/personaPortal/types';
import { CONCERN_GROUPS } from '../../data/concerns';
import { useResources } from '../../domain/resources';
import { CrisisContacts } from '../layout/UrgentHelp';
import { Button } from '../ui/Button';
import { Alert, Card, TextArea, TextField } from '../ui/primitives';
import { CaseStatusBadge, UrgencyBadge } from './badges';
import { between, concernLabels, formatDateTime, formatDay, since, supportLabel } from './format';
import { cn } from '../../lib/cn';

export type Feedback = { tone: 'success' | 'danger'; text: string } | null;

function PanelTitle({ icon: Icon, children, id }: { icon?: React.ElementType; children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="flex items-center gap-2 text-lg font-semibold text-ink-strong">
      {Icon && <Icon className="h-5 w-5 text-ink-soft" aria-hidden />}
      {children}
    </h2>
  );
}

export function FeedbackLine({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;
  return (
    <Alert tone={feedback.tone} live className="mt-3">
      {feedback.text}
    </Alert>
  );
}

/* ---------------- Summary ---------------- */
export function CaseSummary({ c, counsellorName }: { c: StaffCase; counsellorName: (id: string | null) => string }) {
  const rows: [string, React.ReactNode][] = [
    ['Persona ID', <span className="font-mono font-semibold">{c.persona_code}</span>],
    ['Concerns', concernLabels(c.concerns)],
    ['Prefers', supportLabel(c.preferred_support)],
    ['Queue', c.queue],
    ['Status', <CaseStatusBadge status={c.status} />],
    ['Counsellor', counsellorName(c.assigned_to)],
    ['Opened', `${formatDateTime(c.created_at)} (${since(c.created_at)} ago)`],
    ['First response', c.first_response_at ? `${between(c.created_at, c.first_response_at)} after opening` : 'No reply yet'],
    ['Last activity from person', `${formatDateTime(c.last_persona_activity)}`],
    ['Follow-up', formatDay(c.follow_up_on)],
  ];
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center gap-2">
        <UrgencyBadge urgency={c.urgency} />
        {c.urgency_reason && <span className={cn('text-sm', c.urgency === 'routine' ? 'text-ink-soft' : 'text-rose-ink')}>{c.urgency_reason}</span>}
      </div>
      <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        {rows.map(([k, v]) => (
          <div key={k} className="flex flex-col">
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{k}</dt>
            <dd className="text-ink-strong">{v}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

/* ---------------- Safety guidance (crisis review) ---------------- */
export function SafetyGuidance({ onInsertMessage, canAct }: { onInsertMessage: () => void; canAct: boolean }) {
  return (
    <section aria-labelledby="safety-title" className="rounded-card border-2 border-rose bg-rose-soft/60 p-5">
      <PanelTitle icon={AlertTriangle} id="safety-title">
        Possible risk — prompt human review
      </PanelTitle>
      <p className="mt-2 text-sm text-ink">
        This case was flagged by an automated screen of the person’s words. The flag is not an assessment. A counsellor must review it now and decide what
        support is appropriate.
      </p>
      <div className="mt-3 rounded-2xl border border-dashed border-rose-ink/40 bg-paper/70 p-4 text-sm">
        <p className="font-semibold text-rose-ink">Imela to confirm its safeguarding procedure</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-ink">
          <li>Pick up the case and read the full story and conversation.</li>
          <li>Reply promptly, acknowledging what they’ve shared and sharing emergency contacts.</li>
          <li>Record your assessment and actions in the internal notes.</li>
          <li>Escalate to the clinical lead as Imela’s procedure requires, and set a follow-up date.</li>
          <li>Never promise a call-back or monitoring the platform cannot provide.</li>
        </ol>
      </div>
      <div className="mt-4">
        <CrisisContacts compact />
      </div>
      <Button variant="danger" size="sm" className="mt-4" onClick={onInsertMessage} disabled={!canAct}>
        Insert emergency-contacts message into reply
      </Button>
      {!canAct && <p className="mt-2 text-xs text-ink-soft">Pick up the case to reply.</p>}
    </section>
  );
}

/* ---------------- Conversation ---------------- */
export function ThreadPanel({
  c,
  messages,
  canAct,
  canPickUp,
  draft,
  setDraft,
  onSend,
  onPickUp,
  busy,
  feedback,
}: {
  c: StaffCase;
  messages: CaseMessage[];
  canAct: boolean;
  canPickUp: boolean;
  draft: string;
  setDraft: (v: string) => void;
  onSend: () => void;
  onPickUp: () => void;
  busy: boolean;
  feedback: Feedback;
}) {
  return (
    <Card as="section" className="p-5">
      <PanelTitle icon={Send}>Conversation with {c.persona_code}</PanelTitle>
      {c.story && (
        <div className="mt-4 rounded-2xl bg-lavender-soft/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-lavender-ink">What they shared when opening the case</p>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm text-ink-strong">{c.story}</p>
        </div>
      )}
      <ol className="mt-4 space-y-3" aria-label="Messages">
        {messages.length === 0 && <li className="text-sm text-ink-soft">No messages yet.</li>}
        {messages.map((m) => (
          <li key={m.id} className={cn('flex', m.sender_role === 'counsellor' ? 'justify-end' : 'justify-start')}>
            <div
              className={cn(
                'max-w-[90%] rounded-3xl px-4 py-3 text-sm',
                m.sender_role === 'counsellor' ? 'rounded-br-md bg-lavender-ink text-white' : m.sender_role === 'system' ? 'bg-ivory-deep text-ink' : 'rounded-bl-md bg-ivory-deep text-ink-strong'
              )}
            >
              <p className={cn('text-[0.7rem] font-semibold uppercase tracking-wide', m.sender_role === 'counsellor' ? 'text-white/80' : 'text-ink-soft')}>
                {m.sender_role === 'counsellor' ? 'Counsellor' : m.sender_role === 'system' ? 'System' : 'Person'} · {formatDateTime(m.created_at)}
              </p>
              <p className="mt-1 whitespace-pre-wrap break-words">{m.body}</p>
            </div>
          </li>
        ))}
      </ol>

      {c.status === 'closed' ? (
        <p className="mt-5 text-sm text-ink-soft">This case is closed. Reopen it (status) to reply.</p>
      ) : canAct ? (
        <form
          className="mt-5 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            onSend();
          }}
        >
          <TextArea
            label="Reply to the person"
            hint="They will see this in their private space. Don't ask for their name, email or phone number."
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, 5000))}
            rows={5}
          />
          <Button type="submit" variant="accent" disabled={busy || !draft.trim()}>
            <Send className="h-4 w-4" aria-hidden /> {busy ? 'Sending…' : 'Send reply'}
          </Button>
        </form>
      ) : canPickUp ? (
        <div className="mt-5 rounded-2xl bg-ivory-deep p-4">
          <p className="text-sm text-ink">Pick up this case to reply. It will be assigned to you.</p>
          <Button className="mt-3" onClick={onPickUp} disabled={busy}>
            Pick up this case
          </Button>
        </div>
      ) : (
        <p className="mt-5 text-sm text-ink-soft">This case is assigned to another counsellor.</p>
      )}
      <FeedbackLine feedback={feedback} />
    </Card>
  );
}

/* ---------------- Internal notes ---------------- */
export function NotesPanel({
  notes,
  canAct,
  onAdd,
  authorName,
}: {
  notes: CaseNote[];
  canAct: boolean;
  onAdd: (body: string) => Promise<boolean>;
  authorName: (id: string | null) => string;
}) {
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <Card as="section" className="border-2 border-dashed border-butter p-5">
      <PanelTitle icon={StickyNote}>Internal notes</PanelTitle>
      <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-butter-ink">
        <Lock className="h-3.5 w-3.5" aria-hidden /> Internal — never visible to the person
      </p>
      <ul className="mt-3 space-y-2">
        {notes.length === 0 && <li className="text-sm text-ink-soft">No notes yet.</li>}
        {notes.map((n) => (
          <li key={n.id} className="rounded-2xl bg-butter/30 p-3 text-sm">
            <p className="text-xs text-ink-soft">
              {authorName(n.author_id)} · {formatDateTime(n.created_at)}
            </p>
            <p className="mt-1 whitespace-pre-wrap break-words text-ink-strong">{n.body}</p>
          </li>
        ))}
      </ul>
      {canAct && (
        <form
          className="mt-4 space-y-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            const ok = await onAdd(draft);
            setBusy(false);
            if (ok) setDraft('');
          }}
        >
          <TextArea label="Add an internal note" value={draft} onChange={(e) => setDraft(e.target.value.slice(0, 5000))} rows={3} />
          <Button type="submit" size="sm" variant="outline" disabled={busy || !draft.trim()}>
            Save note
          </Button>
        </form>
      )}
    </Card>
  );
}

/* ---------------- Case management ---------------- */
export function ManagePanel({
  c,
  isAdmin,
  canAct,
  counsellors,
  onAssign,
  onStatus,
  onUrgency,
  onFollowUp,
  feedback,
}: {
  c: StaffCase;
  isAdmin: boolean;
  canAct: boolean;
  counsellors: Counsellor[];
  onAssign: (id: string | null) => void;
  onStatus: (s: CaseStatus) => void;
  onUrgency: (u: Urgency, reason: string) => void;
  onFollowUp: (d: string | null) => void;
  feedback: Feedback;
}) {
  const [urgency, setUrgency] = useState<Urgency>(c.urgency);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [followUp, setFollowUp] = useState(c.follow_up_on ?? '');
  const select = 'w-full rounded-2xl border border-line/20 bg-paper px-3 py-2.5 text-sm';

  return (
    <Card as="section" className="space-y-5 p-5">
      <PanelTitle>Manage case</PanelTitle>

      {isAdmin && (
        <label className="block text-sm">
          <span className="font-semibold text-ink-strong">Assigned counsellor</span>
          <select className={cn(select, 'mt-1')} value={c.assigned_to ?? ''} onChange={(e) => onAssign(e.target.value || null)}>
            <option value="">Unassigned (queue)</option>
            {counsellors.map((p) => (
              <option key={p.user_id} value={p.user_id}>
                {p.display_name}
              </option>
            ))}
          </select>
        </label>
      )}

      {canAct ? (
        <>
          <label className="block text-sm">
            <span className="font-semibold text-ink-strong">Status</span>
            <select className={cn(select, 'mt-1')} value={c.status} onChange={(e) => onStatus(e.target.value as CaseStatus)}>
              {(Object.keys(STATUS_LABEL) as CaseStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </label>

          <form
            className="space-y-2 rounded-2xl bg-ivory-deep/70 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!reason.trim()) {
                setReasonError('Please give a short reason — urgency changes are a recorded human decision.');
                return;
              }
              setReasonError(null);
              onUrgency(urgency, reason);
              setReason('');
            }}
          >
            <p className="text-sm font-semibold text-ink-strong">Urgency (human decision)</p>
            <p className="text-xs text-ink-soft">The automated flag only raises cases for review. You decide the urgency; your reason is recorded.</p>
            <select aria-label="Urgency" className={select} value={urgency} onChange={(e) => setUrgency(e.target.value as Urgency)}>
              {(Object.keys(URGENCY_LABEL) as Urgency[]).map((u) => (
                <option key={u} value={u}>
                  {URGENCY_LABEL[u]}
                </option>
              ))}
            </select>
            <TextField label="Reason" value={reason} onChange={(e) => setReason(e.target.value.slice(0, 200))} error={reasonError ?? undefined} />
            <Button type="submit" size="sm" variant="outline">
              Update urgency
            </Button>
          </form>

          <form
            className="flex flex-wrap items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              onFollowUp(followUp || null);
            }}
          >
            <TextField label="Follow-up date" type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)} />
            <Button type="submit" size="sm" variant="outline">
              Save
            </Button>
          </form>
        </>
      ) : (
        <p className="text-sm text-ink-soft">Pick up this case to change its status, urgency or follow-up.</p>
      )}
      <FeedbackLine feedback={feedback} />
    </Card>
  );
}

/* ---------------- Resources ---------------- */
export function ResourcesPanel({
  resources,
  canAct,
  onAssign,
}: {
  resources: CaseResource[];
  canAct: boolean;
  onAssign: (input: { title: string; url: string; note?: string }) => Promise<boolean>;
}) {
  const { resources: library } = useResources();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const pick = (value: string) => {
    if (!value) return;
    const [t, u] = value.split('|');
    setTitle(t);
    setUrl(u);
  };

  return (
    <Card as="section" className="p-5">
      <PanelTitle icon={BookOpen}>Resources for this person</PanelTitle>
      <ul className="mt-3 space-y-2">
        {resources.length === 0 && <li className="text-sm text-ink-soft">None assigned yet.</li>}
        {resources.map((r) => (
          <li key={r.id} className="rounded-2xl bg-ivory-deep/70 p-3 text-sm">
            {r.url.startsWith('/') ? (
              <Link to={r.url} className="font-semibold text-lavender-ink underline-offset-4 hover:underline">
                {r.title}
              </Link>
            ) : (
              <a href={r.url} target="_blank" rel="noreferrer noopener" className="font-semibold text-lavender-ink underline-offset-4 hover:underline">
                {r.title}
              </a>
            )}
            {r.note && <p className="mt-1 text-ink">{r.note}</p>}
            <p className="mt-1 text-xs text-ink-soft">{formatDateTime(r.created_at)}</p>
          </li>
        ))}
      </ul>
      {canAct && (
        <form
          className="mt-4 space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const u = url.trim();
            if (!title.trim()) return setError('Add a title.');
            if (!(u.startsWith('/') || u.startsWith('https://'))) return setError('Links must start with / (this site) or https://');
            setError(null);
            setBusy(true);
            const ok = await onAssign({ title, url: u, note });
            setBusy(false);
            if (ok) {
              setTitle('');
              setUrl('');
              setNote('');
            }
          }}
        >
          <label className="block text-sm">
            <span className="font-semibold text-ink-strong">Quick pick</span>
            <select className="mt-1 w-full rounded-2xl border border-line/20 bg-paper px-3 py-2.5 text-sm" defaultValue="" onChange={(e) => pick(e.target.value)}>
              <option value="">Choose from Imela’s library…</option>
              <optgroup label="Resources">
                {library.map((r) => (
                  <option key={r.slug} value={`${r.title}|/resources/${r.slug}`}>
                    {r.title}
                    {r.reviewStatus === 'draft' ? ' (draft)' : ''}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Support areas">
                {CONCERN_GROUPS.map((g) => (
                  <option key={g.id} value={`${g.title}|/support/area/${g.id}`}>
                    {g.title}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>
          <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value.slice(0, 200))} />
          <TextField label="Link" hint="Starts with / for this site, or https://" value={url} onChange={(e) => setUrl(e.target.value.slice(0, 500))} error={error ?? undefined} />
          <TextField label="Note for the person" optional value={note} onChange={(e) => setNote(e.target.value.slice(0, 500))} />
          <Button type="submit" size="sm" variant="outline" disabled={busy}>
            Share resource
          </Button>
        </form>
      )}
    </Card>
  );
}
