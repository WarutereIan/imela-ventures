import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const state = vi.hoisted(() => ({
  available: true,
  session: { status: 'signed_in', personaCode: 'IMP-7K3Q-9XWD-2MRA', userId: 'u1' } as Record<string, unknown>,
}));

const api = vi.hoisted(() => ({
  registerPersona: vi.fn(),
  signInPersona: vi.fn(),
  signOutPersona: vi.fn(async () => {}),
  listMyCases: vi.fn(),
  getMyCase: vi.fn(),
  createCase: vi.fn(),
  closeMyCase: vi.fn(),
  listMessages: vi.fn(),
  sendMessage: vi.fn(),
  listCaseResources: vi.fn(),
  rotateRecoverySecret: vi.fn(),
  deletePersona: vi.fn(),
}));

vi.mock('../../domain/personaPortal/api', () => ({
  ...api,
  get portalAvailable() {
    return state.available;
  },
  usePersonaSession: () => state.session,
  STORY_LIMIT: 6000,
  MESSAGE_LIMIT: 5000,
}));

import PortalLandingPage from '../../pages/persona/portal/PortalLandingPage';
import CreatePersonaPage from '../../pages/persona/portal/CreatePersonaPage';
import AccessPage from '../../pages/persona/portal/AccessPage';
import SpacePage from '../../pages/persona/portal/SpacePage';
import CaseThreadPage from '../../pages/persona/portal/CaseThreadPage';

const SECRET = 'ABCDE0123456789FGHJKMNPQRSTVWX'; // canonical, ends in "STVWX"

function at(path: string, element: React.ReactNode, routePath = path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={routePath} element={element} />
        <Route path="*" element={<p>other page</p>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  state.available = true;
  state.session = { status: 'signed_in', personaCode: 'IMP-7K3Q-9XWD-2MRA', userId: 'u1' };
  Object.values(api).forEach((fn) => fn.mockReset());
  api.signOutPersona.mockResolvedValue(undefined);
});

describe('Persona portal landing', () => {
  it('offers the anonymous counselling paths when available', () => {
    at('/persona', <PortalLandingPage />);
    expect(screen.getByRole('link', { name: /Get my Persona ID/ })).toHaveAttribute('href', '/persona/start');
    expect(screen.getByRole('link', { name: /I already have one/ })).toHaveAttribute('href', '/persona/access');
    expect(screen.getByText('999 or 112')).toBeInTheDocument();
    expect(screen.getByText(/Not absolute anonymity/)).toBeInTheDocument();
  });

  it('shows an honest "being set up" state instead of fake sign-up when unavailable', () => {
    state.available = false;
    at('/persona', <PortalLandingPage />);
    expect(screen.getByText(/Anonymous counselling is being set up/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Get my Persona ID/ })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Explore privately first/ })).toHaveAttribute('href', '/persona/explore');
  });
});

