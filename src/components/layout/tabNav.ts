export type TabId = 'home' | 'support' | 'persona' | 'book' | 'more';

/** Routes that count as being "in" the More tab. */
export const MORE_ROUTES = ['/who-we-are', '/team', '/resources', '/organisations', '/privacy', '/terms'];

/** The tab bar is present on every page; pages with their own bottom controls sit above it (see --tabbar-offset). */
export function useTabBarVisible(): boolean {
  return true;
}

export function activeTab(pathname: string): TabId | null {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/support') || pathname.startsWith('/find-support')) return 'support';
  if (pathname.startsWith('/persona')) return 'persona';
  if (pathname.startsWith('/book')) return 'book';
  if (MORE_ROUTES.some((r) => pathname.startsWith(r))) return 'more';
  return null;
}
