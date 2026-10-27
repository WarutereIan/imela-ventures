import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, EyeOff, Receipt } from 'lucide-react';
import { config } from '../../lib/config';
import { supabase } from '../../lib/supabase';
import { useAuth, useRoles } from '../../lib/auth';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import { AccessDenied, SetupPending, SignInPanel, WorkspaceShell } from '../../components/workspace/WorkspaceStates';
import { useAsync, unwrap } from '../../components/workspace/useAsync';
import { Button, buttonClasses } from '../../components/ui/Button';
import { Alert, Card, Chip, EmptyState, SelectField, Spinner } from '../../components/ui/primitives';
import Companion from '../../components/characters/Companion';

interface Membership {
  org_id: string;
  // PostgREST embeds a many-to-one relation as an object; older clients type it as an array.
  organisations: { name: string } | { name: string }[] | null;
}

function orgName(m: Membership | undefined): string | undefined {
  const o = m?.organisations;
  return Array.isArray(o) ? o[0]?.name : o?.name;
}
interface Programme {
  id: string;
  name: string;
  description: string | null;
  status: 'proposed' | 'active' | 'completed' | 'paused';
  starts_on: string | null;
  ends_on: string | null;
}
interface ProgrammeEvent {
  id: string;
  programme_id: string;
  title: string;
  kind: string;
  scheduled_at: string | null;
  capacity: number | null;
  attendee_count: number | null;
}
interface UtilisationRow {
  month: string;
  sessions_count: number | null;
  suppressed: boolean;
}

const PROGRAMME_TONE = { proposed: 'butter', active: 'sage', completed: 'neutral', paused: 'clay' } as const;

