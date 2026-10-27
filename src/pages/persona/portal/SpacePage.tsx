import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, RefreshCw } from 'lucide-react';
import { PortalShell } from '../../../components/personaPortal/PortalShell';
import { CaseStatusChip } from '../../../components/personaPortal/shared';
import { formatWhen } from '../../../components/personaPortal/text';
import { ConcernStep, StoryStep } from '../../../components/personaPortal/ConversationSteps';
import { createCaseErrorMessage } from '../../../components/personaPortal/text';
import { createCase, listMyCases } from '../../../domain/personaPortal/api';
import { CONCERN_LABEL, type MyCase, type PortalConcern, type PreferredSupport } from '../../../domain/personaPortal/types';
import { Alert, EmptyState, Spinner } from '../../../components/ui/primitives';
import { Button } from '../../../components/ui/Button';
import Companion from '../../../components/characters/Companion';
import { useDocumentTitle } from '../../../lib/useDocumentTitle';
import { cn } from '../../../lib/cn';

function NewConversation({ onCancel }: { onCancel: () => void }) {
  const navigate = useNavigate();
  const [step, setStep] = useState<'concerns' | 'story'>('concerns');
  const [concerns, setConcerns] = useState<PortalConcern[]>([]);
  const [story, setStory] = useState('');
  const [support, setSupport] = useState<PreferredSupport>('not_sure');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setError(null);
    const res = await createCase({ concerns, story, preferredSupport: support });
    setBusy(false);
    if (!res.ok) {
      setError(createCaseErrorMessage(res.reason, res.message));
      return;
    }
    navigate(`/persona/space/${res.data.id}`);
  };

  return (
    <section aria-label="Start a new conversation" className="rounded-card bg-ivory-deep/70 p-5 sm:p-8">
      {step === 'concerns' ? (
        <ConcernStep value={concerns} onChange={setConcerns} onNext={() => setStep('story')} onBack={onCancel} />
      ) : (
        <StoryStep
          story={story}
          onStory={setStory}
          support={support}
          onSupport={setSupport}
          onBack={() => setStep('concerns')}
          onSubmit={submit}
          submitting={busy}
          error={error}
        />
      )}
    </section>
  );
}

function CaseList() {
  const [state, setState] = useState<{ status: 'loading' } | { status: 'error' } | { status: 'ready'; cases: MyCase[] }>({ status: 'loading' });
  const [composing, setComposing] = useState(false);

  const load = useCallback(async () => {
    const res = await listMyCases();
    setState(res.ok ? { status: 'ready', cases: res.data } : { status: 'error' });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (composing) return <NewConversation onCancel={() => setComposing(false)} />;

  return (
    <section aria-labelledby="conversations-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 id="conversations-title" className="font-display text-display-md">
          Your conversations
        </h1>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => void load()} aria-label="Refresh conversations">
            <RefreshCw className="h-4 w-4" aria-hidden /> Refresh
          </Button>
          <Button size="sm" onClick={() => setComposing(true)}>
            <Plus className="h-4 w-4" aria-hidden /> Start a new conversation
          </Button>
        </div>
      </div>

      <div className="mt-6" aria-live="polite">
        {state.status === 'loading' && <Spinner label="Loading your conversations…" />}
        {state.status === 'error' && (
          <Alert tone="danger" title="We couldn't load your conversations">
            Please check your connection and press Refresh.
          </Alert>
        )}
        {state.status === 'ready' && state.cases.length === 0 && (
          <EmptyState title="No conversations yet" art={<Companion variant="drift" mood="hopeful" pose="wave" tone="sage" size={100} />}>
            When you're ready, start a conversation and a counsellor will reply here.
          </EmptyState>
        )}
        {state.status === 'ready' && state.cases.length > 0 && (
          <ul className="space-y-3">
            {state.cases.map((c) => {
              const replied = c.status === 'counsellor_replied';
              return (
                <li key={c.id}>
                  <Link
                    to={`/persona/space/${c.id}`}
                    className={cn(
                      'group flex flex-col gap-3 rounded-card border bg-paper p-4 shadow-soft transition-colors sm:flex-row sm:items-center sm:justify-between sm:p-5',
                      replied ? 'border-lavender-ink ring-2 ring-lavender-ink/20' : 'border-line/10 hover:border-lavender'
                    )}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <CaseStatusChip status={c.status} />
                        {replied && <span className="text-sm font-semibold text-lavender-ink">New reply for you</span>}
                      </div>
                      <p className="mt-2 font-semibold text-ink-strong">{c.concerns.map((x) => CONCERN_LABEL[x] ?? x).join(' · ')}</p>
                      <p className="mt-0.5 text-xs text-ink-soft">
                        Started {formatWhen(c.created_at)} · Last update {formatWhen(c.updated_at)}
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-ink-strong">
                      Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <p className="mt-6 text-sm text-ink-soft">We can't notify you about replies, because we have no way to contact you. Please check back here.</p>
    </section>
  );
}

export default function SpacePage() {
  useDocumentTitle('Your space');
  return <PortalShell>{() => <CaseList />}</PortalShell>;
}
