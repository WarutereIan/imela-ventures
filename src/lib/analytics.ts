import { isPrivatePath } from '../seo/site';

/**
 * Google Analytics 4, loaded directly (no Tag Manager) so the site decides
 * exactly where it runs.
 *
 * Analytics never runs on the anonymous Persona pages, the staff and admin
 * consoles, or any other signed-in area. On those pages the script is not
 * loaded; if it was already loaded on a public page, Google's own opt-out
 * switch (`ga-disable-<id>`) is turned on, which stops every hit.
 *
 * Page views on public pages are sent by Google's "enhanced measurement",
 * which watches the browser history. The switch is therefore flipped inside
 * the history calls themselves, before Analytics can see the new address.
 */
export const GA_ID = 'G-3FWMBE5SMB';

export function isAnalyticsExcluded(pathname: string): boolean {
  return pathname === '/persona' || pathname.startsWith('/persona/') || isPrivatePath(pathname);
}

type AnalyticsWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void } & Record<string, unknown>;

let loaded = false;

function load(w: AnalyticsWindow) {
  if (loaded) return;
  loaded = true;
  w.dataLayer = w.dataLayer || [];
  // gtag.js expects the `arguments` object itself, not an array copy.
  w.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments);
  };
  w.gtag('js', new Date());
  w.gtag('config', GA_ID);
  const script = w.document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  w.document.head.appendChild(script);
}

function apply(w: AnalyticsWindow, pathname: string) {
  const excluded = isAnalyticsExcluded(pathname);
  w[`ga-disable-${GA_ID}`] = excluded;
  if (!excluded) load(w);
}

/** Call once, before the app renders. */
export function startAnalytics(w: AnalyticsWindow = window as unknown as AnalyticsWindow) {
  const pathOf = (url?: string | URL | null) => (url == null ? w.location.pathname : new URL(String(url), w.location.href).pathname);

  for (const method of ['pushState', 'replaceState'] as const) {
    const original = w.history[method].bind(w.history);
    w.history[method] = (data: unknown, unused: string, url?: string | URL | null) => {
      apply(w, pathOf(url));
      original(data, unused, url);
    };
  }
  // Capture phase, registered before gtag.js exists, so it runs first on back/forward.
  w.addEventListener('popstate', () => apply(w, w.location.pathname), true);

  apply(w, w.location.pathname);
}
