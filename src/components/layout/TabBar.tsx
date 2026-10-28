import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CalendarHeart, Compass, Home, LayoutGrid, MessageCircleHeart } from 'lucide-react';
import { cn } from '../../lib/cn';
import { MoreSheet } from './MoreSheet';
import { activeTab, useTabBarVisible, type TabId } from './tabNav';

interface Tab {
  id: TabId;
  label: string;
  to?: string;
  icon: React.ElementType;
}

const TABS: Tab[] = [
  { id: 'home', label: 'Home', to: '/', icon: Home },
  { id: 'support', label: 'Support', to: '/support', icon: Compass },
  { id: 'persona', label: 'Imela', to: '/persona', icon: MessageCircleHeart },
  { id: 'book', label: 'Book', to: '/book', icon: CalendarHeart },
  { id: 'more', label: 'More', icon: LayoutGrid },
];

/** True while an on-screen keyboard is likely open (a text field has focus). */
function useTyping(): boolean {
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    const isField = (el: EventTarget | null) =>
      el instanceof HTMLElement && (el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || (el.tagName === 'INPUT' && !['checkbox', 'radio', 'button', 'submit'].includes((el as HTMLInputElement).type)) || el.isContentEditable);
    const onIn = (e: FocusEvent) => setTyping(isField(e.target));
    const onOut = () => setTyping(false);
    window.addEventListener('focusin', onIn);
    window.addEventListener('focusout', onOut);
    return () => {
      window.removeEventListener('focusin', onIn);
      window.removeEventListener('focusout', onOut);
    };
  }, []);
  return typing;
}

/**
 * App-style navigation for phones and tablets: a floating glass pill above
 * the device's gesture area. Hidden from the `lg` breakpoint, where the top
 * navigation takes over.
 */
export function TabBar({ onUrgentHelp }: { onUrgentHelp: () => void }) {
  const { pathname } = useLocation();
  const visible = useTabBarVisible();
  const typing = useTyping();
  const [moreOpen, setMoreOpen] = useState(false);
  // Incrementing per-tab keys re-trigger the press animation on every tap.
  const [pressed, setPressed] = useState<{ id: TabId; n: number; x: number; y: number } | null>(null);

  useEffect(() => setMoreOpen(false), [pathname]);
  const closeMore = useCallback(() => setMoreOpen(false), []);

  const current = moreOpen ? 'more' : activeTab(pathname);
  const index = TABS.findIndex((t) => t.id === current);
  const showIndicator = current !== null && current !== 'persona';

  const press = (id: TabId) => (e: React.PointerEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPressed((p) => ({ id, n: (p?.n ?? 0) + 1, x: e.clientX - rect.left, y: e.clientY - rect.top }));
  };

  if (!visible) return null;

  return (
    <>
      <nav
        aria-label="Main"
        className={cn(
          'fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 mx-auto max-w-md transition-[transform,opacity] duration-calm ease-gentle lg:hidden',
          typing ? 'pointer-events-none translate-y-[140%] opacity-0' : 'translate-y-0 opacity-100'
        )}
      >
        <div className="glass-bar relative grid h-16 grid-cols-5 items-center rounded-[1.75rem] px-1.5">
          {/* Sliding active indicator */}
          <span
            aria-hidden
            className={cn(
              'pointer-events-none absolute inset-y-1.5 left-1.5 w-[calc((100%-0.75rem)/5)] transition-[transform,opacity] duration-calm ease-gentle',
              showIndicator ? 'opacity-100' : 'opacity-0'
            )}
            style={{ transform: `translateX(${Math.max(index, 0) * 100}%)` }}
          >
            <span className="block h-full w-full rounded-[1.35rem] bg-lavender-soft shadow-[inset_0_0_0_1px_rgb(var(--c-lavender)/0.8)]" />
          </span>

          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = current === tab.id;
            const anim = pressed?.id === tab.id ? pressed.n : 0;
            const ripple =
              pressed?.id === tab.id ? (
                <span
                  key={`r${anim}`}
                  aria-hidden
                  className="tab-ripple pointer-events-none absolute h-24 w-24 rounded-full bg-lavender"
                  style={{ left: pressed.x, top: pressed.y }}
                />
              ) : null;

            if (tab.id === 'persona') {
              return (
                <Link
                  key={tab.id}
                  to={tab.to!}
                  onPointerDown={press(tab.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className="relative z-10 flex flex-col items-center justify-end gap-0.5 self-stretch pb-1.5 text-[0.68rem] font-semibold"
                >
                  <span
                    key={`p${anim}`}
                    className={cn(
                      'persona-glow pointer-events-none -mt-7 grid h-14 w-14 place-items-center rounded-full border-4 border-ivory text-white transition-colors duration-calm',
                      isActive ? 'bg-ink-strong' : 'bg-lavender-ink',
                      anim ? 'tab-pop' : ''
                    )}
                  >
                    <Icon className="h-6 w-6" strokeWidth={2.2} aria-hidden />
                  </span>
                  <span className={isActive ? 'text-ink-strong' : 'text-lavender-ink'}>{tab.label}</span>
                </Link>
              );
            }

            const inner = (
              <>
                {ripple}
                <span key={`i${anim}`} className={cn('pointer-events-none relative grid h-7 w-7 place-items-center', anim ? 'tab-pop' : '')}>
                  <Icon
                    className={cn('h-[1.35rem] w-[1.35rem] transition-colors duration-calm', isActive ? 'text-lavender-ink' : 'text-ink-soft')}
                    strokeWidth={isActive ? 2.4 : 1.9}
                    aria-hidden
                  />
                </span>
                <span className={cn('relative text-[0.68rem] font-semibold transition-colors duration-calm', isActive ? 'text-lavender-ink' : 'text-ink-soft')}>
                  {tab.label}
                </span>
              </>
            );
            const cls = 'relative z-10 flex h-full flex-col items-center justify-center gap-0.5 overflow-hidden rounded-[1.35rem] focus-visible:shadow-none focus-visible:ring-2 focus-visible:ring-lavender-ink';

            if (tab.id === 'more') {
              return (
                <button
                  key={tab.id}
                  type="button"
                  onPointerDown={press(tab.id)}
                  onClick={() => setMoreOpen((o) => !o)}
                  aria-expanded={moreOpen}
                  aria-controls="more-sheet"
                  aria-current={isActive && !moreOpen ? 'page' : undefined}
                  className={cls}
                >
                  {inner}
                </button>
              );
            }
            return (
              <Link key={tab.id} to={tab.to!} onPointerDown={press(tab.id)} aria-current={isActive ? 'page' : undefined} className={cls}>
                {inner}
              </Link>
            );
          })}
        </div>
      </nav>
      <MoreSheet open={moreOpen} onClose={closeMore} onUrgentHelp={onUrgentHelp} />
    </>
  );
}

/** Space reserved under the page so the floating bar never hides content. */
export function TabBarSpacer({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const visible = useTabBarVisible();
  if (!visible) return null;
  // Continues the footer's colour (or the page's, on footer-less layouts).
  return <div aria-hidden className={cn('h-[calc(6rem+env(safe-area-inset-bottom))] lg:hidden', tone === 'dark' ? 'bg-ink-strong' : 'bg-ivory')} />;
}
