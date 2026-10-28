import React, { lazy } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import SiteLayout from './components/layout/SiteLayout';
import { NotFoundPage, PageLoader, RouteError } from './components/layout/PageStates';

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
const PortalLandingPage = lazy(() => import('./pages/persona/portal/PortalLandingPage'));
const CreatePersonaPage = lazy(() => import('./pages/persona/portal/CreatePersonaPage'));
const AccessPage = lazy(() => import('./pages/persona/portal/AccessPage'));
const SpacePage = lazy(() => import('./pages/persona/portal/SpacePage'));
const CaseThreadPage = lazy(() => import('./pages/persona/portal/CaseThreadPage'));
const SpaceResourcesPage = lazy(() => import('./pages/persona/portal/SpaceResourcesPage'));
const SpaceSettingsPage = lazy(() => import('./pages/persona/portal/SpaceSettingsPage'));
const StaffCasesPage = lazy(() => import('./pages/staff/StaffCasesPage'));
const StaffCasePage = lazy(() => import('./pages/staff/StaffCasePage'));
const StaffPersonaAdminPage = lazy(() => import('./pages/staff/StaffPersonaAdminPage'));
const FindSupportPage = lazy(() => import('./pages/find/FindSupportPage'));
const BookPage = lazy(() => import('./pages/book/BookPage'));
const OrganisationsPage = lazy(() => import('./pages/organisations/OrganisationsPage'));
const OrgWorkspacePage = lazy(() => import('./pages/organisations/OrgWorkspacePage'));
const PortalPage = lazy(() => import('./pages/portal/PortalPage'));
const PractitionerPage = lazy(() => import('./pages/practitioner/PractitionerPage'));
const PrivacyPage = lazy(() => import('./pages/legal/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/legal/TermsPage'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminOverview = lazy(() => import('./pages/admin/OverviewPage'));
const AdminBookings = lazy(() => import('./pages/admin/BookingsPage'));
const AdminEnquiries = lazy(() => import('./pages/admin/EnquiriesPage'));
const AdminArticles = lazy(() => import('./pages/admin/ArticlesPage'));
const AdminAvailability = lazy(() => import('./pages/admin/AvailabilityPage'));
const AdminNotifications = lazy(() => import('./pages/admin/NotificationsPage'));
const AdminTeam = lazy(() => import('./pages/admin/TeamPage'));
const AdminCases = lazy(() => import('./pages/admin/CasesPages').then((m) => ({ default: m.AdminCasesPage })));
const AdminCase = lazy(() => import('./pages/admin/CasesPages').then((m) => ({ default: m.AdminCasePage })));
const AdminCaseSettings = lazy(() => import('./pages/admin/CasesPages').then((m) => ({ default: m.AdminCaseSettingsPage })));

/** Admin sections load on demand; a light spinner shows meanwhile. */
const adminPage = (el: React.ReactNode) => <React.Suspense fallback={<PageLoader />}>{el}</React.Suspense>;
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
  { path: 'staff/persona', element: <StaffCasesPage /> },
  { path: 'staff/persona/admin', element: <StaffPersonaAdminPage /> },
  { path: 'staff/persona/:caseId', element: <StaffCasePage /> },
  { path: 'privacy', element: <PrivacyPage /> },
  { path: 'terms', element: <TermsPage /> },
  ...(CompanionsGallery ? [{ path: 'dev/companions', element: <CompanionsGallery /> }] : []),
  { path: '*', element: <NotFoundPage /> },
];

export const router = createBrowserRouter([
  { path: '/', element: <SiteLayout />, errorElement: <RouteError />, children: siteRoutes },
  // Persona is a focused, distraction-free space: header (with urgent help) but no footer.
  {
    path: '/persona',
    element: <SiteLayout bare />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <PortalLandingPage /> },
      // The guided, browser-only reflection tool ("explore privately first").
      { path: 'explore', element: <PersonaPage /> },
      { path: 'start', element: <CreatePersonaPage /> },
      { path: 'access', element: <AccessPage /> },
      { path: 'space', element: <SpacePage /> },
      { path: 'space/resources', element: <SpaceResourcesPage /> },
      { path: 'space/settings', element: <SpaceSettingsPage /> },
      { path: 'space/:caseId', element: <CaseThreadPage /> },
    ],
  },
  {
    // The admin console has its own sidebar and its own phone tab bar.
    path: '/admin',
    errorElement: <RouteError />,
    element: (
      <React.Suspense fallback={<PageLoader />}>
        <AdminLayout />
      </React.Suspense>
    ),
    children: [
      { index: true, element: adminPage(<AdminOverview />) },
      { path: 'bookings', element: adminPage(<AdminBookings />) },
      { path: 'cases', element: adminPage(<AdminCases />) },
      { path: 'cases/settings', element: adminPage(<AdminCaseSettings />) },
      { path: 'cases/:caseId', element: adminPage(<AdminCase />) },
      { path: 'enquiries', element: adminPage(<AdminEnquiries />) },
      { path: 'articles', element: adminPage(<AdminArticles />) },
      { path: 'availability', element: adminPage(<AdminAvailability />) },
      { path: 'notifications', element: adminPage(<AdminNotifications />) },
      { path: 'team', element: adminPage(<AdminTeam />) },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
