import { useCallback } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { signOutPersona, usePersonaSession, portalAvailable } from '../../domain/personaPortal/api';
import { useIdleSignOut, IDLE_MINUTES } from '../../domain/personaPortal/useIdleSignOut';
import { QuickExit } from '../layout/UrgentHelp';
import { Button, buttonClasses } from '../ui/Button';
import { Spinner } from '../ui/primitives';
import Companion from '../characters/Companion';
import { cn } from '../../lib/cn';

export interface PortalSession {
  personaCode: string;
  userId: string;
}

/**
 * Frame for every signed-in Persona screen: session guard, Persona ID,
 * navigation, sign-out, quick exit and the inactivity sign-out.
 */
export function PortalShell({ children }: { children: (session: PortalSession) => React.ReactNode }) {
  const session = usePersonaSession();
  const navigate = useNavigate();
  const signedIn = session.status === 'signed_in';

  const onIdle = useCallback(async () => {
    await signOutPersona();
    navigate('/persona/access?reason=idle', { replace: true });
  }, [navigate]);
  useIdleSignOut(signedIn, onIdle);

  if (!portalAvailable) {
    return (
      <div className="shell py-16 text-center">
        <h1 className="font-display text-display-md">Your Persona space</h1>
        <p className="mt-3 text-ink-soft">Anonymous counselling isn't switched on yet.</p>
        <Link to="/persona" className={buttonClasses('primary', 'md', 'mt-4')}>
          Back to Imela Persona
        </Link>
      </div>
    );
  }

  if (session.status === 'loading') {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Spinner label="Opening your space…" />
      </div>
    );
  }

  if (session.status === 'signed_out') {
    return (
      <div className="shell grid min-h-[60vh] place-items-center py-12">
        <div className="max-w-md text-center">
          <div className="flex justify-center">
            <Companion variant="drift" mood="calm" pose="idle" tone="sage" size={110} />
          </div>
          <h1 className="mt-4 font-display text-display-sm">Please sign in to your space</h1>
          <p className="mt-2 text-ink-soft">For your privacy you need your Persona ID and recovery secret each time you return.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/persona/access" className={buttonClasses('primary')}>
              Sign in with my Persona ID
            </Link>
            <Link to="/persona/start" className={buttonClasses('ghost')}>
              Get a Persona ID
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const nav = cn('rounded-pill px-3.5 py-2 text-sm font-semibold transition-colors');
  return (
    <div className="shell py-6 sm:py-8">
      <div className="flex flex-col gap-4 rounded-card bg-paper p-4 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">Your Persona ID</p>
          <p className="font-mono text-lg font-bold tracking-wider text-ink-strong">{session.personaCode}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <QuickExit />
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              await signOutPersona();
              navigate('/persona', { replace: true });
            }}
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden /> Sign out
          </Button>
        </div>
      </div>
      <nav aria-label="Your space" className="scrollbar-hide -mx-1 mt-4 flex gap-1 overflow-x-auto px-1">
        {[
          { to: '/persona/space', label: 'Conversations', end: true },
          { to: '/persona/space/resources', label: 'Resources' },
          { to: '/persona/space/settings', label: 'Settings' },
        ].map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => cn(nav, 'shrink-0', isActive ? 'bg-ink-strong text-ivory' : 'text-ink hover:bg-ink/5')}>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-6">{children({ personaCode: session.personaCode, userId: session.userId })}</div>
      <p className="mt-10 text-center text-xs text-ink-soft">For your privacy you'll be signed out after {IDLE_MINUTES} minutes without activity.</p>
    </div>
  );
}
