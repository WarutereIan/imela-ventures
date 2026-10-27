import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Send } from 'lucide-react';
import { PortalShell, type PortalSession } from '../../../components/personaPortal/PortalShell';
import { CaseStatusChip } from '../../../components/personaPortal/shared';
import { formatWhen } from '../../../components/personaPortal/text';
import { ResourceLink } from '../../../components/personaPortal/ResourceLink';
import { closeMyCase, getMyCase, listCaseResources, listMessages, MESSAGE_LIMIT, sendMessage } from '../../../domain/personaPortal/api';
import { CONCERN_LABEL, SUPPORT_LABEL, type CaseMessage, type CaseResource, type MyCase } from '../../../domain/personaPortal/types';
import { screenForRisk } from '../../../domain/safety';
import { CrisisContacts } from '../../../components/layout/UrgentHelp';
import { Alert, Spinner } from '../../../components/ui/primitives';
import { Button, buttonClasses } from '../../../components/ui/Button';
import { useDocumentTitle } from '../../../lib/useDocumentTitle';
import { cn } from '../../../lib/cn';

function Bubble({ m }: { m: CaseMessage }) {
  if (m.sender_role === 'system') {
    return <p className="mx-auto max-w-md rounded-pill bg-ink/5 px-4 py-1.5 text-center text-xs text-ink-soft">{m.body}</p>;
  }
  const mine = m.sender_role === 'persona';
  return (
    <div className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[min(36rem,90%)] rounded-3xl px-4 py-3', mine ? 'rounded-br-md bg-lavender-ink text-white' : 'rounded-bl-md bg-paper text-ink-strong shadow-soft')}>
        <p className={cn('mb-1 text-xs font-semibold', mine ? 'text-white/80' : 'text-lavender-ink')}>{mine ? 'You' : 'Your counsellor'}</p>
        <p className="whitespace-pre-wrap break-words leading-relaxed">{m.body}</p>
        <p className={cn('mt-1.5 text-[0.7rem]', mine ? 'text-white/70' : 'text-ink-soft')}>{formatWhen(m.created_at)}</p>
      </div>
    </div>
  );
}

type Load = { status: 'loading' } | { status: 'not_found' } | { status: 'error' } | { status: 'ready'; c: MyCase; messages: CaseMessage[]; resources: CaseResource[] };

