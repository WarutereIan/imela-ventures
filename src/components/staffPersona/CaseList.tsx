import { Link } from 'react-router-dom';
import { useStaffBase } from './basePath';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import type { StaffCase } from '../../domain/personaPortal/types';
import { CaseStatusBadge, UrgencyBadge } from './badges';
import { concernLabels, formatDay, since, supportLabel } from './format';

/** Waiting = time since the person's last activity while no counsellor has replied since. */
function waiting(c: StaffCase): string {
  if (c.status === 'closed') return '—';
  const awaitingStaff = !c.last_staff_reply_at || new Date(c.last_persona_activity) > new Date(c.last_staff_reply_at);
  return awaitingStaff ? since(c.last_persona_activity) : 'Replied';
}

const isOpenCrisis = (c: StaffCase) => c.urgency === 'crisis_review' && c.status !== 'closed';

export function CaseList({ cases: input, counsellorName }: { cases: StaffCase[]; counsellorName: (id: string | null) => string }) {
  const base = useStaffBase();
  // Open crisis-review cases are always pinned to the top, whatever order the data arrives in.
  const cases = [...input.filter(isOpenCrisis), ...input.filter((c) => !isOpenCrisis(c))];
  const crisis = cases.filter(isOpenCrisis);

  return (
    <div className="space-y-4">
      {crisis.length > 0 && (
        <div role="alert" className="flex items-start gap-3 rounded-card border-2 border-rose bg-rose-soft p-4 text-rose-ink">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <p className="text-sm">
            <strong>Needs prompt human review:</strong> {crisis.length} case{crisis.length === 1 ? '' : 's'} flagged for possible risk. These are pinned at the top.
            The flag is an automated screen — a counsellor decides what happens next.
          </p>
        </div>
      )}

      {/* Phones & tablets: cards */}
      <ul className="grid gap-3 lg:hidden">
        {cases.map((c) => (
          <li key={c.id}>
            <Link
              to={`${base}/${c.id}`}
              className={`block rounded-card border bg-paper p-4 shadow-soft ${c.urgency === 'crisis_review' ? 'border-2 border-rose' : 'border-line/10'}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-sm font-semibold text-ink-strong">{c.persona_code}</span>
                <UrgencyBadge urgency={c.urgency} />
              </div>
              {c.urgency !== 'routine' && c.urgency_reason && <p className="mt-1 text-xs text-rose-ink">{c.urgency_reason}</p>}
              <p className="mt-2 text-sm text-ink">{concernLabels(c.concerns)}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
                <CaseStatusBadge status={c.status} />
                <span>Queue: {c.queue}</span>
                <span>· Waiting {waiting(c)}</span>
                <span>· {counsellorName(c.assigned_to)}</span>
                {c.follow_up_on && <span>· Follow up {formatDay(c.follow_up_on)}</span>}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* Desktop: table */}
      <div className="hidden overflow-hidden rounded-card border border-line/10 bg-paper shadow-soft lg:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Anonymous counselling cases</caption>
          <thead className="bg-ink-strong text-ivory">
            <tr>
              {['Persona ID', 'Concerns', 'Prefers', 'Queue', 'Urgency', 'Status', 'Waiting', 'Counsellor', 'Follow-up', ''].map((h, i) => (
                <th key={h || i} scope="col" className="px-3 py-3 font-semibold first:pl-5 last:pr-5">
                  {h || <span className="sr-only">Open</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr key={c.id} className={`border-t border-line/10 align-top ${c.urgency === 'crisis_review' && c.status !== 'closed' ? 'bg-rose-soft/50' : ''}`}>
                <th scope="row" className="whitespace-nowrap py-3 pl-5 pr-3 font-mono font-semibold text-ink-strong">
                  {c.persona_code}
                </th>
                <td className="max-w-[14rem] px-3 py-3">{concernLabels(c.concerns)}</td>
                <td className="max-w-[10rem] px-3 py-3 text-ink-soft">{supportLabel(c.preferred_support)}</td>
                <td className="px-3 py-3">{c.queue}</td>
                <td className="px-3 py-3">
                  <UrgencyBadge urgency={c.urgency} />
                  {c.urgency !== 'routine' && c.urgency_reason && <p className="mt-1 max-w-[14rem] text-xs text-rose-ink">{c.urgency_reason}</p>}
                </td>
                <td className="px-3 py-3">
                  <CaseStatusBadge status={c.status} />
                </td>
                <td className="whitespace-nowrap px-3 py-3">{waiting(c)}</td>
                <td className="px-3 py-3">{counsellorName(c.assigned_to)}</td>
                <td className="whitespace-nowrap px-3 py-3">{formatDay(c.follow_up_on)}</td>
                <td className="py-3 pl-3 pr-5 text-right">
                  <Link to={`${base}/${c.id}`} className="inline-flex items-center gap-1 font-semibold text-lavender-ink hover:underline" aria-label={`Open case ${c.persona_code}`}>
                    Open <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
