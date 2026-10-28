import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AdminContext, type Toast } from './useAdmin';
import { Link } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { DESKTOP_ALERTS_KEY, notificationBody } from './format';
import {
  fetchSummary,
  listNotifications,
  markNotificationsRead,
  notificationHref,
  type AdminNotification,
  type AdminSummary,
} from '../../domain/admin/api';



/** Optional system pop-up while the console is open. Only the title is shown — never names or messages. */
function showDesktopAlert(title: string) {
  try {
    if (localStorage.getItem(DESKTOP_ALERTS_KEY) !== '1') return;
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    if (document.visibilityState === 'visible' && document.hasFocus()) return;
    new Notification('Imela admin', { body: title, icon: '/logo.png', tag: 'imela-admin' });
  } catch {
    /* alerts are a convenience only */
  }
}


const POLL_MS = 60_000;

/**
 * Keeps the console's counters and notification inbox current: loads them
 * once, listens for new rows over Supabase Realtime, and falls back to a
 * one-minute refresh while the tab is visible.
 */
export function AdminProvider({ user, signOut, children }: { user: User; signOut: () => Promise<void>; children: React.ReactNode }) {
  const [summary, setSummary] = useState<AdminSummary | 'missing' | null>(null);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [live, setLive] = useState(false);
  const nextId = useRef(1);
  const refreshTimer = useRef<number>();

  const toast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev.slice(-2), { ...t, id }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), t.tone === 'danger' ? 9000 : 6000);
  }, []);

  const refresh = useCallback(async () => {
    const [s, n] = await Promise.all([fetchSummary(), listNotifications()]);
    if (s.ok) setSummary(s.data);
    else if (s.reason === 'missing') setSummary('missing');
    if (n.ok) setNotifications(n.data);
  }, []);

  const refreshSoon = useCallback(() => {
    window.clearTimeout(refreshTimer.current);
    refreshTimer.current = window.setTimeout(() => void refresh(), 800);
  }, [refresh]);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') void refresh();
    }, POLL_MS);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(refreshTimer.current);
    };
  }, [refresh]);

  useEffect(() => {
    const channel = supabase
      .channel('admin-console')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'admin_notifications' }, (payload) => {
        const n = payload.new as AdminNotification;
        setNotifications((prev) => (prev.some((x) => x.id === n.id) ? prev : [n, ...prev]));
        toast({ tone: n.urgent ? 'danger' : 'info', text: n.body ? `${n.title}: ${notificationBody(n.body)}` : n.title, href: notificationHref(n) });
        showDesktopAlert(n.title);
        refreshSoon();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, refreshSoon)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'enquiries' }, refreshSoon)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'persona_cases' }, refreshSoon)
      .subscribe((status) => setLive(status === 'SUBSCRIBED'));
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [toast, refreshSoon]);

  const markRead = useCallback(
    async (ids: string[] | 'all') => {
      const now = new Date().toISOString();
      setNotifications((prev) => prev.map((n) => (ids === 'all' || ids.includes(n.id) ? { ...n, read_at: n.read_at ?? now } : n)));
      const res = await markNotificationsRead(ids);
      if (!res.ok) toast({ tone: 'danger', text: 'Could not update notifications.' });
      refreshSoon();
    },
    [toast, refreshSoon]
  );

  const unread = notifications.filter((n) => !n.read_at).length;

  return (
    <AdminContext.Provider value={{ user, signOut, summary, notifications, unread, live, refresh, markRead, toast }}>
      {children}
      <Toasts toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((x) => x.id !== id))} />
    </AdminContext.Provider>
  );
}

const TONE: Record<Toast['tone'], string> = {
  success: 'border-sage-ink/30 bg-sage text-sage-ink',
  danger: 'border-rose/40 bg-rose-soft text-rose-ink',
  warning: 'border-butter-ink/30 bg-butter text-butter-ink',
  info: 'border-lavender-ink/20 bg-paper text-ink-strong',
};

function Toasts({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-3 top-3 z-[80] flex flex-col items-end gap-2 sm:left-auto sm:right-5 sm:top-5 sm:w-96">
      {toasts.map((t) => (
        <div key={t.id} className={`fade-in pointer-events-auto flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-medium shadow-lift ${TONE[t.tone]}`}>
          <p className="flex-1">
            {t.text}
            {t.href && (
              <Link to={t.href} onClick={() => onDismiss(t.id)} className="ml-2 font-semibold underline underline-offset-2">
                Open
              </Link>
            )}
          </p>
          <button type="button" onClick={() => onDismiss(t.id)} className="-mr-1 rounded-full px-2 text-base leading-none opacity-70 hover:opacity-100" aria-label="Dismiss">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
