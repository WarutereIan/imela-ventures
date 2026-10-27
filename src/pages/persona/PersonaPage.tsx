import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PersonaEntry } from '../../components/persona/PersonaEntry';
import { PersonaConversation } from '../../components/persona/PersonaConversation';
import { initialPersonaState, personaReducer, showOptionsNow, type PersonaPath, type PersonaState } from '../../domain/persona/machine';
import { aiReflectionsAvailable, requestAiReflection } from '../../domain/persona/aiClient';
import { screenForRisk } from '../../domain/safety';
import { STATIC_PAGES } from '../../seo/site';
import { usePageMeta } from '../../seo/usePageMeta';

/**
 * In-memory only: lets someone visit a service page and come back to their
 * conversation within the same tab. It is never written to localStorage,
 * sessionStorage or the server, and disappears on refresh or tab close.
 */
let memory: { state: PersonaState; aiConsent: boolean } | null = null;

function reducer(state: PersonaState, action: Parameters<typeof personaReducer>[1] | { type: 'replace'; state: PersonaState }) {
  if (action.type === 'replace') return action.state;
  return personaReducer(state, action);
}

const PATHS: PersonaPath[] = ['talk', 'feelings', 'find'];

export default function PersonaPage() {
  usePageMeta(STATIC_PAGES['/persona/explore']);
  const [params, setParams] = useSearchParams();
  const [state, dispatch] = useReducer(reducer, memory?.state ?? initialPersonaState);
  const [aiConsent, setAiConsent] = useState(memory?.aiConsent ?? false);
  const [busy, setBusy] = useState(false);
  const latest = useRef(state);
  latest.current = state;

  // Deep links from the homepage check-in, e.g. /persona/explore?path=feelings
  useEffect(() => {
    const p = params.get('path') as PersonaPath | null;
    if (p && PATHS.includes(p) && latest.current.step === 'entry') {
      dispatch({ type: 'start', path: p });
      setParams({}, { replace: true });
    }
  }, [params, setParams]);

  useEffect(() => {
    memory = state.step === 'entry' ? null : { state, aiConsent };
  }, [state, aiConsent]);

  const onSay = useCallback(
    async (text: string) => {
      // Safety is always screened locally first; nothing risky is ever sent to an AI provider.
      if (aiConsent && aiReflectionsAvailable && !screenForRisk(text)) {
        setBusy(true);
        const note = await requestAiReflection(latest.current.messages, text);
        setBusy(false);
        dispatch({ type: 'say', text, aiNote: note });
        return;
      }
      dispatch({ type: 'say', text });
    },
    [aiConsent]
  );

  const onShowOptions = useCallback(() => dispatch({ type: 'replace', state: showOptionsNow(latest.current) }), []);

  if (state.step === 'entry') {
    return <PersonaEntry onStart={(path) => dispatch({ type: 'start', path })} />;
  }

  return (
    <PersonaConversation
      state={state}
      dispatch={dispatch}
      onSay={onSay}
      onShowOptions={onShowOptions}
      aiAvailable={aiReflectionsAvailable}
      aiConsent={aiConsent}
      onToggleAi={() => setAiConsent((v) => !v)}
      busy={busy}
    />
  );
}