function monthLabel(iso: string) {
  const [y, m] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-GB', { timeZone: 'UTC', month: 'short', year: 'numeric' });
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function OrgDashboard({ orgId }: { orgId: string }) {
  const programmes = useAsync<Programme[]>(
    async () => unwrap(await supabase.from('corporate_programmes').select('id,name,description,status,starts_on,ends_on').eq('org_id', orgId).order('starts_on', { ascending: false })),
    [orgId]
  );
  const programmeIds = (programmes.data ?? []).map((p) => p.id);
  const events = useAsync<ProgrammeEvent[]>(
    programmeIds.length
      ? async () =>
          unwrap(
            await supabase
              .from('programme_events')
              .select('id,programme_id,title,kind,scheduled_at,capacity,attendee_count')
              .in('programme_id', programmeIds)
              .order('scheduled_at', { ascending: true })
          )
      : null,
    [programmeIds.join(',')]
  );
  const utilisation = useAsync<UtilisationRow[]>(async () => {
    const to = new Date();
    const from = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth() - 11, 1));
    return unwrap(await supabase.rpc('org_utilisation_summary', { p_org: orgId, p_from: isoDate(from), p_to: isoDate(to) }));
  }, [orgId]);

  const now = Date.now();
  const upcoming = (events.data ?? []).filter((e) => e.scheduled_at && new Date(e.scheduled_at).getTime() >= now);
  const maxCount = Math.max(1, ...(utilisation.data ?? []).map((r) => r.sessions_count ?? 0));

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-8">
        <Card className="p-6">
          <h2 className="font-display text-display-sm">Programmes</h2>
          {programmes.loading && <Spinner className="mt-4" />}
          {programmes.error && <Alert tone="danger" className="mt-4">{programmes.error}</Alert>}
          {programmes.data && programmes.data.length === 0 && <p className="mt-4 text-ink-soft">No programmes yet. Your Imela contact will add them here once agreed.</p>}
          <ul className="mt-4 divide-y divide-line/10">
            {(programmes.data ?? []).map((p) => (
              <li key={p.id} className="py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{p.name}</h3>
                  <Chip tone={PROGRAMME_TONE[p.status]}>{p.status}</Chip>
                </div>
                {p.description && <p className="mt-1 text-sm text-ink-soft">{p.description}</p>}
                {(p.starts_on || p.ends_on) && (
                  <p className="mt-1 text-xs text-ink-soft">
                    {p.starts_on ?? '…'} → {p.ends_on ?? 'ongoing'}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-display-sm">Monthly participation</h2>
          <p className="mt-1 text-sm text-ink-soft">Confirmed and completed counselling sessions sponsored by your organisation, over the last 12 months.</p>
          {utilisation.loading && <Spinner className="mt-4" />}
          {utilisation.error && <Alert tone="danger" className="mt-4">{utilisation.error}</Alert>}
          {utilisation.data && (
            <table className="mt-5 w-full text-sm">
              <caption className="sr-only">Sessions per month. Months with fewer than five sessions are hidden to protect privacy.</caption>
              <thead className="sr-only">
                <tr>
                  <th scope="col">Month</th>
                  <th scope="col">Sessions</th>
                </tr>
              </thead>
              <tbody>
                {utilisation.data.map((r) => (
                  <tr key={r.month}>
                    <th scope="row" className="w-24 py-1.5 pr-3 text-left font-medium text-ink-soft">
                      {monthLabel(r.month)}
                    </th>
                    <td className="py-1.5">
                      {r.suppressed ? (
                        <span className="text-xs italic text-ink-soft">Fewer than 5 — hidden to protect privacy</span>
                      ) : (
                        <span className="flex items-center gap-3">
                          <span className="h-3 rounded-pill bg-lavender-ink/80" style={{ width: `${Math.max(2, ((r.sessions_count ?? 0) / maxCount) * 100)}%` }} aria-hidden />
                          <span className="tabular-nums">{r.sessions_count ?? 0}</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <div className="space-y-8">
        <Card className="p-6">
          <h2 className="flex items-center gap-2 font-display text-display-sm">
            <CalendarDays className="h-5 w-5" aria-hidden /> Upcoming workshops
          </h2>
          {events.loading && <Spinner className="mt-4" />}
          {events.error && <Alert tone="danger" className="mt-4">{events.error}</Alert>}
          {!events.loading && upcoming.length === 0 && <p className="mt-4 text-sm text-ink-soft">Nothing scheduled yet.</p>}
          <ul className="mt-4 space-y-3">
            {upcoming.map((e) => (
              <li key={e.id} className="rounded-2xl bg-ivory p-4">
                <p className="font-semibold">{e.title}</p>
                <p className="text-xs text-ink-soft">
                  {e.kind} · {e.scheduled_at ? new Date(e.scheduled_at).toLocaleString('en-GB', { timeZone: 'Africa/Nairobi', dateStyle: 'medium', timeStyle: 'short' }) : 'Date to be confirmed'}
                </p>
                {e.attendee_count != null && (
                  <p className="mt-1 text-xs text-ink-soft">
                    {e.attendee_count}
                    {e.capacity ? ` of ${e.capacity}` : ''} places taken
                  </p>
                )}
              </li>
            ))}
          </ul>
        </Card>

        <div className="rounded-card bg-ink-strong p-6 text-ivory">
          <EyeOff className="h-6 w-6 text-lime" aria-hidden />
          <h2 className="mt-3 text-lg font-semibold text-ivory">What you can and can’t see</h2>
          <ul className="mt-3 space-y-2 text-sm text-ivory/80">
            <li>You see programme details, event attendance counts and monthly totals.</li>
            <li>You never see who attended counselling, what was discussed, notes or any diagnoses.</li>
            <li>Any month with fewer than five sessions is hidden so no one can be identified.</li>
            <li>There is no export of individual-level data.</li>
          </ul>
        </div>

        <Card className="flex gap-3 p-6">
          <Receipt className="mt-0.5 h-5 w-5 shrink-0 text-ink-soft" aria-hidden />
          <p className="text-sm text-ink-soft">Invoices are managed with your Imela contact. For billing questions, please get in touch with them directly.</p>
        </Card>
      </div>
    </div>
  );
}

export default function OrgWorkspacePage() {
  useDocumentTitle('Organisation workspace');
  const auth = useAuth();
  const { roles, loading: rolesLoading, error: rolesError } = useRoles(auth.user);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);

  const memberships = useAsync<Membership[]>(
    config.platformDbReady && auth.user && roles.includes('org_admin')
      ? async () =>
          unwrap(await supabase.from('organisation_members').select('org_id, organisations(name)').eq('user_id', auth.user!.id).eq('role', 'org_admin'))
      : null,
    [auth.user?.id, roles.join(',')]
  );

  if (!config.platformDbReady) {
    return (
      <SetupPending title="Organisation workspace">
        <p>
          When it opens, organisation administrators will be able to follow their programmes, workshops and anonymised
          participation — never individual counselling information.
        </p>
      </SetupPending>
    );
  }

  if (auth.loading) return <div className="shell grid min-h-[40vh] place-items-center"><Spinner /></div>;

  if (!auth.user) {
    return (
      <WorkspaceShell eyebrow="For organisations" title="Organisation workspace" lede="For HR and programme leads at organisations working with Imela.">
        <SignInPanel auth={auth} heading="Sign in to your workspace" intro={<p>Your Imela contact sets up workspace access for your organisation.</p>} />
      </WorkspaceShell>
    );
  }

  const orgs = memberships.data ?? [];
  const activeOrg = selectedOrg ?? orgs[0]?.org_id ?? null;
  const activeName = orgName(orgs.find((o) => o.org_id === activeOrg));

  return (
    <WorkspaceShell
      eyebrow="Organisation workspace"
      title={activeName ?? 'Your organisation'}
      lede="Programme-level information only. Individual counselling stays confidential."
      actions={
        <>
          <Link to="/organisations#enquire" className={buttonClasses('outline', 'sm')}>
            Request a new programme
          </Link>
          <Button variant="ghost" size="sm" onClick={auth.signOut}>
            Sign out
          </Button>
        </>
      }
    >
      {rolesLoading ? (
        <Spinner />
      ) : rolesError ? (
        <Alert tone="danger">{rolesError}</Alert>
      ) : !roles.includes('org_admin') ? (
        <AccessDenied what="organisation administrators" onSignOut={auth.signOut} />
      ) : memberships.loading ? (
        <Spinner />
      ) : memberships.error ? (
        <Alert tone="danger">{memberships.error}</Alert>
      ) : orgs.length === 0 ? (
        <EmptyState title="No organisation linked yet" art={<Companion variant="cloud" mood="curious" tone="sky" size={110} />}>
          Your account isn’t linked to an organisation yet. Please ask your Imela contact to connect it.
        </EmptyState>
      ) : (
        <>
          {orgs.length > 1 && (
            <div className="mb-8 max-w-sm">
              <SelectField label="Organisation" value={activeOrg ?? ''} onChange={(e) => setSelectedOrg(e.target.value)}>
                {orgs.map((o) => (
                  <option key={o.org_id} value={o.org_id}>
                    {orgName(o) ?? 'Organisation'}
                  </option>
                ))}
              </SelectField>
            </div>
          )}
          {activeOrg && <OrgDashboard orgId={activeOrg} />}
        </>
      )}
    </WorkspaceShell>
  );
}
