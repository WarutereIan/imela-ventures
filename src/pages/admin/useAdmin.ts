import { createContext, useContext } from 'react';
import type { User } from '@supabase/supabase-js';
import type { AdminNotification, AdminSummary } from '../../domain/admin/api';

export interface Toast {
  id: number;
  tone: 'success' | 'danger' | 'warning' | 'info';
  text: string;
  href?: string;
}

export interface AdminState {
  user: User;
  signOut: () => Promise<void>;
  /** null while loading; 'missing' until migration 0008 is applied. */
  summary: AdminSummary | 'missing' | null;
  /** True when the database says this login is not an administrator (RLS then hides cases, bookings and enquiries). */
  notAdmin: boolean;
  notifications: AdminNotification[];
  unread: number;
  live: boolean;
  refresh: () => Promise<void>;
  markRead: (ids: string[] | 'all') => Promise<void>;
  toast: (t: Omit<Toast, 'id'>) => void;
}

export const AdminContext = createContext<AdminState | null>(null);

export function useAdmin(): AdminState {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used inside the admin console');
  return ctx;
}