describe('Create Persona wizard', () => {
  async function toCredentials() {
    const user = userEvent.setup();
    api.registerPersona.mockResolvedValue({ ok: true, data: { personaCode: 'IMP-7K3Q-9XWD-2MRA', recoverySecret: SECRET } });
    at('/persona/start', <CreatePersonaPage />);
    const get = screen.getByRole('button', { name: /Get my Persona ID/ });
    await user.click(get);
    expect(screen.getByRole('alert')).toHaveTextContent(/tick the box/);
    expect(api.registerPersona).not.toHaveBeenCalled();
    await user.click(screen.getByRole('checkbox', { name: /I understand/ }));
    await user.click(get);
    await screen.findByText('IMP-7K3Q-9XWD-2MRA');
    return user;
  }

  async function toConcerns(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('checkbox', { name: /I've saved/ }));
    api.signInPersona.mockResolvedValue({ ok: true, data: { personaCode: 'IMP-7K3Q-9XWD-2MRA' } });
    await user.click(screen.getByRole('button', { name: /^Continue/ }));
    await screen.findByRole('heading', { name: /Choose what feels closest/ });
  }

  it('shows the secret once and asks the person to save it before continuing', async () => {
    const user = await toCredentials();
    expect(screen.getByText('ABCDE-01234-56789-FGHJK-MNPQR-STVWX')).toBeInTheDocument();
    const next = screen.getByRole('button', { name: /^Continue/ });

    await user.click(next);
    expect(screen.getByRole('alert')).toHaveTextContent(/Copy or download/);
    expect(api.signInPersona).not.toHaveBeenCalled();

    await toConcerns(user);
    expect(api.signInPersona).toHaveBeenCalledWith('IMP-7K3Q-9XWD-2MRA', SECRET, false);
  });

  it('requires at least one concern, then sends the case and confirms only after success', async () => {
    const user = await toCredentials();
    await toConcerns(user);

    await user.click(screen.getByRole('button', { name: /Choose at least one/ }));
    expect(screen.getByRole('alert')).toHaveTextContent(/at least one area/);

    await user.click(screen.getByRole('checkbox', { name: /Grief and loss/ }));
    await user.click(screen.getByRole('button', { name: /Continue · 1 chosen/ }));

    api.createCase.mockResolvedValueOnce({ ok: false, reason: 'network' });
    await user.click(screen.getByRole('button', { name: /Send to a counsellor/ }));
    expect(await screen.findByText(/nothing has been sent/)).toBeInTheDocument();
    expect(screen.queryByText(/Awaiting review/)).not.toBeInTheDocument();

    api.createCase.mockResolvedValueOnce({ ok: true, data: { id: 'case-1' } });
    await user.click(screen.getByRole('button', { name: /Send to a counsellor/ }));
    expect(await screen.findByText(/Status: Awaiting review/)).toBeInTheDocument();
    expect(api.createCase).toHaveBeenLastCalledWith({ concerns: ['grief-loss'], story: '', preferredSupport: 'not_sure' });
    expect(screen.getByText(/can't notify you/)).toBeInTheDocument();
  });

  it('shows crisis contacts when the story suggests risk, without blocking it', async () => {
    const user = await toCredentials();
    await toConcerns(user);
    await user.click(screen.getByRole('checkbox', { name: /Stress and anxiety/ }));
    await user.click(screen.getByRole('button', { name: /Continue/ }));
    await user.type(screen.getByLabelText(/What's been happening/), "I don't want to live anymore");
    expect(screen.getByText('999 or 112')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send to a counsellor/ })).toBeEnabled();
  });
});

describe('Access page', () => {
  it('shows one generic message for wrong credentials and never says which part was wrong', async () => {
    const user = userEvent.setup();
    api.signInPersona.mockResolvedValue({ ok: false, reason: 'wrong_credentials' });
    at('/persona/access', <AccessPage />);
    await user.type(screen.getByLabelText('Persona ID'), 'IMP-7K3Q-9XWD-2MRA');
    await user.type(screen.getByLabelText('Recovery secret'), 'ABCDE-01234-56789-FGHJK-MNPQR-STVWX');
    await user.click(screen.getByRole('button', { name: /Open my space/ }));
    const alert = await screen.findByText("That ID and secret don't match. Please check what you saved and try again.");
    expect(alert).toBeInTheDocument();
    expect(screen.queryByText(/ID is wrong|secret is wrong|incorrect secret|unknown ID/i)).not.toBeInTheDocument();
    expect(api.signInPersona).toHaveBeenCalledWith('IMP-7K3Q-9XWD-2MRA', 'ABCDE-01234-56789-FGHJK-MNPQR-STVWX', false);
  });

  it('keeps the secret hidden by default and lets the person reveal it', async () => {
    const user = userEvent.setup();
    at('/persona/access', <AccessPage />);
    expect(screen.getByLabelText('Recovery secret')).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: 'Show recovery secret' }));
    expect(screen.getByLabelText('Recovery secret')).toHaveAttribute('type', 'text');
  });
});

describe('Signed-in space', () => {
  it('prompts to sign in when there is no Persona session', () => {
    state.session = { status: 'signed_out' };
    at('/persona/space', <SpacePage />);
    expect(screen.getByRole('heading', { name: /Please sign in/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sign in with my Persona ID/ })).toHaveAttribute('href', '/persona/access');
    expect(api.listMyCases).not.toHaveBeenCalled();
  });

  it('lists conversations with their status', async () => {
    api.listMyCases.mockResolvedValue({
      ok: true,
      data: [
        {
          id: 'c1',
          concerns: ['grief-loss'],
          story: null,
          preferred_support: 'written',
          status: 'counsellor_replied',
          has_counsellor: true,
          created_at: '2026-10-20T10:00:00Z',
          updated_at: '2026-10-21T10:00:00Z',
          last_staff_reply_at: '2026-10-21T10:00:00Z',
          closed_at: null,
        },
      ],
    });
    at('/persona/space', <SpacePage />);
    expect(await screen.findByText('Counsellor replied')).toBeInTheDocument();
    expect(screen.getByText('New reply for you')).toBeInTheDocument();
    expect(screen.getByText('IMP-7K3Q-9XWD-2MRA')).toBeInTheDocument();
  });

  it('disables the composer on a closed conversation', async () => {
    api.getMyCase.mockResolvedValue({
      ok: true,
      data: {
        id: 'c1',
        concerns: ['stress-anxiety'],
        story: 'hello',
        preferred_support: 'written',
        status: 'closed',
        has_counsellor: true,
        created_at: '2026-10-20T10:00:00Z',
        updated_at: '2026-10-21T10:00:00Z',
        last_staff_reply_at: null,
        closed_at: '2026-10-21T10:00:00Z',
      },
    });
    api.listMessages.mockResolvedValue({ ok: true, data: [{ id: 'm1', sender_role: 'counsellor', body: 'Take care', created_at: '2026-10-21T09:00:00Z' }] });
    api.listCaseResources.mockResolvedValue({ ok: true, data: [] });
    at('/persona/space/c1', <CaseThreadPage />, '/persona/space/:caseId');
    expect(await screen.findByText('Take care')).toBeInTheDocument();
    expect(screen.getByLabelText('Your message')).toBeDisabled();
    expect(screen.getByRole('button', { name: /Send/ })).toBeDisabled();
  });

  it('treats a conversation it cannot read as not found', async () => {
    api.getMyCase.mockResolvedValue({ ok: false, reason: 'not_found' });
    at('/persona/space/other', <CaseThreadPage />, '/persona/space/:caseId');
    await waitFor(() => expect(screen.getByRole('heading', { name: /couldn't find that conversation/ })).toBeInTheDocument());
    expect(api.listMessages).not.toHaveBeenCalled();
  });
});
