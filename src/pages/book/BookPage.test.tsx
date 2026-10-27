import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import BookPage from './BookPage';

const requestBooking = vi.fn();

vi.mock('../../domain/booking/api', () => ({
  requestBooking: (...args: unknown[]) => requestBooking(...args),
  fetchAvailability: vi.fn(async () => ({ booked: new Set<string>(), closed: new Set<string>(), source: 'live' })),
  sendEnquiry: vi.fn(),
  enquiryMailto: vi.fn(() => 'mailto:x'),
}));

async function fillToReview() {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={['/book?service=individual-adult']}>
      <BookPage />
    </MemoryRouter>
  );
  const times = await screen.findAllByRole('button', { name: '09:00 AM' });
  await user.click(times[0]);
  await user.click(screen.getByRole('button', { name: /^Continue/ }));
  await user.type(screen.getByLabelText(/Your name/), 'Amani');
  await user.type(screen.getByLabelText(/^Email/), 'amani@example.com');
  await user.type(screen.getByLabelText(/^Phone/), '+254 712 345 678');
  await user.click(screen.getByRole('checkbox'));
  await user.click(screen.getByRole('button', { name: /^Review/ }));
  await user.click(screen.getByRole('button', { name: /Send request/ }));
  return user;
}

describe('BookPage', () => {
  beforeEach(() => requestBooking.mockReset());

  it('blocks submission until details and consent are valid', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/book?service=individual-adult']}>
        <BookPage />
      </MemoryRouter>
    );
    const times = await screen.findAllByRole('button', { name: '10:00 AM' });
    await user.click(times[0]);
    await user.click(screen.getByRole('button', { name: /^Continue/ }));
    await user.click(screen.getByRole('button', { name: /^Review/ }));
    expect(screen.getByText(/tell us what to call you/i)).toBeInTheDocument();
    expect(screen.getByText(/Please confirm so we can store/)).toBeInTheDocument();
    expect(requestBooking).not.toHaveBeenCalled();
  });

  it('shows confirmation only after the backend accepts the request', async () => {
    requestBooking.mockResolvedValue({ ok: true, id: 'abcdef12-0000-0000-0000-000000000000', notified: true });
    await fillToReview();
    expect(await screen.findByText('Your request has been received.')).toBeInTheDocument();
    expect(screen.getByText(/isn't confirmed yet/)).toBeInTheDocument();
    expect(requestBooking).toHaveBeenCalledTimes(1);
  });

  it('never shows success when the request fails', async () => {
    requestBooking.mockResolvedValue({ ok: false, reason: 'network' });
    await fillToReview();
    expect(await screen.findByText("Your request wasn't sent")).toBeInTheDocument();
    expect(screen.queryByText('Your request has been received.')).not.toBeInTheDocument();
  });

  it('returns to time selection when the slot was taken concurrently', async () => {
    requestBooking.mockResolvedValue({ ok: false, reason: 'slot_taken' });
    await fillToReview();
    await waitFor(() => expect(screen.getByText(/Someone has just requested that time/)).toBeInTheDocument());
    expect(screen.getByRole('heading', { name: /Choose a time/ })).toBeInTheDocument();
  });

  it('offers a consultation instead of booking an unverified service', async () => {
    render(
      <MemoryRouter initialEntries={['/book?service=trauma-therapy']}>
        <BookPage />
      </MemoryRouter>
    );
    expect(await screen.findByText(/isn't bookable yet/)).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Initial Consultation/ })).toBeChecked();
  });
});
