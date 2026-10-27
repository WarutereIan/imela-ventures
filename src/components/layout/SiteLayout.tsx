import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { UrgentHelpContext, UrgentHelpDialog } from './UrgentHelp';
import { PageLoader } from './PageStates';
import { TabBar, TabBarSpacer } from './TabBar';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

const SiteLayout: React.FC<{ bare?: boolean }> = ({ bare = false }) => {
  const { pathname } = useLocation();
  const [urgentOpen, setUrgentOpen] = useState(false);
  const openUrgent = useCallback(() => setUrgentOpen(true), []);

  return (
    <UrgentHelpContext.Provider value={openUrgent}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-pill focus:bg-ink-strong focus:px-4 focus:py-2 focus:text-ivory"
      >
        Skip to content
      </a>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
          <Suspense fallback={<PageLoader />}>
            {/* Keyed by path so each page gently fades in as you move around. */}
            <div key={pathname} className="page-enter">
              <Outlet />
            </div>
          </Suspense>
        </main>
        {!bare && <Footer />}
        <TabBarSpacer tone={bare ? 'light' : 'dark'} />
      </div>
      <TabBar onUrgentHelp={openUrgent} />
      <UrgentHelpDialog open={urgentOpen} onClose={() => setUrgentOpen(false)} />
    </UrgentHelpContext.Provider>
  );
};

export default SiteLayout;
