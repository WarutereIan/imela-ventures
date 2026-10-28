import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { StaffCase } from '../../domain/personaPortal/types';

const authState = {
  session: {},
  user: { id: 'me-1' },
  loading: false,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(async () => {}),
};
let roles: string[] = ['practitioner'];

vi.mock('../../lib/config', () => ({
  config: { platformDbReady: true, clientPortalEnabled: false, personaAiEnabled: false, personaPortalEnabled: true, personaLoginDomain: 'x.invalid' },
}));

vi.mock('../../lib/auth', () => ({
  useAuth: () => authState,
  useRoles: () => ({ roles, loading: false, error: null, dbReady: true }),
}));

vi.mock('../../domain/resources', () => ({
  useResources: () => ({ resources: [], loading: false, cmsUnavailable: false }),
}));

const api = vi.hoisted(() => ({
  listStaffCases: vi.fn(),
  openStaffCase: vi.fn(),
  sendStaffReply: vi.fn(),
  addCaseNote: vi.fn(),
  assignCaseResource: vi.fn(),
  assignCase: vi.fn(),
  setCaseStatus: vi.fn(),
  setCaseUrgency: vi.fn(),
  setFollowUp: vi.fn(),
  listCounsellors: vi.fn(async () => ({ ok: true, data: [{ user_id: 'c-2', display_name: 'Counsellor Two' }] })),
  getWorkload: vi.fn(async () => ({ ok: true, data: [] })),
  listTriageRules: vi.fn(async () => ({ ok: true, data: [] })),
  updateTriageRule: vi.fn(),
  listPersonaAudit: vi.fn(async () => ({ ok: true, data: [] })),
}));
vi.mock('../../domain/personaPortal/staffApi', () => api);

import StaffCasesPage from '../../pages/staff/StaffCasesPage';
import StaffCasePage from '../../pages/staff/StaffCasePage';
import StaffPersonaAdminPage from '../../pages/staff/StaffPersonaAdminPage';

const now = new Date().toISOString();
function makeCase(over: Partial<StaffCase>): StaffCase {
  return {
    id: 'case-1',
    persona_user_id: 'p-1',
    persona_code: 'IMP-AAAA-BBBB-CCCC',
    concerns: ['stress-anxiety'],
    story: 'Work has been really hard.',
    preferred_support: 'written',
    status: 'awaiting_review',
    urgency: 'routine',
    urgency_reason: null,
    queue: 'emotional-wellbeing',
    assigned_to: null,
    follow_up_on: null,
    created_at: now,
    updated_at: now,
    last_persona_activity: now,
    first_response_at: null,
    last_staff_reply_at: null,
    closed_at: null,
    ...over,
  };
}

