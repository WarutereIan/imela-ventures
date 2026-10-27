import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { UrgentHelpContext, UrgentHelpDialog } from './UrgentHelp';
import { PageLoader } from './PageStates';

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
            <Outlet />
          </Suspense>
        </main>
        {!bare && <Footer />}
      </div>
      <UrgentHelpDialog open={urgentOpen} onClose={() => setUrgentOpen(false)} />
    </UrgentHelpContext.Provider>
  );
};

export default SiteLayout;
