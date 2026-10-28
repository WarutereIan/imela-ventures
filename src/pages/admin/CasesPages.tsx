import { Link, useParams } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { StaffBasePath } from '../../components/staffPersona/basePath';
import type { StaffContext } from '../../components/staffPersona/StaffGate';
import { buttonClasses } from '../../components/ui/Button';
import { CasesDashboard } from '../staff/StaffCasesPage';
import { CaseWorkspace } from '../staff/StaffCasePage';
import { AdminWorkspace } from '../staff/StaffPersonaAdminPage';
import { useAdmin } from './useAdmin';
import { AdminPageHeader } from './ui';

/** Admins use the same audited case screens as counsellors, inside the console. */
function useStaffContext(): StaffContext {
  const { user, signOut } = useAdmin();
  return { user, isAdmin: true, signOut };
}

export function AdminCasesPage() {
  const ctx = useStaffContext();
  return (
    <StaffBasePath.Provider value="/admin/cases">
      <div className="space-y-5">
        <AdminPageHeader
          title="Anonymous cases"
          lede="Messages from people using a Persona ID. Pick a case up, reply privately and keep internal notes. Urgent cases are pinned to the top."
          actions={
            <Link to="/admin/cases/settings" className={buttonClasses('soft', 'sm')}>
              <ShieldCheck className="h-4 w-4" aria-hidden /> Triage & audit
            </Link>
          }
        />
        <CasesDashboard ctx={ctx} />
      </div>
    </StaffBasePath.Provider>
  );
}

export function AdminCasePage() {
  const ctx = useStaffContext();
  const { caseId = '' } = useParams();
  return (
    <StaffBasePath.Provider value="/admin/cases">
      <CaseWorkspace ctx={ctx} caseId={caseId} />
    </StaffBasePath.Provider>
  );
}

export function AdminCaseSettingsPage() {
  const ctx = useStaffContext();
  return (
    <StaffBasePath.Provider value="/admin/cases">
      <div className="space-y-5">
        <AdminPageHeader title="Case settings" lede="Counsellor workload, transparent triage rules and the access history for anonymous cases." />
        <AdminWorkspace ctx={ctx} />
      </div>
    </StaffBasePath.Provider>
  );
}
