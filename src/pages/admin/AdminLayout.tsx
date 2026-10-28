import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { AlertTriangle, Bell, ChevronRight, ExternalLink, LayoutGrid, LogOut, X } from 'lucide-react';
import { useAuth, useRoles } from '../../lib/auth';
import { config } from '../../lib/config';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useDocumentTitle } from '../../lib/useDocumentTitle';
import { cn } from '../../lib/cn';
import { AccessDenied, SignInPanel } from '../../components/workspace/WorkspaceStates';
import { Alert, Spinner } from '../../components/ui/primitives';
import { buttonClasses } from '../../components/ui/Button';
import { notificationHref } from '../../domain/admin/api';
import { AdminProvider } from './context';
import { useAdmin } from './useAdmin';
import { ADMIN_NAV, MORE_SECTIONS, badgeFor, sectionFor, type AdminNavItem } from './nav';
import { CountBadge } from './ui';
import { notificationBody, timeAgo } from './format';

function GateFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory">
      <header className="shell flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2" aria-label="Imela Ventures — back to website">
          <img src="/logo-transparent.png" alt="" className="h-12 w-auto" />
        </Link>
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">Admin</span>
      </header>
      <main className="shell grid min-h-[70vh] place-items-center py-10">{children}</main>
    </div>
  );
}

/**
 * The admin console. Only accounts with the `admin` role get past the gate;
 * the database enforces the same rule with row-level security, so the gate
 * only decides which screen to show.
 */
export default function AdminLayout() {
  useDocumentTitle('Admin');
  const auth = useAuth();
  const { roles, loading: rolesLoading, error: rolesError } = useRoles(auth.user);

  if (auth.loading || (auth.user && rolesLoading)) {
    return (
      <GateFrame>
        <Spinner label="Checking your session…" />
      </GateFrame>
    );
  }
  if (!auth.user) {
    return (
      <GateFrame>
        <div className="w-full max-w-md space-y-4">
          {!isSupabaseConfigured && (
            <Alert tone="danger" title="Supabase is not configured">
              Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.
            </Alert>
          )}
          <SignInPanel
            auth={auth}
            heading="Admin sign in"
            headingLevel="h1"
            intro={<p>Bookings, anonymous cases, enquiries, articles, availability and your team — in one place.</p>}
            allowSignUp
          />
          <p className="text-center text-xs text-ink-soft">Joining the team? Create an account, then ask an administrator to give you access. A new account can't see anything until then.</p>
        </div>
      </GateFrame>
    );
  }
  if (config.platformDbReady) {
    if (rolesError) {
      return (
        <GateFrame>
          <Alert tone="danger" title="We couldn’t verify your access">
            {rolesError}
          </Alert>
        </GateFrame>
      );
    }
    if (!roles.includes('admin')) {
      return (
        <GateFrame>
          <div className="w-full max-w-md space-y-4">
            <AccessDenied what="Imela administrators" onSignOut={auth.signOut} />
            {roles.includes('practitioner') && (
              <p className="text-center text-sm text-ink-soft">
                Counsellors can answer anonymous cases in the{' '}
                <Link to="/staff/persona" className="font-semibold text-lavender-ink underline">
                  counsellor workspace
                </Link>
                .
              </p>
            )}
          </div>
        </GateFrame>
      );
    }
  }

  return (
    <AdminProvider user={auth.user} signOut={auth.signOut}>
      <Console />
    </AdminProvider>
  );
}

function SidebarLink({ item }: { item: AdminNavItem }) {
  const { summary, unread } = useAdmin();
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.id === 'overview' || item.id === 'cases'}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors',
          isActive ? 'bg-ink-strong text-ivory' : 'text-ink hover:bg-lavender-soft'
        )
      }
    >
      <Icon className="h-[1.15rem] w-[1.15rem] shrink-0" aria-hidden />
      <span className="flex-1">{item.label}</span>
      <CountBadge badge={badgeFor(item.id, summary === 'missing' ? null : summary, unread)} />
    </NavLink>
  );
}

