import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PortalShell } from '../../../components/personaPortal/PortalShell';
import { listCaseResources, listMyCases } from '../../../domain/personaPortal/api';
import { CONCERN_LABEL, type CaseResource } from '../../../domain/personaPortal/types';
import { Alert, EmptyState, Spinner } from '../../../components/ui/primitives';
import { buttonClasses } from '../../../components/ui/Button';
import { useDocumentTitle } from '../../../lib/useDocumentTitle';
import { ResourceLink } from '../../../components/personaPortal/ResourceLink';

type Group = { caseId: string; label: string; resources: CaseResource[] };

function Resources() {
  const [state, setState] = useState<{ status: 'loading' } | { status: 'error' } | { status: 'ready'; groups: Group[] }>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cases = await listMyCases();
      if (!cases.ok) {
        if (!cancelled) setState({ status: 'error' });
        return;
      }
      const results = await Promise.all(cases.data.map((c) => listCaseResources(c.id)));
      if (cancelled) return;
      if (results.some((r) => !r.ok)) {
        setState({ status: 'error' });
        return;
      }
      const groups = cases.data
        .map((c, i) => ({
          caseId: c.id,
          label: c.concerns.map((x) => CONCERN_LABEL[x] ?? x).join(' · '),
          resources: (results[i] as { ok: true; data: CaseResource[] }).data,
        }))
        .filter((g) => g.resources.length > 0);
      setState({ status: 'ready', groups });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section aria-labelledby="resources-title">
      <h1 id="resources-title" className="font-display text-display-md">
        Your resources
      </h1>
      <p className="mt-2 text-ink-soft">Reading and exercises your counsellor has shared with you.</p>
      <div className="mt-6" aria-live="polite">
        {state.status === 'loading' && <Spinner label="Loading your resources…" />}
        {state.status === 'error' && <Alert tone="danger">We couldn't load your resources. Please check your connection and try again.</Alert>}
        {state.status === 'ready' && state.groups.length === 0 && (
          <EmptyState title="Nothing shared with you yet">When a counsellor shares something with you, it will appear here.</EmptyState>
        )}
        {state.status === 'ready' &&
          state.groups.map((g) => (
            <div key={g.caseId} className="mb-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink">
                <Link to={`/persona/space/${g.caseId}`} className="hover:underline">
                  {g.label}
                </Link>
              </h2>
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                {g.resources.map((r) => (
                  <li key={r.id}>
                    <ResourceLink resource={r} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>
      <div className="mt-8 rounded-card bg-lavender-soft p-5">
        <p className="font-semibold text-ink-strong">Explore the open library</p>
        <p className="mt-1 text-sm text-ink">Gentle reading on grief, relationships, anxiety, stress and more — available to everyone.</p>
        <Link to="/resources" className={buttonClasses('primary', 'sm', 'mt-3')}>
          Browse resources
        </Link>
      </div>
    </section>
  );
}

export default function SpaceResourcesPage() {
  useDocumentTitle('Your resources');
  return <PortalShell>{() => <Resources />}</PortalShell>;
}
