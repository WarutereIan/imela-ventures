import { useLocation } from 'react-router-dom';

export type TabId = 'home' | 'support' | 'persona' | 'book' | 'more';

/** Routes that count as being "in" the More tab. */
export const MORE_ROUTES = ['/who-we-are', '/team', '/resources', '/organisations', '/privacy', '/terms'];

/**
 * Screens that already have their own bottom controls (booking's action bar,
 * Persona's message box) or are task-focused hide the tab bar — one bottom
 * bar at a time, like a checkout screen in an app.
 */
const HIDDEN_ON = [/^\/book/, /^\/persona\/(explore|start|access|space)/, /^\/staff/, /^\/practitioner/, /^\/portal/];

export function isTabBarHidden(pathname: string): boolean {
  return HIDDEN_ON.some((re) => re.test(pathname));
}

export function useTabBarVisible(): boolean {
  const { pathname } = useLocation();
  return !isTabBarHidden(pathname);
}

export function activeTab(pathname: string): TabId | null {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/support') || pathname.startsWith('/find-support')) return 'support';
  if (pathname.startsWith('/persona')) return 'persona';
  if (pathname.startsWith('/book')) return 'book';
  if (MORE_ROUTES.some((r) => pathname.startsWith(r))) return 'more';
  return null;
}