function Thread({ caseId, session }: { caseId: string; session: PortalSession }) {
  const [state, setState] = useState<Load>({ status: 'loading' });
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [showCrisis, setShowCrisis] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const c = await getMyCase(caseId);
    if (!c.ok) {
      setState({ status: c.reason === 'not_found' ? 'not_found' : 'error' });
      return;
    }
    const [m, r] = await Promise.all([listMessages(caseId), listCaseResources(caseId)]);
    if (!m.ok || !r.ok) {
      setState({ status: 'error' });
      return;
    }
    setState({ status: 'ready', c: c.data, messages: m.data, resources: r.data });
  }, [caseId]);

  useEffect(() => {
    void load();
    // Light polling only while the tab is visible — kind to low bandwidth.
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load();
    }, 60_000);
    return () => window.clearInterval(id);
  }, [load]);

  const messageCount = state.status === 'ready' ? state.messages.length : 0;
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messageCount]);

  if (state.status === 'loading') return <Spinner label="Loading your conversation…" />;
  if (state.status === 'not_found') {
    return (
      <div className="text-center">
        <h1 className="font-display text-display-sm">We couldn't find that conversation</h1>
        <p className="mt-2 text-ink-soft">It may have been closed and removed, or it belongs to a different Persona ID.</p>
        <Link to="/persona/space" className={buttonClasses('primary', 'md', 'mt-5')}>
          Back to your conversations
        </Link>
      </div>
    );
  }
  if (state.status === 'error') {
    return (
      <Alert tone="danger" title="We couldn't load this conversation">
        Please check your connection and try again.
        <Button size="sm" variant="ghost" className="ml-2" onClick={() => void load()}>
          Try again
        </Button>
      </Alert>
    );
  }

  const { c, messages, resources } = state;
  const closed = c.status === 'closed';

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || closed || sending) return;
    if (screenForRisk(text)) setShowCrisis(true);
    setSending(true);
    setSendError(null);
    const res = await sendMessage(caseId, text, session.userId);
    setSending(false);
    if (!res.ok) {
      setSendError(
        res.reason === 'limit'
          ? res.message ?? 'You have sent a lot of messages recently. Please wait a little before sending more.'
          : res.reason === 'closed'
            ? 'This conversation is closed, so new messages can’t be added.'
            : res.reason === 'network'
              ? "We couldn't send your message. Please check your connection — your text is still here."
              : 'Your message was not sent. Please try again.'
      );
      return;
    }
    setDraft('');
    await load();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <section aria-labelledby="thread-title" className="min-w-0">
        <Link to="/persona/space" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-ink-strong">
          <ArrowLeft className="h-4 w-4" aria-hidden /> All conversations
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 id="thread-title" className="font-display text-display-sm">
            {c.concerns.map((x) => CONCERN_LABEL[x] ?? x).join(' · ')}
          </h1>
          <CaseStatusChip status={c.status} />
        </div>
        <p className="mt-1 text-sm text-ink-soft">
          {SUPPORT_LABEL[c.preferred_support]} · started {formatWhen(c.created_at)}
          {c.has_counsellor ? ' · a counsellor is looking after this' : ''}
        </p>

        {c.story && (
          <details className="mt-4 rounded-2xl bg-paper/80 p-4 shadow-soft">
            <summary className="cursor-pointer text-sm font-semibold text-ink-strong">What you first shared</summary>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink">{c.story}</p>
          </details>
        )}

        <div className="mt-5 rounded-[2rem] border border-line/10 bg-ivory-deep/60 p-3 sm:p-5">
          <div role="log" aria-live="polite" aria-label="Messages" className="space-y-3">
            {messages.length === 0 && (
              <p className="py-6 text-center text-sm text-ink-soft">
                {closed ? 'This conversation was closed.' : 'No replies yet. A counsellor will respond here — please check back.'}
              </p>
            )}
            {messages.map((m) => (
              <Bubble key={m.id} m={m} />
            ))}
            <div ref={endRef} />
          </div>

          {showCrisis && (
            <div role="alert" className="mt-4 rounded-card border-2 border-rose/40 bg-rose-soft/60 p-4">
              <p className="font-semibold text-ink-strong">If you're in danger right now, please contact emergency help immediately.</p>
              <CrisisContacts className="mt-3" compact />
              <p className="mt-2 text-xs text-ink-soft">Your message will be reviewed by a counsellor as a priority, but this space is not watched in real time.</p>
            </div>
          )}

          {closed ? (
            <p className="mt-4 rounded-2xl bg-paper px-4 py-3 text-sm text-ink">
              This conversation is closed. You can{' '}
              <Link to="/persona/space" className="font-semibold underline">
                start a new one
              </Link>{' '}
              any time.
            </p>
          ) : null}
          <form onSubmit={send} className="mt-4 rounded-3xl border border-line/15 bg-paper p-2 shadow-soft focus-within:border-lavender-ink">
            <label htmlFor="thread-input" className="sr-only">
              Your message
            </label>
            <textarea
              id="thread-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, MESSAGE_LIMIT))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  void send();
                }
              }}
              disabled={closed || sending}
              rows={3}
              placeholder={closed ? 'This conversation is closed' : 'Write to your counsellor…'}
              className="block w-full resize-none border-0 bg-transparent px-3 py-2 text-[1rem] text-ink-strong placeholder:text-ink-soft/70 focus:outline-none focus-visible:shadow-none disabled:cursor-not-allowed"
            />
            <div className="flex items-center justify-between gap-2 px-2 pb-1">
              <span className="text-xs text-ink-soft">
                {draft.length > MESSAGE_LIMIT - 500 ? `${MESSAGE_LIMIT - draft.length} characters left` : <span className="hidden sm:inline">Enter to send · Shift+Enter for a new line</span>}
              </span>
              <Button type="submit" size="sm" variant="accent" disabled={closed || sending || !draft.trim()}>
                {sending ? 'Sending…' : 'Send'} <Send className="h-3.5 w-3.5" aria-hidden />
              </Button>
            </div>
          </form>
          {sendError && (
            <Alert tone="danger" className="mt-3" live>
              {sendError}
            </Alert>
          )}
        </div>
      </section>

      <aside aria-label="About this conversation" className="space-y-4">
        <Button size="sm" variant="ghost" onClick={() => void load()}>
          <RefreshCw className="h-4 w-4" aria-hidden /> Check for replies
        </Button>
        <section aria-labelledby="res-title" className="rounded-card bg-sage/60 p-4">
          <h2 id="res-title" className="font-semibold text-ink-strong">
            Resources from your counsellor
          </h2>
          {resources.length === 0 ? (
            <p className="mt-1 text-sm text-ink">None yet.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {resources.map((r) => (
                <li key={r.id}>
                  <ResourceLink resource={r} />
                </li>
              ))}
            </ul>
          )}
        </section>
        {!closed && (
          <section className="rounded-card bg-paper p-4 shadow-soft">
            {!confirmClose ? (
              <Button size="sm" variant="outline" onClick={() => setConfirmClose(true)}>
                Close this conversation
              </Button>
            ) : (
              <div>
                <p className="text-sm text-ink">Close this conversation? You won't be able to add messages, but you can start a new one.</p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={async () => {
                      const res = await closeMyCase(caseId);
                      setConfirmClose(false);
                      if (res.ok) await load();
                      else setSendError('We could not close the conversation. Please try again.');
                    }}
                  >
                    Yes, close it
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmClose(false)}>
                    Keep it open
                  </Button>
                </div>
              </div>
            )}
          </section>
        )}
      </aside>
    </div>
  );
}

export default function CaseThreadPage() {
  useDocumentTitle('Your conversation');
  const { caseId = '' } = useParams();
  return <PortalShell>{(session) => <Thread caseId={caseId} session={session} />}</PortalShell>;
}
