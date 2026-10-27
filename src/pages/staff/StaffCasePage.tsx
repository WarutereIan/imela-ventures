import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Eye } from 'lucide-react';
import { StaffGate, type StaffContext } from '../../components/staffPersona/StaffGate';
import { useCounsellors } from '../../components/staffPersona/useCounsellors';
import {
  CaseSummary,
  ManagePanel,
  NotesPanel,
  ResourcesPanel,
  SafetyGuidance,
  ThreadPanel,
  type Feedback,
} from '../../components/staffPersona/CasePanels';
import { actionError } from '../../components/staffPersona/format';
import { crisisMessageTemplate } from '../../components/staffPersona/safetyMessage';
import {
  addCaseNote,
  assignCase,
  assignCaseResource,
  openStaffCase,
  sendStaffReply,
  setCaseStatus,
  setCaseUrgency,
  setFollowUp,
  type CaseDetail,
} from '../../domain/personaPortal/staffApi';
import type { CaseStatus, Urgency } from '../../domain/personaPortal/types';
import { Alert, Spinner } from '../../components/ui/primitives';
import { buttonClasses } from '../../components/ui/Button';
import { useDocumentTitle } from '../../lib/useDocumentTitle';

function CaseWorkspace({ ctx, caseId }: { ctx: StaffContext; caseId: string }) {
  const [detail, setDetail] = useState<CaseDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [threadFeedback, setThreadFeedback] = useState<Feedback>(null);
  const [manageFeedback, setManageFeedback] = useState<Feedback>(null);
  const { counsellors, nameFor } = useCounsellors(ctx.user.id);

  // Every open is written to the audit log by openStaffCase (staff_open_case).
  const load = useCallback(async () => {
    const res = await openStaffCase(caseId);
    if (res.ok) {
      setDetail(res.data);
      setLoadError(null);
    } else {
      setLoadError(actionError(res.reason, res.message));
    }
  }, [caseId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loadError && !detail) {
    return (
      <Alert tone="danger" title="Couldn’t open this case">
        {loadError}
      </Alert>
    );
  }
  if (!detail) return <Spinner label="Opening case…" />;

  const c = detail.case;
  const canAct = ctx.isAdmin || c.assigned_to === ctx.user.id;
  const canPickUp = !canAct && c.assigned_to === null;

  const run = async (
    action: () => Promise<{ ok: boolean; reason?: string; message?: string }>,
    success: string,
    set: (f: Feedback) => void
  ): Promise<boolean> => {
    setBusy(true);
    const res = await action();
    setBusy(false);
    if (res.ok) {
      set({ tone: 'success', text: success });
      await load();
      return true;
    }
    set({ tone: 'danger', text: actionError(res.reason ?? 'failed', res.message) });
    return false;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/staff/persona" className={buttonClasses('ghost', 'sm')}>
          <ArrowLeft className="h-4 w-4" aria-hidden /> All cases
        </Link>
        <p className="flex items-center gap-1.5 text-xs text-ink-soft">
          <Eye className="h-3.5 w-3.5" aria-hidden /> Your access to this case is recorded.
        </p>
      </div>

      {c.urgency === 'crisis_review' && c.status !== 'closed' && (
        <SafetyGuidance canAct={canAct} onInsertMessage={() => setDraft((d) => (d.trim() ? `${d}\n\n${crisisMessageTemplate()}` : crisisMessageTemplate()))} />
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          <CaseSummary c={c} counsellorName={nameFor} />
          <ThreadPanel
            c={c}
            messages={detail.messages}
            canAct={canAct}
            canPickUp={canPickUp}
            draft={draft}
            setDraft={setDraft}
            busy={busy}
            feedback={threadFeedback}
            onSend={() =>
              void run(() => sendStaffReply(c.id, draft, ctx.user.id), 'Reply sent.', setThreadFeedback).then((ok) => {
                if (ok) setDraft('');
              })
            }
            onPickUp={() => void run(() => assignCase(c.id, ctx.user.id), 'Case picked up — it’s now assigned to you.', setThreadFeedback)}
          />
        </div>
        <div className="min-w-0 space-y-6">
          <ManagePanel
            key={`${c.urgency}-${c.follow_up_on}-${c.status}`}
            c={c}
            isAdmin={ctx.isAdmin}
            canAct={canAct}
            counsellors={counsellors}
            feedback={manageFeedback}
            onAssign={(id) => void run(() => assignCase(c.id, id), id ? 'Case assigned.' : 'Case returned to the queue.', setManageFeedback)}
            onStatus={(s: CaseStatus) => void run(() => setCaseStatus(c.id, s), 'Status updated.', setManageFeedback)}
            onUrgency={(u: Urgency, reason: string) => void run(() => setCaseUrgency(c.id, u, reason), 'Urgency updated and recorded.', setManageFeedback)}
            onFollowUp={(d) => void run(() => setFollowUp(c.id, d), d ? 'Follow-up date saved.' : 'Follow-up cleared.', setManageFeedback)}
          />
          <NotesPanel
            notes={detail.notes}
            canAct={canAct}
            authorName={nameFor}
            onAdd={(body) => run(() => addCaseNote(c.id, body, ctx.user.id), 'Note saved.', setManageFeedback)}
          />
          <ResourcesPanel
            resources={detail.resources}
            canAct={canAct}
            onAssign={(input) => run(() => assignCaseResource(c.id, input, ctx.user.id), 'Resource shared with the person.', setManageFeedback)}
          />
        </div>
      </div>
    </div>
  );
}

export default function StaffCasePage() {
  const { caseId = '' } = useParams();
  useDocumentTitle('Case');
  return (
    <StaffGate eyebrow="Staff · Imela" title="Anonymous case">
      {(ctx) => <CaseWorkspace ctx={ctx} caseId={caseId} />}
    </StaffGate>
  );
}