function renderCase(c: StaffCase) {
  api.openStaffCase.mockResolvedValue({ ok: true, data: { case: c, messages: [], notes: [], resources: [] } });
  return render(
    <MemoryRouter initialEntries={[`/staff/persona/${c.id}`]}>
      <Routes>
        <Route path="/staff/persona/:caseId" element={<StaffCasePage />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  roles = ['practitioner'];
  Object.values(api).forEach((fn) => (fn as ReturnType<typeof vi.fn>).mockClear());
});

describe('Staff cases list', () => {
  it('pins crisis-review cases first and shows the reason', async () => {
    api.listStaffCases.mockResolvedValue({
      ok: true,
      data: [
        makeCase({ id: 'a', persona_code: 'IMP-ROUT-INE0-0001' }),
        makeCase({ id: 'b', persona_code: 'IMP-CR1S-1S00-0002', urgency: 'crisis_review', urgency_reason: 'possible risk language — needs prompt human review' }),
      ],
    });
    render(
      <MemoryRouter>
        <StaffCasesPage />
      </MemoryRouter>
    );
    expect(await screen.findByText(/Needs prompt human review/)).toBeInTheDocument();
    expect(screen.getByText(/Cases are identified only by Persona ID/)).toBeInTheDocument();
    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('IMP-CR1S-1S00-0002');
    expect(rows[0]).toHaveTextContent('possible risk language');
    expect(rows[1]).toHaveTextContent('IMP-ROUT-INE0-0001');
  });

  it('offers the All tab only to admins', async () => {
    api.listStaffCases.mockResolvedValue({ ok: true, data: [] });
    const { unmount } = render(
      <MemoryRouter>
        <StaffCasesPage />
      </MemoryRouter>
    );
    await screen.findByText(/queue is clear/);
    expect(screen.queryByRole('tab', { name: 'All cases' })).not.toBeInTheDocument();
    unmount();
    roles = ['admin'];
    render(
      <MemoryRouter>
        <StaffCasesPage />
      </MemoryRouter>
    );
    expect(await screen.findByRole('tab', { name: 'All cases' })).toBeInTheDocument();
  });
});

describe('Staff case view', () => {
  it('records access and hides the reply box on an unassigned case until it is picked up', async () => {
    api.assignCase.mockResolvedValue({ ok: true, data: null });
    renderCase(makeCase({ assigned_to: null }));
    expect(await screen.findByText(/Your access to this case is recorded/)).toBeInTheDocument();
    expect(api.openStaffCase).toHaveBeenCalledWith('case-1');
    expect(screen.queryByLabelText(/Reply to the person/)).not.toBeInTheDocument();
    const pickUp = screen.getByRole('button', { name: 'Pick up this case' });
    await userEvent.click(pickUp);
    expect(api.assignCase).toHaveBeenCalledWith('case-1', 'me-1');
  });

  it('shows the reply box to the assigned counsellor and labels notes as internal', async () => {
    renderCase(makeCase({ assigned_to: 'me-1', status: 'in_progress' }));
    expect(await screen.findByLabelText(/Reply to the person/)).toBeInTheDocument();
    expect(screen.getByText(/Internal — never visible to the person/)).toBeInTheDocument();
  });

  it('requires a reason before changing urgency', async () => {
    renderCase(makeCase({ assigned_to: 'me-1', status: 'in_progress' }));
    await screen.findByLabelText(/Reply to the person/);
    await userEvent.selectOptions(screen.getByLabelText('Urgency'), 'priority');
    await userEvent.click(screen.getByRole('button', { name: 'Update urgency' }));
    expect(screen.getByText(/Please give a short reason/)).toBeInTheDocument();
    expect(api.setCaseUrgency).not.toHaveBeenCalled();
    api.setCaseUrgency.mockResolvedValue({ ok: true, data: null });
    await userEvent.type(screen.getByLabelText('Reason'), 'Spoke with clinical lead');
    await userEvent.click(screen.getByRole('button', { name: 'Update urgency' }));
    expect(api.setCaseUrgency).toHaveBeenCalledWith('case-1', 'priority', 'Spoke with clinical lead');
  });

  it('shows safety guidance on crisis cases and inserts a contacts message for staff to review', async () => {
    renderCase(makeCase({ assigned_to: 'me-1', status: 'in_progress', urgency: 'crisis_review', urgency_reason: 'possible risk language' }));
    expect(await screen.findByText(/Imela to confirm its safeguarding procedure/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Insert emergency-contacts message/ }));
    const box = screen.getByLabelText(/Reply to the person/) as HTMLTextAreaElement;
    expect(box.value).toContain('999');
    expect(api.sendStaffReply).not.toHaveBeenCalled();
  });

  it('reports a permission error honestly', async () => {
    api.sendStaffReply.mockResolvedValue({ ok: false, reason: 'forbidden' });
    renderCase(makeCase({ assigned_to: 'me-1', status: 'in_progress' }));
    await userEvent.type(await screen.findByLabelText(/Reply to the person/), 'Hello');
    await userEvent.click(screen.getByRole('button', { name: /Send reply/ }));
    expect(await screen.findByText("You don't have permission for this case.")).toBeInTheDocument();
  });
});

describe('Admin page', () => {
  it('is denied to practitioners', async () => {
    render(
      <MemoryRouter>
        <StaffPersonaAdminPage />
      </MemoryRouter>
    );
    expect(await screen.findByText(/This area is for Imela administrators/)).toBeInTheDocument();
    expect(api.getWorkload).not.toHaveBeenCalled();
  });

  it('shows workload, triage rules and audit history to admins', async () => {
    roles = ['admin'];
    render(
      <MemoryRouter>
        <StaffPersonaAdminPage />
      </MemoryRouter>
    );
    expect(await screen.findByRole('heading', { name: 'Workload' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Triage rules' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Access & activity history' })).toBeInTheDocument();
    expect(screen.getByText(/Persona logins can never hold a staff role/)).toBeInTheDocument();
  });
});
