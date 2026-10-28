import { useCallback, useEffect, useState } from 'react';
import { Link2, ShieldCheck, Stethoscope, UserPlus } from 'lucide-react';
import { linkPractitioner, listPractitioners, listStaff, setRole, type PractitionerRow, type StaffMember } from '../../domain/admin/api';
import { Alert, Chip, Spinner, TextField } from '../../components/ui/primitives';
import { Button } from '../../components/ui/Button';
import { useAdmin } from './useAdmin';
import { AdminPageHeader, MigrationNeeded } from './ui';

type Role = 'admin' | 'practitioner';
const ROLE_LABEL: Record<Role, string> = { admin: 'Administrator', practitioner: 'Counsellor' };

export default function TeamPage() {
  const { user, toast } = useAdmin();
  const [staff, setStaff] = useState<StaffMember[] | null>(null);
  const [practitioners, setPractitioners] = useState<PractitionerRow[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'error'>('loading');
  const [email, setEmail] = useState('');
  const [role, setRoleChoice] = useState<Role>('practitioner');
  const [busy, setBusy] = useState(false);
  const [linkFor, setLinkFor] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const [s, p] = await Promise.all([listStaff(), listPractitioners()]);
    if (!s.ok) return setState(s.reason === 'missing' ? 'missing' : 'error');
    setStaff(s.data);
    if (p.ok) setPractitioners(p.data);
    setState('ready');
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const change = async (targetEmail: string, r: Role, grant: boolean) => {
    if (!grant && !window.confirm(`Remove ${ROLE_LABEL[r].toLowerCase()} access from ${targetEmail}?`)) return;
    setBusy(true);
    const res = await setRole(targetEmail, r, grant);
    setBusy(false);
    if (!res.ok) return toast({ tone: 'danger', text: res.message ?? (res.reason === 'missing' ? 'Run the latest database update first.' : 'Could not change access.') });
    toast({ tone: 'success', text: grant ? `${targetEmail} is now a ${ROLE_LABEL[r].toLowerCase()}.` : `Removed ${ROLE_LABEL[r].toLowerCase()} access.` });
    await load();
  };

  const emailFor = (userId: string | null) => staff?.find((s) => s.user_id === userId)?.email ?? null;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Team & access" lede="Give people access to this console or the counsellor workspace. Everyone signs in with their own email and password." />
      {state === 'loading' && <Spinner label="Loading team…" />}
      {state === 'missing' && <MigrationNeeded what="Team management" />}
      {state === 'error' && <Alert tone="danger">Could not load the team.</Alert>}

      {state === 'ready' && staff && (
        <>
          <section aria-labelledby="invite-title" className="rounded-card bg-lavender-soft p-5 shadow-soft">
            <h2 id="invite-title" className="flex items-center gap-2 text-lg font-semibold text-ink-strong">
              <UserPlus className="h-5 w-5" aria-hidden /> Give someone access
            </h2>
            <p className="mt-1 text-sm text-ink">
              They first create an account on the <strong>/admin</strong> sign-in page (or you add them in Supabase under Authentication → Users), then you give them access here.
            </p>
            <form
              className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem_auto] sm:items-end"
              onSubmit={(e) => {
                e.preventDefault();
                if (!email.includes('@')) return toast({ tone: 'danger', text: 'Enter the email they signed up with.' });
                void change(email.trim(), role, true).then(() => setEmail(''));
              }}
            >
              <TextField label="Their email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <label className="text-sm">
                <span className="font-semibold text-ink-strong">Access</span>
                <select value={role} onChange={(e) => setRoleChoice(e.target.value as Role)} className="mt-1.5 w-full rounded-2xl border border-line/20 bg-paper px-4 py-2.5">
                  <option value="practitioner">Counsellor</option>
                  <option value="admin">Administrator</option>
                </select>
              </label>
              <Button type="submit" disabled={busy}>
                Give access
              </Button>
            </form>
            <ul className="mt-4 grid gap-2 text-xs text-ink sm:grid-cols-2">
              <li className="flex gap-2">
                <Stethoscope className="h-4 w-4 shrink-0 text-lavender-ink" aria-hidden />
                <span>
                  <strong>Counsellors</strong> answer anonymous cases at /staff/persona. They never see bookings, enquiries or settings.
                </span>
              </li>
              <li className="flex gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-lavender-ink" aria-hidden />
                <span>
                  <strong>Administrators</strong> can use everything in this console, including giving access to others.
                </span>
              </li>
            </ul>
          </section>

          <section aria-labelledby="staff-title" className="rounded-card bg-paper p-5 shadow-soft">
            <h2 id="staff-title" className="text-lg font-semibold text-ink-strong">
              People with access
            </h2>
            <ul className="mt-3 divide-y divide-line/10">
              {staff.length === 0 && <li className="py-6 text-sm text-ink-soft">Nobody yet.</li>}
              {staff.map((m) => (
                <li key={m.user_id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-butter font-semibold uppercase text-butter-ink">{m.email[0]}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-ink-strong">
                      {m.email}
                      {m.user_id === user.id && <span className="font-normal text-ink-soft"> (you)</span>}
                    </span>
                    <span className="mt-1 flex flex-wrap gap-1.5">
                      {m.roles.map((r) => (
                        <Chip key={r} tone={r === 'admin' ? 'ink' : 'lavender'}>
                          {ROLE_LABEL[r]}
                        </Chip>
                      ))}
                      {m.practitioner_id && <Chip tone="sage">Practitioner profile linked</Chip>}
                    </span>
                  </span>
                  <span className="flex flex-wrap gap-2">
                    {(['practitioner', 'admin'] as Role[]).map((r) =>
                      m.roles.includes(r) ? (
                        m.user_id === user.id && r === 'admin' ? null : (
                          <Button key={r} size="sm" variant="ghost" className="text-rose-ink" disabled={busy} onClick={() => void change(m.email, r, false)}>
                            Remove {ROLE_LABEL[r].toLowerCase()}
                          </Button>
                        )
                      ) : (
                        <Button key={r} size="sm" variant="outline" disabled={busy} onClick={() => void change(m.email, r, true)}>
                          Make {ROLE_LABEL[r].toLowerCase()}
                        </Button>
                      )
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="profiles-title" className="rounded-card bg-paper p-5 shadow-soft">
            <h2 id="profiles-title" className="flex items-center gap-2 text-lg font-semibold text-ink-strong">
              <Link2 className="h-5 w-5" aria-hidden /> Practitioner profiles
            </h2>
            <p className="mt-1 text-sm text-ink-soft">Link a practitioner on the website to their login, so bookings for them reach the right person.</p>
            <ul className="mt-3 divide-y divide-line/10">
              {practitioners.map((p) => {
                const linked = emailFor(p.user_id);
                return (
                  <li key={p.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-end">
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-ink-strong">{p.display_name}</span>
                      <span className="block text-xs text-ink-soft">{p.user_id ? `Linked to ${linked ?? 'an account'}` : 'Not linked to a login yet'}</span>
                    </span>
                    <form
                      className="flex gap-2"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const res = await linkPractitioner(p.id, linkFor[p.id] ?? '');
                        if (!res.ok) return toast({ tone: 'danger', text: res.message ?? 'Could not link the profile.' });
                        toast({ tone: 'success', text: `${p.display_name}'s profile is linked.` });
                        setLinkFor((x) => ({ ...x, [p.id]: '' }));
                        await load();
                      }}
                    >
                      <label className="sr-only" htmlFor={`link-${p.id}`}>
                        Login email for {p.display_name}
                      </label>
                      <input
                        id={`link-${p.id}`}
                        type="email"
                        placeholder="Their login email"
                        value={linkFor[p.id] ?? ''}
                        onChange={(e) => setLinkFor((x) => ({ ...x, [p.id]: e.target.value }))}
                        className="w-56 rounded-pill border border-line/20 bg-ivory px-4 py-2 text-sm"
                      />
                      <Button size="sm" type="submit" variant="outline" disabled={!linkFor[p.id]}>
                        Link
                      </Button>
                    </form>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
