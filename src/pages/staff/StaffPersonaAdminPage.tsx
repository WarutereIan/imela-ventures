import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { StaffGate, type StaffContext } from '../../components/staffPersona/StaffGate';
import { useCounsellors } from '../../components/staffPersona/useCounsellors';
import { actionError, formatDateTime } from '../../components/staffPersona/format';
import { getWorkload, listPersonaAudit, listTriageRules, updateTriageRule, type Workload } from '../../domain/personaPortal/staffApi';
import { CONCERN_LABEL, type AuditEvent, type TriageRule } from '../../domain/personaPortal/types';
import { Alert, Card, Spinner } from '../../components/ui/primitives';
import { Button, buttonClasses } from '../../components/ui/Button';
import { useDocumentTitle } from '../../lib/useDocumentTitle';

const ACTION_LABEL: Record<string, string> = {
  view: 'Opened case',
  assign: 'Assigned',
  status: 'Changed status',
  urgency: 'Changed urgency',
  follow_up: 'Set follow-up',
  reply: 'Replied',
  note: 'Added internal note',
  resource: 'Shared resource',
};

function WorkloadPanel({ nameFor }: { nameFor: (id: string | null) => string }) {
  const [rows, setRows] = useState<Workload[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    getWorkload().then((res) => (res.ok ? setRows(res.data) : setError(actionError(res.reason))));
  }, []);
  return (
    <Card as="section" className="p-5">
      <h2 className="text-lg font-semibold">Workload</h2>
      <p className="mt-1 text-sm text-ink-soft">Counts only — no case content.</p>
      {error && <Alert tone="danger" className="mt-3">{error}</Alert>}
      {!rows && !error && <Spinner className="mt-3" />}
      {rows && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead>
              <tr className="border-b border-line/15 text-ink-soft">
                <th scope="col" className="py-2 pr-3 font-semibold">Counsellor</th>
                <th scope="col" className="px-3 py-2 font-semibold">Open</th>
                <th scope="col" className="px-3 py-2 font-semibold">Awaiting reply</th>
                <th scope="col" className="px-3 py-2 font-semibold">Crisis review</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-3 text-ink-soft">No cases yet.</td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.assignee ?? 'unassigned'} className="border-b border-line/10">
                  <th scope="row" className="py-2 pr-3 font-medium">{r.assignee ? nameFor(r.assignee) : 'Unassigned (queue)'}</th>
                  <td className="px-3 py-2">{r.open_cases}</td>
                  <td className="px-3 py-2">{r.awaiting_reply}</td>
                  <td className={`px-3 py-2 ${r.crisis_review > 0 ? 'font-bold text-rose-ink' : ''}`}>{r.crisis_review}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function RuleRow({ rule, userId }: { rule: TriageRule; userId: string }) {
  const [queue, setQueue] = useState(rule.queue);
  const [urgency, setUrgency] = useState(rule.base_urgency);
  const [active, setActive] = useState(rule.active);
  const [msg, setMsg] = useState<{ tone: 'success' | 'danger'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const dirty = queue !== rule.queue || urgency !== rule.base_urgency || active !== rule.active;

  return (
    <li className="rounded-2xl bg-ivory-deep/60 p-4">
      <p className="font-semibold text-ink-strong">{CONCERN_LABEL[rule.concern] ?? rule.concern}</p>
      <form
        className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!queue.trim()) return setMsg({ tone: 'danger', text: 'Queue name is required.' });
          setBusy(true);
          const res = await updateTriageRule({ concern: rule.concern, queue, base_urgency: urgency, active }, userId);
          setBusy(false);
          setMsg(res.ok ? { tone: 'success', text: 'Saved.' } : { tone: 'danger', text: actionError(res.reason, res.message) });
        }}
      >
        <label className="text-sm">
          <span className="font-semibold">Queue</span>
          <input value={queue} onChange={(e) => setQueue(e.target.value.slice(0, 60))} className="mt-1 w-full rounded-2xl border border-line/20 bg-paper px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="font-semibold">Base urgency</span>
          <select value={urgency} onChange={(e) => setUrgency(e.target.value as TriageRule['base_urgency'])} className="mt-1 block rounded-2xl border border-line/20 bg-paper px-3 py-2">
            <option value="routine">Routine</option>
            <option value="priority">Priority</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm sm:pb-2">
          <input type="checkbox" className="h-4 w-4 accent-[#4E3D99]" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Active
        </label>
        <Button type="submit" size="sm" variant="outline" disabled={!dirty || busy}>
          Save
        </Button>
      </form>
      {msg && <p className={`mt-2 text-xs font-medium ${msg.tone === 'success' ? 'text-success' : 'text-danger'}`} role="status">{msg.text}</p>}
    </li>
  );
}

