import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import type { AdminSummary, Booking } from '../../domain/admin/api';
import { AdminContext, type AdminState } from './useAdmin';
import { badgeFor, sectionFor } from './nav';
import { notificationBody } from './format';

const api = vi.hoisted(() => ({
  listBookings: vi.fn(),
  updateBooking: vi.fn(async () => ({ ok: true, data: null })),
  sendBookingConfirmation: vi.fn(async () => true),
}));

vi.mock('../../domain/admin/api', async (orig) => ({ ...(await orig<typeof import('../../domain/admin/api')>()), ...api }));

import BookingsPage from './BookingsPage';

const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
const booking = (over: Partial<Booking>): Booking => ({
  id: 'b1',
  customer_name: 'Wanjiru Kamau',
  email: 'w@example.com',
  phone: '0712345678',
  service: 'individual-adult',
  message: 'Feeling anxious at work',
  date: tomorrow,
  time: '10:00 AM',
  status: 'pending',
  admin_note: '',
  ...over,
});

const summary: AdminSummary = {
  bookings_pending: 2,
  bookings_today: 0,
  bookings_week: 3,
  bookings_by_day: [],
  enquiries_new: 1,
  cases_open: 3,
  cases_awaiting: 2,
  cases_unassigned: 2,
  cases_urgent: 0,
  cases_follow_up_due: 0,
  articles_published: 1,
  articles_draft: 0,
  article_views: 10,
  notifications_unread: 4,
};

function renderAdmin(path: string, el: React.ReactNode, toast = vi.fn()) {
  const state: AdminState = {
    user: { id: 'admin-1', email: 'admin@example.com' } as User,
    signOut: vi.fn(async () => {}),
    summary,
    notifications: [],
    unread: 0,
    live: false,
    refresh: vi.fn(async () => {}),
    markRead: vi.fn(async () => {}),
    toast,
  };
  render(
    <AdminContext.Provider value={state}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/admin/bookings" element={el} />
        </Routes>
      </MemoryRouter>
    </AdminContext.Provider>
  );
  return { toast };
}

describe('admin navigation', () => {
  it('maps paths to sections, with case settings separate from cases', () => {
    expect(sectionFor('/admin')).toBe('overview');
    expect(sectionFor('/admin/bookings')).toBe('bookings');
    expect(sectionFor('/admin/cases/abc')).toBe('cases');
    expect(sectionFor('/admin/cases/settings')).toBe('case-settings');
  });

  it('badges show what needs attention, urgent cases first', () => {
    expect(badgeFor('bookings', summary, 0)).toEqual({ count: 2 });
    expect(badgeFor('cases', summary, 0)).toEqual({ count: 2 });
    expect(badgeFor('cases', { ...summary, cases_urgent: 1 }, 0)).toEqual({ count: 1, urgent: true });
    expect(badgeFor('notifications', summary, 5)).toEqual({ count: 5 });
    expect(badgeFor('articles', summary, 0)).toBeNull();
  });

  it('shows readable names in notifications', () => {
    expect(notificationBody('Wanjiru · individual-adult · Thu 29 Oct at 10:00 AM')).toBe('Wanjiru · Individual Counselling — Adults · Thu 29 Oct at 10:00 AM');
    expect(notificationBody('grief-loss, stress-anxiety')).toBe('Grief and loss, Stress and anxiety');
  });
});

describe('Bookings', () => {
  beforeEach(() => {
    api.listBookings.mockResolvedValue({
      ok: true,
      data: [booking({}), booking({ id: 'b2', customer_name: 'Brian Mutua', status: 'confirmed' })],
    });
    api.updateBooking.mockClear();
    api.sendBookingConfirmation.mockClear();
  });

  it('lists requests needing confirmation and confirms one with an email', async () => {
    const user = userEvent.setup();
    const { toast } = renderAdmin('/admin/bookings', <BookingsPage />);
    expect(await screen.findByText('Wanjiru Kamau')).toBeInTheDocument();
    // "Needs confirming" view hides already-confirmed bookings.
    expect(screen.queryByText('Brian Mutua')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^Confirm$/ }));
    expect(api.updateBooking).toHaveBeenCalledWith('b1', { status: 'confirmed' });
    expect(api.sendBookingConfirmation).toHaveBeenCalledWith('b1');
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ tone: 'success' }));
  });

  it('opens the detail panel from a link and keeps an internal note', async () => {
    const user = userEvent.setup();
    renderAdmin('/admin/bookings?open=b1', <BookingsPage />);
    const panel = await screen.findByRole('dialog', { name: 'Wanjiru Kamau' });
    expect(within(panel).getByText('Feeling anxious at work')).toBeInTheDocument();
    expect(within(panel).getByRole('link', { name: /WhatsApp/ })).toHaveAttribute('href', 'https://wa.me/254712345678');

    await user.type(within(panel).getByLabelText(/Internal note/), 'Called, prefers mornings');
    await vi.waitFor(() => expect(api.updateBooking).toHaveBeenCalledWith('b1', { admin_note: 'Called, prefers mornings' }), { timeout: 3000 });
  });

  it('rolls back and reports when an update fails', async () => {
    api.updateBooking.mockResolvedValueOnce({ ok: false, reason: 'failed' } as never);
    const user = userEvent.setup();
    const { toast } = renderAdmin('/admin/bookings', <BookingsPage />);
    await user.click(await screen.findByRole('button', { name: /^Confirm$/ }));
    expect(api.sendBookingConfirmation).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ tone: 'danger' }));
    expect(screen.getByText('Wanjiru Kamau')).toBeInTheDocument();
  });
});