function Console() {
  const { user, signOut, summary } = useAdmin();
  const { pathname } = useLocation();
  const migrationMissing = summary === 'missing';

  // Each section starts at the top.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="min-h-screen bg-ivory lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line/10 bg-ivory-deep/60 px-4 py-5 lg:flex">
        <Link to="/admin" className="flex items-center gap-2 px-2" aria-label="Admin overview">
          <img src="/logo-transparent.png" alt="" className="h-11 w-auto" />
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft">Admin</span>
        </Link>
        <nav aria-label="Admin sections" className="mt-6 flex-1 space-y-1 overflow-y-auto">
          {ADMIN_NAV.map((item) => (
            <SidebarLink key={item.id} item={item} />
          ))}
        </nav>
        <div className="space-y-2 border-t border-line/10 pt-4">
          <Link to="/" className="flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-ink hover:bg-lavender-soft">
            <ExternalLink className="h-4 w-4" aria-hidden /> View website
          </Link>
          <p className="truncate px-3 text-xs text-ink-soft" title={user.email ?? ''}>
            {user.email}
          </p>
          <button type="button" onClick={() => void signOut()} className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-rose-ink hover:bg-rose-soft">
            <LogOut className="h-4 w-4" aria-hidden /> Sign out
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <TopBar />
        <main id="main" className="shell max-w-6xl space-y-6 pb-[calc(var(--tabbar-offset)+2rem)] pt-5 lg:pb-12 lg:pt-8">
          {!config.platformDbReady && (
            <div role="note" className="flex gap-3 rounded-card border-2 border-rose/50 bg-rose-soft p-4 text-sm text-rose-ink">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
              <p>
                <strong>Security setup pending.</strong> Set <code>VITE_PLATFORM_DB_READY=true</code> in Vercel once the database migrations are applied, so
                only administrators can open this console.
              </p>
            </div>
          )}
          {migrationMissing && (
            <Alert tone="warning" title="One database update to go">
              Run <code className="break-all">supabase/migrations/20261029000008_admin_console.sql</code> in the Supabase SQL Editor to switch on live counters,
              the notification inbox and team management. Everything else already works.
            </Alert>
          )}
          <Outlet />
        </main>
      </div>
      <AdminTabBar />
    </div>
  );
}

function TopBar() {
  const { pathname } = useLocation();
  const section = ADMIN_NAV.find((n) => n.id === sectionFor(pathname));
  const { live } = useAdmin();
  return (
    <header className="sticky top-0 z-40 border-b border-line/10 bg-ivory/90 backdrop-blur">
      <div className="shell flex h-14 max-w-6xl items-center justify-between gap-3 lg:h-16">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/admin" className="lg:hidden" aria-label="Admin overview">
            <img src="/logo-transparent.png" alt="" className="h-10 w-auto" />
          </Link>
          <p className="truncate text-sm font-semibold text-ink-strong">{section?.label ?? 'Admin'}</p>
          <span
            className={cn('hidden items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-semibold sm:inline-flex', live ? 'bg-sage text-sage-ink' : 'bg-ink/5 text-ink-soft')}
            title={live ? 'New activity appears instantly' : 'Refreshing every minute'}
          >
            <span className={cn('h-2 w-2 rounded-full', live ? 'animate-pulse bg-sage-ink' : 'bg-ink-soft')} aria-hidden />
            {live ? 'Live' : 'Auto-refresh'}
          </span>
        </div>
        <NotificationBell />
      </div>
    </header>
  );
}

