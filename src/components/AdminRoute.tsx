import React from 'react';
import { Link } from 'react-router-dom';
import { isSupabaseConfigured } from '../lib/supabase';
import { config } from '../lib/config';
import { useAuth, useRoles } from '../lib/auth';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { AccessDenied, SignInPanel } from './workspace/WorkspaceStates';
import { Alert, Spinner } from './ui/primitives';
import AdminDashboard from './AdminDashboard';

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory">
      <header className="shell flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2" aria-label="Imela Ventures — back to website">
          <img src="/logo-transparent.png" alt="" className="h-12 w-auto" />
        </Link>
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">Admin</span>
      </header>
      <main className="shell grid min-h-[70vh] place-items-center py-10">{children}</main>
    </div>
  );
}

/**
 * Admin entry point. Once the platform migrations are applied, only accounts
 * holding the `admin` role get through. The database enforces the same rule
 * with row-level security; this check simply avoids showing an empty dashboard.
 */
const AdminRoute: React.FC = () => {
  useDocumentTitle('Admin');
  const auth = useAuth();
  const { roles, loading: rolesLoading, error: rolesError } = useRoles(auth.user);

  if (auth.loading || (auth.user && rolesLoading)) {
    return (
      <Frame>
        <Spinner label="Checking your session…" />
      </Frame>
    );
  }

  if (!auth.user) {
    return (
      <Frame>
        <div className="w-full max-w-md space-y-4">
          {!isSupabaseConfigured && (
            <Alert tone="danger" title="Supabase is not configured">
              Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.
            </Alert>
          )}
          <SignInPanel
            auth={auth}
            heading="Admin sign in"
            headingLevel="h1"
            intro={<p>Manage articles, bookings, enquiries and notification settings.</p>}
          />
        </div>
      </Frame>
    );
  }

  if (config.platformDbReady) {
    if (rolesError) {
      return (
        <Frame>
          <Alert tone="danger" title="We couldn’t verify your access">
            {rolesError}
          </Alert>
        </Frame>
      );
    }
    if (!roles.includes('admin')) {
      return (
        <Frame>
          <AccessDenied what="Imela administrators" onSignOut={auth.signOut} />
        </Frame>
      );
    }
  }

  return <AdminDashboard onLogout={auth.signOut} userEmail={auth.user.email ?? ''} />;
};

export default AdminRoute;
