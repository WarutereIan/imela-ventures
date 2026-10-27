import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { StaffGate, type StaffContext } from '../../components/staffPersona/StaffGate';
import { CaseList } from '../../components/staffPersona/CaseList';
import { useCounsellors } from '../../components/staffPersona/useCounsellors';
import { listStaffCases, type CaseFilters } from '../../domain/personaPortal/staffApi';
import { STATUS_LABEL, URGENCY_LABEL, type CaseStatus, type StaffCase, type Urgency } from '../../domain/personaPortal/types';
import { Alert, EmptyState, Spinner } from '../../components/ui/primitives';
import { Button, buttonClasses } from '../../components/ui/Button';
import Companion from '../../components/characters/Companion';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import { cn } from '../../lib/cn';

type Scope = CaseFilters['scope'];
const POLL_MS = 60_000;

function CasesDashboard({ ctx }: { ctx: StaffContext }) {
  const [scope, setScope] = useState<Scope>('queue');
  const [status, setStatus] = useState<CaseStatus | 'open' | ''>('open');
  const [urgency, setUrgency] = useState<Urgency | ''>('');
  const [cases, setCases] = useState<StaffCase[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const { nameFor } = useCounsellors(ctx.user.id);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await listStaffCases({ scope, status: status || undefined, urgency: urgency || undefined, userId: ctx.user.id });
    setLoading(false);
    if (res.ok) {
      setCases(res.data);
      setError(null);
      setUpdatedAt(new Date());
    } else {
      setError(res.reason === 'forbidden' ? "You don't have permission to see these cases." : 'We couldn’t load cases right now.');
    }
  }, [scope, status, urgency, ctx.user.id]);

  useEffect(() => {
    void load();
  }, [load]);

  // Refresh every minute while this tab is visible.
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load();
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, [load]);

  const tabs: { id: Scope; label: string }[] = [
    { id: 'queue', label: 'Queue (unassigned)' },
    { id: 'mine', label: 'My cases' },
    ...(ctx.isAdmin ? [{ id: 'all' as const, label: 'All cases' }] : []),
  ];

  return (
    <div className="space-y-6">
      <p className="flex items-start gap-2 rounded-2xl bg-sage/60 px-4 py-3 text-sm text-sage-ink">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        Cases are identified only by Persona ID. There are no names, emails or phone numbers here — please never ask people for them as a condition of
        support.
      </p>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div role="tablist" aria-label="Case views" className="flex flex-wrap gap-1 rounded-pill bg-paper p-1 shadow-soft">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={scope === t.id}
              onClick={() => setScope(t.id)}
              className={cn('rounded-pill px-4 py-2 text-sm font-semibold', scope === t.id ? 'bg-ink-strong text-ivory' : 'text-ink hover:bg-ink/5')}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-3 text-sm">
          <label className="flex flex-col gap-1">
            <span className="font-semibold text-ink-strong">Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value as CaseStatus | 'open' | '')} className="rounded-pill border border-line/20 bg-paper px-3 py-2">
              <option value="open">Open (not closed)</option>
              <option value="">All statuses</option>
              {(Object.keys(STATUS_LABEL) as CaseStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold text-ink-strong">Urgency</span>
            <select value={urgency} onChange={(e) => setUrgency(e.target.value as Urgency | '')} className="rounded-pill border border-line/20 bg-paper px-3 py-2">
              <option value="">Any</option>
              {(Object.keys(URGENCY_LABEL) as Urgency[]).map((u) => (
                <option key={u} value={u}>
                  {URGENCY_LABEL[u]}
                </option>
              ))}
            </select>
          </label>
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} aria-hidden /> Refresh
          </Button>
        </div>
      </div>

      <p className="text-xs text-ink-soft" aria-live="polite">
        {updatedAt ? `Updated ${updatedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · refreshes every minute` : ''}
      </p>

      {error && <Alert tone="danger">{error}</Alert>}
      {!cases && loading && <Spinner label="Loading cases…" />}
      {cases && cases.length === 0 && (
        <EmptyState title={scope === 'queue' ? 'The queue is clear.' : 'No cases match these filters.'} art={<Companion variant="drift" mood="calm" tone="sage" size={90} />}>
          {scope === 'queue' ? 'New anonymous cases will appear here for review.' : 'Try a different view or filter.'}
        </EmptyState>
      )}
      {cases && cases.length > 0 && <CaseList cases={cases} counsellorName={nameFor} />}
    </div>
  );
}

export default function StaffCasesPage() {
  useDocumentTitle('Anonymous counselling cases');
  return (
    <StaffGate
      eyebrow="Staff · Imela"
      title="Anonymous counselling cases"
      lede="Review, pick up and respond to cases from the anonymous portal. Crisis-review cases are pinned at the top."
      actions={(ctx) =>
        ctx.isAdmin ? (
          <Link to="/staff/persona/admin" className={buttonClasses('soft', 'sm')}>
            Settings & audit
          </Link>
        ) : null
      }
    >
      {(ctx) => <CasesDashboard ctx={ctx} />}
    </StaffGate>
  );
}
