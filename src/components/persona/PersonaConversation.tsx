import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, RotateCcw, Send, ShieldCheck, Sparkles } from 'lucide-react';
import Companion, { type CompanionMood, type CompanionPose, type CompanionTone, type CompanionVariant } from '../characters/Companion';
import Scene from '../characters/Scene';
import { QuickExit } from '../layout/UrgentHelp';
import { Button, buttonClasses } from '../ui/Button';
import { MessageView, TypingIndicator } from './MessageView';
import { ConcernPicker } from './ConcernPicker';
import { buildSummary, downloadText } from './summary';
import { getConcern } from '../../data/concerns';
import { canShowOptionsNow, composerEnabled, type PersonaAction, type PersonaState } from '../../domain/persona/machine';
import { CLARIFICATIONS, FEELINGS, SUGGESTED_PROMPTS } from '../../domain/persona/script';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { cn } from '../../lib/cn';

const quick =
  'rounded-pill border border-ink/15 bg-paper px-3.5 py-2 text-sm font-medium text-ink-strong transition-colors hover:border-lavender-ink hover:bg-lavender-soft disabled:opacity-50';

interface Look {
  variant: CompanionVariant;
  mood: CompanionMood;
  pose: CompanionPose;
  tone: CompanionTone;
}

/** The companion mirrors the conversation: calm at first, then the theme of what's being explored. */
function companionLook(state: PersonaState): Look {
  if (state.step === 'safety') return { variant: 'heart', mood: 'calm', pose: 'hold', tone: 'rose' };
  if (state.step === 'closed') return { variant: 'drift', mood: 'joyful', pose: 'wave', tone: 'sage' };
  if (state.step === 'recommendations') return { variant: 'drift', mood: 'hopeful', pose: 'hold', tone: 'sage' };
  const slug = state.selectedConcerns[0] ?? state.interpretation?.concernSlugs[0];
  const concern = getConcern(slug);
  if (concern) return { variant: concern.character.variant, mood: concern.character.mood, pose: 'hug', tone: concern.character.tone };
  return { variant: 'drift', mood: 'calm', pose: 'idle', tone: 'sage' };
}

interface Props {
  state: PersonaState;
  dispatch: (a: PersonaAction) => void;
  onSay: (text: string) => Promise<void>;
  onShowOptions: () => void;
  aiAvailable: boolean;
  aiConsent: boolean;
  onToggleAi: () => void;
  busy: boolean;
}

