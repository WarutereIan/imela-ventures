import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EnquiryForm } from './EnquiryForm';
import { sendEnquiry } from '../../domain/booking/api';

vi.mock('../../domain/booking/api', () => ({
  sendEnquiry: vi.fn(),
  enquiryMailto: vi.fn(() => 'mailto:test@example.com'),
}));

const mockedSend = vi.mocked(sendEnquiry);

function fillValid() {
  fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: 'Achieng Otieno' } });
  fireEvent.change(screen.getByLabelText(/work email/i), { target: { value: 'achieng@example.co.ke' } });
  fireEvent.change(screen.getByLabelText(/^organisation/i), { target: { value: 'Example Ltd' } });
}

describe('EnquiryForm', () => {
  beforeEach(() => mockedSend.mockReset());

  it('shows validation errors on empty submit and does not send', async () => {
    render(<EnquiryForm />);
    fireEvent.click(screen.getByRole('button', { name: /send enquiry/i }));
    expect(await screen.findByText(/please check the form/i)).toBeInTheDocument();
    expect(screen.getByText(/what to call you/i)).toBeInTheDocument();
    expect(screen.getByText(/which organisation/i)).toBeInTheDocument();
    expect(mockedSend).not.toHaveBeenCalled();
  });

  it('never shows success when the insert fails', async () => {
    mockedSend.mockResolvedValue({ ok: false, reason: 'rejected' });
    render(<EnquiryForm />);
    fillValid();
    fireEvent.click(screen.getByRole('button', { name: /send enquiry/i }));
    expect(await screen.findByText(/wasn’t sent/i)).toBeInTheDocument();
    expect(screen.queryByText(/has been received/i)).not.toBeInTheDocument();
  });

  it('offers the email app honestly when the enquiries table is missing', async () => {
    mockedSend.mockResolvedValue({ ok: false, reason: 'table_missing' });
    render(<EnquiryForm />);
    fillValid();
    fireEvent.click(screen.getByRole('button', { name: /send enquiry/i }));
    expect(await screen.findByRole('link', { name: /open in your email app/i })).toBeInTheDocument();
    expect(screen.getByText(/nothing has been sent/i)).toBeInTheDocument();
    expect(screen.queryByText(/has been received/i)).not.toBeInTheDocument();
  });

  it('shows success only after a confirmed insert', async () => {
    mockedSend.mockResolvedValue({ ok: true });
    render(<EnquiryForm initialServiceId="culture-audit" />);
    fillValid();
    fireEvent.click(screen.getByRole('button', { name: /send enquiry/i }));
    await waitFor(() => expect(screen.getByText(/has been received/i)).toBeInTheDocument());
    expect(mockedSend).toHaveBeenCalledWith(expect.objectContaining({ kind: 'organisation', serviceId: 'culture-audit', organisation: 'Example Ltd' }));
  });
});
