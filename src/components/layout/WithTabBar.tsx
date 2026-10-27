import React, { useCallback, useState } from 'react';
import { TabBar, TabBarSpacer } from './TabBar';
import { UrgentHelpContext, UrgentHelpDialog } from './UrgentHelp';

/**
 * Adds the mobile tab bar (and the urgent-help dialog it can open) to screens
 * that don't use SiteLayout, such as the admin dashboard.
 */
export function WithTabBar({ children }: { children: React.ReactNode }) {
  const [urgentOpen, setUrgentOpen] = useState(false);
  const openUrgent = useCallback(() => setUrgentOpen(true), []);
  return (
    <UrgentHelpContext.Provider value={openUrgent}>
      {children}
      <TabBarSpacer tone="light" />
      <TabBar onUrgentHelp={openUrgent} />
      <UrgentHelpDialog open={urgentOpen} onClose={() => setUrgentOpen(false)} />
    </UrgentHelpContext.Provider>
  );
}
