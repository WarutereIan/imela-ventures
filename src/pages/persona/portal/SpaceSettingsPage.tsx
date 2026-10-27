import { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Trash2 } from 'lucide-react';
import { PortalShell, type PortalSession } from '../../../components/personaPortal/PortalShell';
import { CredentialCard } from '../../../components/personaPortal/shared';
import { deletePersona, rotateRecoverySecret } from '../../../domain/personaPortal/api';
import { Alert } from '../../../components/ui/primitives';
import { Button, buttonClasses } from '../../../components/ui/Button';
import Companion from '../../../components/characters/Companion';
import { useDocumentTitle } from '../../../lib/useDocumentTitle';

type Outcome = { kind: 'rotated'; personaCode: string; secret: string } | { kind: 'deleted' } | null;

function Settings({ session, onOutcome }: { session: PortalSession; onOutcome: (o: Outcome) => void }) {
  const [rotating, setRotating] = useState<'idle' | 'confirm' | 'busy'>('idle');
  const [rotateError, setRotateError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-display-md">Settings</h1>

      <section aria-labelledby="id-title" className="rounded-card bg-paper p-5 shadow-soft sm:p-6">
        <h2 id="id-title" className="font-semibold text-ink-strong">
          Your Persona ID
        </h2>
        <p className="mt-1 text-sm text-ink-soft">Your ID isn't secret on its own — it only works together with your recovery secret.</p>
        <div className="mt-4">
          <CredentialCard personaCode={session.personaCode} />
        </div>
      </section>

      <section aria-labelledby="rotate-title" className="rounded-card bg-paper p-5 shadow-soft sm:p-6">
        <h2 id="rotate-title" className="flex items-center gap-2 font-semibold text-ink-strong">
          <KeyRound className="h-4 w-4" aria-hidden /> Get a new recovery secret
        </h2>
        <p className="mt-1 text-sm text-ink">
          If you think someone else may have seen your recovery secret, replace it. Your old secret stops working, and you'll be signed out everywhere.
        </p>
        {rotateError && (
          <Alert tone="danger" className="mt-3" live>
            {rotateError}
          </Alert>
        )}
        {rotating === 'idle' ? (
          <Button size="sm" variant="outline" className="mt-4" onClick={() => setRotating('confirm')}>
            Replace my recovery secret
          </Button>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={rotating === 'busy'}
              onClick={async () => {
                setRotating('busy');
                setRotateError(null);
                const res = await rotateRecoverySecret();
                if (!res.ok) {
                  setRotating('idle');
                  setRotateError('We could not replace your secret. Your current secret still works — please try again.');
                  return;
                }
                onOutcome({ kind: 'rotated', personaCode: session.personaCode, secret: res.data.recoverySecret });
              }}
            >
              {rotating === 'busy' ? 'Replacing…' : 'Yes, give me a new secret'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setRotating('idle')} disabled={rotating === 'busy'}>
              Cancel
            </Button>
          </div>
        )}
      </section>

      <section aria-labelledby="delete-title" className="rounded-card border-2 border-rose/30 bg-rose-soft/40 p-5 sm:p-6">
        <h2 id="delete-title" className="flex items-center gap-2 font-semibold text-ink-strong">
          <Trash2 className="h-4 w-4" aria-hidden /> Delete my Persona permanently
        </h2>
        <p className="mt-1 text-sm text-ink">
          This deletes your Persona ID and every conversation, message and resource linked to it. It can't be undone. A minimal record that a case existed may
          remain in Imela's access log (no messages or personal content). Otherwise, closed conversations are deleted automatically after the retention period.
        </p>
        <label htmlFor="delete-confirm" className="mt-4 block text-sm font-semibold text-ink-strong">
          Type DELETE to confirm
        </label>
        <input
          id="delete-confirm"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          autoComplete="off"
          className="mt-1.5 block w-48 rounded-2xl border border-line/20 bg-paper px-4 py-2.5 font-mono uppercase focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/30"
        />
        {deleteError && (
          <Alert tone="danger" className="mt-3" live>
            {deleteError}
          </Alert>
        )}
        <Button
          size="sm"
          variant="danger"
          className="mt-4"
          disabled={confirmText.trim().toUpperCase() !== 'DELETE' || deleting}
          onClick={async () => {
            setDeleting(true);
            setDeleteError(null);
            const res = await deletePersona();
            setDeleting(false);
            if (!res.ok) {
              setDeleteError('We could not delete your Persona. Nothing has been removed — please try again.');
              return;
            }
            onOutcome({ kind: 'deleted' });
          }}
        >
          {deleting ? 'Deleting…' : 'Delete everything'}
        </Button>
      </section>
    </div>
  );
}

export default function SpaceSettingsPage() {
  useDocumentTitle('Settings');
  // Kept outside the shell: after rotating or deleting, the session has ended.
  const [outcome, setOutcome] = useState<Outcome>(null);

  if (outcome?.kind === 'rotated') {
    return (
      <div className="shell max-w-2xl py-10">
        <h1 className="font-display text-display-md">Your new recovery secret</h1>
        <Alert tone="warning" className="mt-4" title="Save it now — this is the only time it's shown">
          Your old secret no longer works, and you've been signed out on every device. Sign in again with your Persona ID and this new secret.
        </Alert>
        <div className="mt-5">
          <CredentialCard personaCode={outcome.personaCode} recoverySecret={outcome.secret} />
        </div>
        <Link to="/persona/access" className={buttonClasses('primary', 'md', 'mt-6')}>
          Sign in with my new secret
        </Link>
      </div>
    );
  }

  if (outcome?.kind === 'deleted') {
    return (
      <div className="shell max-w-xl py-16 text-center">
        <div className="flex justify-center">
          <Companion variant="drift" mood="calm" pose="wave" tone="sage" size={120} />
        </div>
        <h1 className="mt-4 font-display text-display-md">Your Persona has been deleted</h1>
        <p className="mt-3 text-ink-soft">Everything linked to it has been removed. Thank you for trusting Imela. You're welcome back any time.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/persona" className={buttonClasses('primary')}>
            Imela Persona
          </Link>
          <Link to="/" className={buttonClasses('ghost')}>
            Home
          </Link>
        </div>
      </div>
    );
  }

  return <PortalShell>{(session) => <Settings session={session} onOutcome={setOutcome} />}</PortalShell>;
}
