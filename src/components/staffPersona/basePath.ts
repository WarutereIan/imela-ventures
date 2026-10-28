import { createContext, useContext } from 'react';

/**
 * Where the case screens live. Counsellors use /staff/persona; the admin
 * console shows the same screens under /admin/cases.
 */
export const StaffBasePath = createContext('/staff/persona');

export function useStaffBase(): string {
  return useContext(StaffBasePath);
}