export function PersonaConversation({ state, dispatch, onSay, onShowOptions, aiAvailable, aiConsent, onToggleAi, busy }: Props) {
  const reduced = useReducedMotion();
  const [draft, setDraft] = useState('');
  const [feelings, setFeelings] = useState<string[]>([]);
  const [includeWords, setIncludeWords] = useState(false);
  const [visible, setVisible] = useState(state.messages.length);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Reveal Persona's messages one at a time with a short "typing" pause, so
  // replies feel considered rather than instant. Skipped for reduced motion.
  useEffect(() => {
    if (visible > state.messages.length) {
      setVisible(state.messages.length);
      return;
    }
    if (visible === state.messages.length) return;
    const next = state.messages[visible];
    if (reduced || next.from === 'person') {
      setVisible((v) => v + 1);
      return;
    }
    const delay = Math.min(1400, 450 + next.text.length * 6);
    const t = window.setTimeout(() => setVisible((v) => v + 1), delay);
    return () => window.clearTimeout(t);
  }, [visible, state.messages, reduced]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'end' });
  }, [visible, reduced, busy]);

  const settled = visible >= state.messages.length && !busy;
  const look = companionLook(state);
  const canType = composerEnabled(state) && !busy;
  const lead = getConcern(state.interpretation?.concernSlugs[0]);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || !canType) return;
    setDraft('');
    await onSay(text);
    inputRef.current?.focus();
  };

  const quickReplies = useMemo(() => {
    if (!settled) return null;
    switch (state.step) {
      case 'awaiting_need':
        if (state.path === 'talk' && state.statements.length === 0)
          return (
            <div role="group" aria-label="Suggestions" className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((p) => (
                <button key={p} type="button" className={quick} onClick={() => onSay(p)}>
                  {p}
                </button>
              ))}
            </div>
          );
        return <ConcernPicker onChoose={(slug) => dispatch({ type: 'choose_concerns', slugs: [slug] })} />;
      case 'awaiting_confirmation':
        return (
          <div role="group" aria-label="Did Persona understand?" className="flex flex-wrap gap-2">
            <button type="button" className={cn(quick, 'border-lavender-ink bg-lavender-soft')} onClick={() => dispatch({ type: 'confirm', answer: 'yes' })}>
              Yes, that's it
            </button>
            <button type="button" className={quick} onClick={() => dispatch({ type: 'confirm', answer: 'no' })}>
              Not quite
            </button>
            <button type="button" className={quick} onClick={() => dispatch({ type: 'confirm', answer: 'more' })}>
              There's more
            </button>
          </div>
        );
      case 'awaiting_correction':
        return <ConcernPicker initialGroup={lead?.group} onChoose={(slug) => dispatch({ type: 'choose_concerns', slugs: [slug] })} label="Choose what feels closer" />;
      case 'awaiting_clarification': {
        const group = getConcern(state.selectedConcerns[0] ?? state.interpretation?.concernSlugs[0])?.group;
        const c = group ? CLARIFICATIONS[group] : undefined;
        return (
          <div role="group" aria-label="Answer or skip" className="flex flex-wrap gap-2">
            {c?.options.map((o) => (
              <button key={o.id} type="button" className={quick} onClick={() => dispatch({ type: 'clarify', optionId: o.id })}>
                {o.label}
              </button>
            ))}
            <button type="button" className={cn(quick, 'bg-ivory-deep')} onClick={() => dispatch({ type: 'clarify', optionId: null })}>
              Skip this question
            </button>
          </div>
        );
      }
      case 'awaiting_feelings':
        return (
          <div className="space-y-3">
            <div role="group" aria-label="Feeling words" className="flex flex-wrap gap-2">
              {FEELINGS.map((f) => {
                const on = feelings.includes(f.id);
                return (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={on}
                    className={cn(quick, on && 'border-lavender-ink bg-lavender text-ink-strong')}
                    onClick={() => setFeelings((cur) => (on ? cur.filter((x) => x !== f.id) : [...cur, f.id]))}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={feelings.length === 0} onClick={() => dispatch({ type: 'feelings', ids: feelings })}>
                Continue{feelings.length ? ` with ${feelings.length}` : ''}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => dispatch({ type: 'feelings', ids: [] })}>
                I'd rather describe it
              </Button>
            </div>
          </div>
        );
      case 'awaiting_more':
        return canShowOptionsNow(state) ? (
          <div className="flex flex-wrap gap-2">
            <button type="button" className={cn(quick, 'border-lavender-ink bg-lavender-soft')} onClick={onShowOptions}>
              Show me options now
            </button>
          </div>
        ) : null;
      case 'safety':
        if (state.safety?.resolved === 'not_safe') return null;
        return (
          <div role="group" aria-label="Are you safe right now?" className="flex flex-wrap gap-2">
            <button type="button" className={cn(quick, 'border-rose bg-rose-soft')} onClick={() => dispatch({ type: 'safety', safe: false })}>
              I'm not safe
            </button>
            <button type="button" className={quick} onClick={() => dispatch({ type: 'safety', safe: true })}>
              I'm safe right now
            </button>
          </div>
        );
      case 'recommendations':
        return (
          <div className="flex flex-wrap gap-2">
            <button type="button" className={quick} onClick={() => inputRef.current?.focus()}>
              Keep talking
            </button>
            <button type="button" className={quick} onClick={() => dispatch({ type: 'finish' })}>
              Pause here
            </button>
          </div>
        );
      default:
        return null;
    }
  }, [settled, state, feelings, dispatch, onSay, onShowOptions, lead?.group]);

  const exportSummary = () => {
    downloadText('imela-persona-summary.txt', buildSummary(state, includeWords));
  };

  return (
    <div className="shell grid gap-6 py-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-10 lg:py-10">
      {/* Companion + controls */}
      <aside className="lg:sticky lg:top-32 lg:self-start" aria-label="Conversation controls">
        <Scene environment="scribble" framed className="hidden lg:block">
          <div className="flex h-64 items-end justify-center pb-3">
            <Companion {...look} size={150} />
          </div>
        </Scene>
        <div className="flex items-center gap-3 lg:mt-5">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-lavender lg:hidden">
            <Companion {...look} size={52} />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-display-sm">Imela Persona</h1>
            <p className="flex items-center gap-1.5 text-xs text-ink-soft">
              <ShieldCheck className="h-3.5 w-3.5 text-sage-ink" aria-hidden />
              Private · kept in this tab only
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => dispatch({ type: 'reset' })}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Start over
          </Button>
          <QuickExit />
        </div>

        <details className="mt-4 rounded-2xl bg-paper/80 p-4 text-sm shadow-soft">
          <summary className="cursor-pointer font-semibold text-ink-strong">Privacy & how this works</summary>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-ink-soft">
            <li>Your words stay in this browser tab's memory. They aren't saved to our servers or browser storage.</li>
            <li>“Start over”, Quick exit or closing the tab clears everything.</li>
            <li>Suggestions come from Imela's own list of services. Nothing here is a diagnosis.</li>
            <li>No one is reading along, so Persona can't send help. Use “Need urgent help?” if you're in danger.</li>
          </ul>
          {aiAvailable && (
            <div className="mt-4 rounded-xl bg-lavender-soft p-3">
              <label className="flex items-start gap-2 text-ink">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-[#4E3D99]" checked={aiConsent} onChange={onToggleAi} />
                <span>
                  <span className="flex items-center gap-1 font-semibold">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden /> AI reflections (optional)
                  </span>
                  When on, your recent messages are sent to Imela's server and a third-party AI provider to write a short reflection. They aren't stored or
                  used for advertising. Suggested services still come only from Imela's catalogue.{' '}
                  <Link to="/privacy#persona" className="underline">
                    Details
                  </Link>
                </span>
              </label>
            </div>
          )}
        </details>

        {(state.result || state.selectedConcerns.length > 0) && (
          <div className="mt-4 rounded-2xl bg-paper/80 p-4 text-sm shadow-soft">
            <p className="font-semibold text-ink-strong">Keep a copy for yourself</p>
            <p className="mt-1 text-ink-soft">Download a summary to this device. Nothing is uploaded.</p>
            <label className="mt-2 flex items-center gap-2 text-ink">
              <input type="checkbox" className="h-4 w-4 accent-[#4E3D99]" checked={includeWords} onChange={(e) => setIncludeWords(e.target.checked)} />
              Include what I wrote
            </label>
            <Button size="sm" variant="soft" className="mt-3" onClick={exportSummary}>
              <Download className="h-3.5 w-3.5" aria-hidden /> Download summary
            </Button>
          </div>
        )}
      </aside>

      {/* Conversation */}
      <section aria-label="Conversation with Imela Persona" className="flex min-h-[70vh] min-w-0 flex-col rounded-[2rem] border border-line/10 bg-ivory-deep/60 p-3 sm:p-5">
        <p className="mx-auto mb-4 max-w-md rounded-pill bg-paper/80 px-4 py-1.5 text-center text-xs text-ink-soft">
          Automated guide · not a counsellor · not monitored
        </p>
        <div role="log" aria-live="polite" aria-relevant="additions" className="flex-1 space-y-3">
          {state.messages.slice(0, visible).map((m) => (
            <MessageView key={m.id} message={m} />
          ))}
          {(!settled || busy) && <TypingIndicator />}
          <div ref={endRef} />
        </div>

        {state.step === 'closed' && settled && (
          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={() => dispatch({ type: 'reset' })}>Start a new conversation</Button>
            <Link to="/book?service=consultation&via=persona" className={buttonClasses('outline')}>
              Book an initial consultation
            </Link>
            <Link to="/resources" className={buttonClasses('ghost')}>
              Read gentle resources
            </Link>
          </div>
        )}

        {quickReplies && <div className="mt-5">{quickReplies}</div>}

        {state.step !== 'closed' && (
          <form onSubmit={submit} className="mt-4 rounded-3xl border border-line/15 bg-paper p-2 shadow-soft focus-within:border-lavender-ink">
            <label htmlFor="persona-input" className="sr-only">
              Your message
            </label>
            <textarea
              id="persona-input"
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, 1000))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  void submit();
                }
              }}
              rows={2}
              disabled={!canType}
              placeholder={
                state.step === 'safety' && state.safety?.resolved !== 'safe'
                  ? 'Please let us know if you are safe right now, using the buttons above.'
                  : 'Write in your own words…'
              }
              className="block w-full resize-none border-0 bg-transparent px-3 py-2 text-[1rem] text-ink-strong placeholder:text-ink-soft/70 focus:outline-none focus-visible:shadow-none disabled:cursor-not-allowed"
            />
            <div className="flex items-center justify-between gap-2 px-2 pb-1">
              <span className="text-xs text-ink-soft" aria-live="off">
                {draft.length > 800 ? `${1000 - draft.length} characters left` : <span className="hidden sm:inline">Enter to send · Shift+Enter for a new line</span>}
              </span>
              <Button type="submit" size="sm" variant="accent" disabled={!canType || !draft.trim()}>
                Send <Send className="h-3.5 w-3.5" aria-hidden />
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
