import { useEffect, useRef } from 'react';

export const IDLE_MINUTES = 15;
const EVENTS = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const;

/**
 * Signs a Persona out after a period without interaction, so a counselling
 * space isn't left open on a shared or borrowed device.
 */
export function useIdleSignOut(active: boolean, onIdle: () => void, minutes = IDLE_MINUTES) {
  const callback = useRef(onIdle);
  callback.current = onIdle;

  useEffect(() => {
    if (!active) return;
    let timer = window.setTimeout(() => callback.current(), minutes * 60_000);
    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => callback.current(), minutes * 60_000);
    };
    EVENTS.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      window.clearTimeout(timer);
      EVENTS.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [active, minutes]);
}