function NotificationBell() {
  const { notifications, unread, markRead } = useAdmin();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const latest = notifications.slice(0, 8);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        className="relative grid h-10 w-10 place-items-center rounded-full bg-paper text-ink-strong shadow-soft hover:bg-lavender-soft"
      >
        <Bell className="h-5 w-5" aria-hidden />
        {unread > 0 && <CountBadge badge={{ count: unread }} className="absolute -right-1 -top-1" />}
      </button>
      {open && (
        <div className="fade-in absolute right-0 top-12 z-50 w-[min(92vw,24rem)] overflow-hidden rounded-card border border-line/10 bg-paper shadow-lift">
          <div className="flex items-center justify-between border-b border-line/10 px-4 py-3">
            <p className="font-semibold text-ink-strong">Notifications</p>
            {unread > 0 && (
              <button type="button" onClick={() => void markRead('all')} className="text-xs font-semibold text-lavender-ink hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <ul className="max-h-[60vh] divide-y divide-line/10 overflow-y-auto">
            {latest.length === 0 && <li className="px-4 py-8 text-center text-sm text-ink-soft">You're all caught up.</li>}
            {latest.map((n) => (
              <li key={n.id}>
                <Link
                  to={notificationHref(n)}
                  onClick={() => !n.read_at && void markRead([n.id])}
                  className={cn('flex gap-3 px-4 py-3 hover:bg-lavender-soft/60', !n.read_at && 'bg-lavender-soft/30')}
                >
                  <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.read_at ? 'bg-transparent' : n.urgent ? 'bg-rose' : 'bg-lavender-ink')} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className={cn('block text-sm', n.read_at ? 'text-ink' : 'font-semibold text-ink-strong')}>{n.title}</span>
                    {n.body && <span className="block truncate text-xs text-ink-soft">{notificationBody(n.body)}</span>}
                    <span className="block text-xs text-ink-soft">{timeAgo(n.created_at)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/admin/notifications" className="block border-t border-line/10 px-4 py-3 text-center text-sm font-semibold text-lavender-ink hover:bg-lavender-soft">
            See all notifications
          </Link>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Phone & tablet: glass tab bar adapted to the admin sections          */
/* ------------------------------------------------------------------ */

const TABS = ['overview', 'bookings', 'cases', 'enquiries'] as const;

function AdminTabBar() {
  const { pathname } = useLocation();
  const { summary, unread } = useAdmin();
  const [moreOpen, setMoreOpen] = useState(false);
  const [pressed, setPressed] = useState<{ id: string; n: number } | null>(null);
  const sum = summary === 'missing' ? null : summary;
  const section = sectionFor(pathname);
  const current = moreOpen ? 'more' : MORE_SECTIONS.includes(section) ? 'more' : section;

  useEffect(() => setMoreOpen(false), [pathname]);
  const closeMore = useCallback(() => setMoreOpen(false), []);
  const press = (id: string) => () => setPressed((p) => ({ id, n: (p?.n ?? 0) + 1 }));

  const moreBadge = MORE_SECTIONS.reduce((n, id) => n + (badgeFor(id, sum, unread)?.count ?? 0), 0);
  const items = TABS.map((id) => ADMIN_NAV.find((n) => n.id === id)!);

  return (
    <>
      <nav aria-label="Admin" className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 mx-auto max-w-md lg:hidden">
        <div className="glass-bar grid h-16 grid-cols-5 items-center rounded-[1.75rem] px-1.5">
          {items.slice(0, 2).map((item) => (
            <TabLink key={item.id} item={item} active={current === item.id} badge={badgeFor(item.id, sum, unread)} anim={pressed?.id === item.id ? pressed.n : 0} onPress={press(item.id)} />
          ))}
          {/* Centre: anonymous cases, the most time-sensitive queue */}
          {(() => {
            const item = items[2];
            const active = current === 'cases';
            const badge = badgeFor('cases', sum, unread);
            const anim = pressed?.id === 'cases' ? pressed.n : 0;
            return (
              <Link
                to={item.to}
                onPointerDown={press('cases')}
                aria-current={active ? 'page' : undefined}
                className="relative z-10 flex flex-col items-center justify-end gap-0.5 self-stretch pb-1.5 text-[0.68rem] font-semibold"
              >
                <span
                  key={`c${anim}`}
                  className={cn(
                    'pointer-events-none relative -mt-7 grid h-14 w-14 place-items-center rounded-full border-4 border-ivory text-white transition-colors duration-calm',
                    badge?.urgent ? 'bg-rose' : active ? 'bg-ink-strong' : 'bg-lavender-ink',
                    !badge?.urgent && 'persona-glow',
                    anim ? 'tab-pop' : ''
                  )}
                >
                  <item.icon className="h-6 w-6" strokeWidth={2.2} aria-hidden />
                  <CountBadge badge={badge} className="absolute -right-1 -top-1 border-2 border-ivory" />
                </span>
                <span className={active ? 'text-ink-strong' : 'text-lavender-ink'}>Cases</span>
              </Link>
            );
          })()}
          <TabLink item={items[3]} active={current === 'enquiries'} badge={badgeFor('enquiries', sum, unread)} anim={pressed?.id === 'enquiries' ? pressed.n : 0} onPress={press('enquiries')} />
          <button
            type="button"
            onPointerDown={press('more')}
            onClick={() => setMoreOpen((o) => !o)}
            aria-expanded={moreOpen}
            aria-controls="admin-more-sheet"
            className={cn('relative z-10 flex h-full flex-col items-center justify-center gap-0.5 rounded-[1.35rem]', current === 'more' && 'bg-lavender-soft')}
          >
            <span key={`m${pressed?.id === 'more' ? pressed.n : 0}`} className={cn('pointer-events-none relative grid h-7 w-7 place-items-center', pressed?.id === 'more' && 'tab-pop')}>
              <LayoutGrid className={cn('h-[1.35rem] w-[1.35rem]', current === 'more' ? 'text-lavender-ink' : 'text-ink-soft')} aria-hidden />
              <CountBadge badge={moreBadge ? { count: moreBadge } : null} className="absolute -right-2 -top-1" />
            </span>
            <span className={cn('text-[0.68rem] font-semibold', current === 'more' ? 'text-lavender-ink' : 'text-ink-soft')}>More</span>
          </button>
        </div>
      </nav>
      <AdminMoreSheet open={moreOpen} onClose={closeMore} />
    </>
  );
}

function TabLink({ item, active, badge, anim, onPress }: { item: AdminNavItem; active: boolean; badge: ReturnType<typeof badgeFor>; anim: number; onPress: () => void }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      onPointerDown={onPress}
      aria-current={active ? 'page' : undefined}
      className={cn('relative z-10 flex h-full flex-col items-center justify-center gap-0.5 rounded-[1.35rem] transition-colors', active && 'bg-lavender-soft')}
    >
      <span key={`i${anim}`} className={cn('pointer-events-none relative grid h-7 w-7 place-items-center', anim ? 'tab-pop' : '')}>
        <Icon className={cn('h-[1.35rem] w-[1.35rem]', active ? 'text-lavender-ink' : 'text-ink-soft')} strokeWidth={active ? 2.4 : 1.9} aria-hidden />
        <CountBadge badge={badge} className="absolute -right-2 -top-1" />
      </span>
      <span className={cn('text-[0.68rem] font-semibold', active ? 'text-lavender-ink' : 'text-ink-soft')}>{item.label}</span>
    </Link>
  );
}

function AdminMoreSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { summary, unread, user, signOut } = useAdmin();
  const closeRef = useRef<HTMLButtonElement>(null);
  const sum = summary === 'missing' ? null : summary;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  const items = ADMIN_NAV.filter((n) => MORE_SECTIONS.includes(n.id));

  return createPortal(
    <div className="fixed inset-0 z-[70] lg:hidden">
      <button type="button" aria-label="Close menu" onClick={onClose} className="fade-in absolute inset-0 h-full w-full cursor-default bg-ink-strong/35 backdrop-blur-[2px]" />
      <div
        id="admin-more-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-more-title"
        className="glass-bar sheet-up absolute inset-x-2 bottom-2 max-h-[85dvh] overflow-y-auto overscroll-contain rounded-[2rem] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3"
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-ink/20" aria-hidden />
        <div className="flex items-center justify-between px-1">
          <h2 id="admin-more-title" className="font-display text-display-sm">
            Admin tools
          </h2>
          <button ref={closeRef} type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-ink/5 text-ink-strong hover:bg-ink/10" aria-label="Close">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-2.5">
          {items.map((item) => (
            <li key={item.id}>
              <Link to={item.to} onClick={onClose} className="relative flex h-full flex-col gap-2 rounded-2xl bg-paper/90 p-3.5 shadow-soft hover:bg-lavender-soft">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-lavender-soft text-lavender-ink">
                  <item.icon className="h-[1.1rem] w-[1.1rem]" aria-hidden />
                </span>
                <span className="text-sm font-semibold text-ink-strong">{item.label}</span>
                <span className="text-xs text-ink-soft">{item.hint}</span>
                <CountBadge badge={badgeFor(item.id, sum, unread)} className="absolute right-3 top-3" />
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-2">
          <Link to="/" onClick={onClose} className="flex items-center justify-between rounded-2xl bg-paper/90 px-4 py-3 text-sm font-semibold text-ink-strong shadow-soft">
            View website <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-paper/90 px-4 py-3 shadow-soft">
            <span className="min-w-0 truncate text-xs text-ink-soft">{user.email}</span>
            <button type="button" onClick={() => void signOut()} className={buttonClasses('ghost', 'sm', 'text-rose-ink')}>
              <LogOut className="h-4 w-4" aria-hidden /> Sign out
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
