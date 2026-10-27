import React, { lazy } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import SiteLayout from './components/layout/SiteLayout';
import { NotFoundPage, RouteError } from './components/layout/PageStates';

const HomePage = lazy(() => import('./pages/HomePage'));
const WhoWeArePage = lazy(() => import('./pages/WhoWeArePage'));
const ResourcesPage = lazy(() => import('./pages/resources/ResourcesPage'));
const ResourceArticlePage = lazy(() => import('./pages/resources/ResourceArticlePage'));
const TeamPage = lazy(() => import('./pages/team/TeamPage'));
const TeamMemberPage = lazy(() => import('./pages/team/TeamMemberPage'));
const SupportDirectoryPage = lazy(() => import('./pages/support/SupportDirectoryPage'));
const SupportGroupPage = lazy(() => import('./pages/support/SupportGroupPage'));
const ConcernPage = lazy(() => import('./pages/support/ConcernPage'));
const PersonaPage = lazy(() => import('./pages/persona/PersonaPage'));
const FindSupportPage = lazy(() => import('./pages/find/FindSupportPage'));
const BookPage = lazy(() => import('./pages/book/BookPage'));
const OrganisationsPage = lazy(() => import('./pages/organisations/OrganisationsPage'));
const OrgWorkspacePage = lazy(() => import('./pages/organisations/OrgWorkspacePage'));
const PortalPage = lazy(() => import('./pages/portal/PortalPage'));
const PractitionerPage = lazy(() => import('./pages/practitioner/PractitionerPage'));
const PrivacyPage = lazy(() => import('./pages/legal/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/legal/TermsPage'));
const AdminRoute = lazy(() => import('./components/AdminRoute'));
// Development-only design reference; tree-shaken from production builds.
const CompanionsGallery = import.meta.env.DEV ? lazy(() => import('./pages/dev/CompanionsGallery')) : null;

const siteRoutes: RouteObject[] = [
  { index: true, element: <HomePage /> },
  { path: 'who-we-are', element: <WhoWeArePage /> },
  { path: 'resources', element: <ResourcesPage /> },
  { path: 'resources/:slug', element: <ResourceArticlePage /> },
  { path: 'team', element: <TeamPage /> },
  { path: 'team/:slug', element: <TeamMemberPage /> },
  { path: 'support', element: <SupportDirectoryPage /> },
  { path: 'support/area/:groupId', element: <SupportGroupPage /> },
  { path: 'support/:slug', element: <ConcernPage /> },
  { path: 'find-support', element: <FindSupportPage /> },
  { path: 'book', element: <BookPage /> },
  { path: 'organisations', element: <OrganisationsPage /> },
  { path: 'organisations/workspace', element: <OrgWorkspacePage /> },
  { path: 'portal', element: <PortalPage /> },
  { path: 'practitioner', element: <PractitionerPage /> },
  { path: 'privacy', element: <PrivacyPage /> },
  { path: 'terms', element: <TermsPage /> },
  ...(CompanionsGallery ? [{ path: 'dev/companions', element: <CompanionsGallery /> }] : []),
  { path: '*', element: <NotFoundPage /> },
];

export const router = createBrowserRouter([
  { path: '/', element: <SiteLayout />, errorElement: <RouteError />, children: siteRoutes },
  // Persona is a focused, distraction-free space: header (with urgent help) but no footer.
  { path: '/persona', element: <SiteLayout bare />, errorElement: <RouteError />, children: [{ index: true, element: <PersonaPage /> }] },
  {
    path: '/admin',
    errorElement: <RouteError />,
    element: (
      <React.Suspense fallback={null}>
        <AdminRoute />
      </React.Suspense>
    ),
  },
]);
