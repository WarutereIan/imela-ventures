import React from 'react';
import type { User } from '@supabase/supabase-js';
import { useAuth, useRoles } from '../../lib/auth';
import { config } from '../../lib/config';
import { Button } from '../ui/Button';
import { Alert, Spinner } from '../ui/primitives';
import { AccessDenied, SetupPending, SignInPanel, WorkspaceShell } from '../workspace/WorkspaceStates';

export interface StaffContext {
  user: User;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}


/**
 * Sign-in, role check and setup gate for the staff Persona pages.
 *
 * Gating here is a convenience so people see the right screen. It is NOT the
 * access control: row-level security and the audited staff_* database
 * functions decide what each account can read or change.
 */
export function StaffGate({
  eyebrow,
  title,
  lede,
  requireAdmin = false,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  lede?: React.ReactNode;
  requireAdmin?: boolean;
  actions?: (ctx: StaffContext) => React.ReactNode;
  children: (ctx: StaffContext) => React.ReactNode;
}) {
  const auth = useAuth();
  const { roles, loading: rolesLoading, error: rolesError, dbReady } = useRoles(auth.user);
  // The staff Persona tools need the portal switched on and the platform migrations applied (detected at runtime).
  const staffPersonaReady = config.personaPortalEnabled && (dbReady || rolesLoading || !auth.user);

  if (!staffPersonaReady) {
    return (
      <SetupPending title="Anonymous counselling — staff workspace">
        <p>
          Counsellors will see anonymous cases identified only by a Persona ID, reply privately, keep internal notes and track follow-ups. Every
          access is recorded in an audit log.
        </p>
      </SetupPending>
    );
  }
  if (auth.loading) {
    return (
      <div className="shell grid min-h-[40vh] place-items-center">
        <Spinner />
      </div>
    );
  }
  if (!auth.user) {
    return (
      <WorkspaceShell eyebrow={eyebrow} title={title}>
        <SignInPanel auth={auth} heading="Staff sign in" intro={<p>For Imela counsellors and administrators. Access is set up by an administrator.</p>} />
      </WorkspaceShell>
    );
  }

  const isAdmin = roles.includes('admin');
  const allowed = requireAdmin ? isAdmin : isAdmin || roles.includes('practitioner');
  const ctx: StaffContext = { user: auth.user, isAdmin, signOut: auth.signOut };

  return (
    <WorkspaceShell
      eyebrow={eyebrow}
      title={title}
      lede={lede}
      actions={
        <>
          {allowed && actions?.(ctx)}
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
      ) : allowed ? (
        children(ctx)
      ) : (
        <AccessDenied what={requireAdmin ? 'Imela administrators' : 'Imela counsellors and administrators'} onSignOut={auth.signOut} />
      )}
    </WorkspaceShell>
  );
}