function TriagePanel({ userId }: { userId: string }) {
  const [rules, setRules] = useState<TriageRule[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    listTriageRules().then((res) => (res.ok ? setRules(res.data) : setError(actionError(res.reason))));
  }, []);
  return (
    <Card as="section" className="p-5">
      <h2 className="text-lg font-semibold">Triage rules</h2>
      <p className="mt-1 text-sm text-ink-soft">
        These rules are transparent and only route new cases to a queue and starting urgency. They never decide care: counsellors review every case, can
        override urgency with a recorded reason, and make all clinical decisions. Possible-risk language always raises a case to crisis review, whatever
        these rules say.
      </p>
      {error && <Alert tone="danger" className="mt-3">{error}</Alert>}
      {!rules && !error && <Spinner className="mt-3" />}
      {rules && (
        <ul className="mt-4 space-y-3">
          {rules.map((r) => (
            <RuleRow key={r.concern} rule={r} userId={userId} />
          ))}
        </ul>
      )}
    </Card>
  );
}

function AuditPanel({ nameFor }: { nameFor: (id: string | null) => string }) {
  const [events, setEvents] = useState<AuditEvent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState('');
  const [caseFilter, setCaseFilter] = useState('');

  const load = useCallback(() => {
    listPersonaAudit(300).then((res) => (res.ok ? setEvents(res.data) : setError(actionError(res.reason))));
  }, []);
  useEffect(load, [load]);

  const shown = useMemo(
    () => (events ?? []).filter((e) => (!action || e.action === action) && (!caseFilter.trim() || (e.entity_id ?? '').startsWith(caseFilter.trim()))),
    [events, action, caseFilter]
  );

  return (
    <Card as="section" className="p-5">
      <h2 className="text-lg font-semibold">Access & activity history</h2>
      <p className="mt-1 text-sm text-ink-soft">Every time staff open, assign, reply to or change a case is recorded here. Content is never copied into this log.</p>
      <div className="mt-4 flex flex-wrap items-end gap-3 text-sm">
        <label>
          <span className="font-semibold">Action</span>
          <select value={action} onChange={(e) => setAction(e.target.value)} className="mt-1 block rounded-2xl border border-line/20 bg-paper px-3 py-2">
            <option value="">All</option>
            {Object.entries(ACTION_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="font-semibold">Case ID starts with</span>
          <input value={caseFilter} onChange={(e) => setCaseFilter(e.target.value)} className="mt-1 block rounded-2xl border border-line/20 bg-paper px-3 py-2" />
        </label>
        <Button size="sm" variant="ghost" onClick={load}>
          Refresh
        </Button>
      </div>
      {error && <Alert tone="danger" className="mt-3">{error}</Alert>}
      {!events && !error && <Spinner className="mt-3" />}
      {events && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead>
              <tr className="border-b border-line/15 text-ink-soft">
                <th scope="col" className="py-2 pr-3 font-semibold">When</th>
                <th scope="col" className="px-3 py-2 font-semibold">Who</th>
                <th scope="col" className="px-3 py-2 font-semibold">Action</th>
                <th scope="col" className="px-3 py-2 font-semibold">Case</th>
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-3 text-ink-soft">No matching activity.</td>
                </tr>
              )}
              {shown.map((e) => (
                <tr key={e.id} className="border-b border-line/10">
                  <td className="whitespace-nowrap py-2 pr-3">{formatDateTime(e.created_at)}</td>
                  <td className="px-3 py-2">{e.actor ? nameFor(e.actor) : 'System'}</td>
                  <td className="px-3 py-2">{ACTION_LABEL[e.action] ?? e.action}</td>
                  <td className="px-3 py-2">
                    {e.entity_id ? (
                      <Link to={`/staff/persona/${e.entity_id}`} className="font-mono text-lavender-ink hover:underline">
                        {e.entity_id.slice(0, 8)}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function AdminWorkspace({ ctx }: { ctx: StaffContext }) {
  const { nameFor } = useCounsellors(ctx.user.id);
  return (
    <div className="space-y-6">
      <Link to="/staff/persona" className={buttonClasses('ghost', 'sm')}>
        <ArrowLeft className="h-4 w-4" aria-hidden /> Cases
      </Link>
      <div className="grid gap-6 lg:grid-cols-2">
        <WorkloadPanel nameFor={nameFor} />
        <Card as="section" className="p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <KeyRound className="h-5 w-5 text-ink-soft" aria-hidden /> Access control
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink">
            <li>Staff roles (admin, practitioner) are granted in Supabase in the user_roles table — not from this website.</li>
            <li>Practitioners see the unassigned queue and their own cases. Admins see all cases.</li>
            <li>Persona logins can never hold a staff role; the database rejects it.</li>
            <li>Personas cannot see urgency, queues, internal notes or who is assigned — only the conversation and shared resources.</li>
            <li>What you see on these pages is enforced by row-level security and audited database functions; hiding a button is never the safeguard.</li>
          </ul>
        </Card>
      </div>
      <TriagePanel userId={ctx.user.id} />
      <AuditPanel nameFor={nameFor} />
    </div>
  );
}

export default function StaffPersonaAdminPage() {
  useDocumentTitle('Persona settings & audit');
  return (
    <StaffGate eyebrow="Admin · Imela Persona" title="Settings, triage & audit" requireAdmin>
      {(ctx) => <AdminWorkspace ctx={ctx} />}
    </StaffGate>
  );
}
