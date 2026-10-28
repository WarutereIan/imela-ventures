import { Bell, CalendarDays, Clock, FileText, Inbox, LayoutDashboard, MessageCircleHeart, ShieldCheck, Users } from 'lucide-react';
import type React from 'react';
import type { AdminSummary } from '../../domain/admin/api';

export type AdminSection = 'overview' | 'bookings' | 'cases' | 'enquiries' | 'articles' | 'availability' | 'notifications' | 'team' | 'case-settings';

export interface AdminNavItem {
  id: AdminSection;
  label: string;
  to: string;
  icon: React.ElementType;
  hint: string;
}

export const ADMIN_NAV: AdminNavItem[] = [
  { id: 'overview', label: 'Overview', to: '/admin', icon: LayoutDashboard, hint: 'Today at a glance' },
  { id: 'bookings', label: 'Bookings', to: '/admin/bookings', icon: CalendarDays, hint: 'Requests & sessions' },
  { id: 'cases', label: 'Cases', to: '/admin/cases', icon: MessageCircleHeart, hint: 'Anonymous counselling' },
  { id: 'enquiries', label: 'Enquiries', to: '/admin/enquiries', icon: Inbox, hint: 'Workplace & service requests' },
  { id: 'articles', label: 'Articles', to: '/admin/articles', icon: FileText, hint: 'Resources library' },
  { id: 'availability', label: 'Availability', to: '/admin/availability', icon: Clock, hint: 'Hours & closed days' },
  { id: 'notifications', label: 'Notifications', to: '/admin/notifications', icon: Bell, hint: 'Inbox & email alerts' },
  { id: 'team', label: 'Team & access', to: '/admin/team', icon: Users, hint: 'Admins & counsellors' },
  { id: 'case-settings', label: 'Case settings', to: '/admin/cases/settings', icon: ShieldCheck, hint: 'Triage rules & audit' },
];

/** Sections that live behind "More" in the phone tab bar. */
export const MORE_SECTIONS: AdminSection[] = ['articles', 'availability', 'notifications', 'team', 'case-settings'];

export function sectionFor(pathname: string): AdminSection {
  if (pathname.startsWith('/admin/cases/settings')) return 'case-settings';
  const hit = ADMIN_NAV.filter((n) => n.id !== 'overview').find((n) => pathname.startsWith(n.to));
  return hit?.id ?? 'overview';
}

export interface Badge {
  count: number;
  urgent?: boolean;
}

export function badgeFor(id: AdminSection, summary: AdminSummary | null, unread: number): Badge | null {
  if (id === 'notifications') return unread ? { count: unread } : null;
  if (!summary) return null;
  if (id === 'bookings') return summary.bookings_pending ? { count: summary.bookings_pending } : null;
  if (id === 'enquiries') return summary.enquiries_new ? { count: summary.enquiries_new } : null;
  if (id === 'cases') {
    if (summary.cases_urgent) return { count: summary.cases_urgent, urgent: true };
    return summary.cases_awaiting ? { count: summary.cases_awaiting } : null;
  }
  return null;
}
