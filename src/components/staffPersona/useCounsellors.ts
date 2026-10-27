import { useCallback, useEffect, useState } from 'react';
import { listCounsellors } from '../../domain/personaPortal/staffApi';
import type { Counsellor } from '../../domain/personaPortal/types';

/** Counsellor directory for display names and assignment. */
export function useCounsellors(myUserId?: string) {
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);

  useEffect(() => {
    let active = true;
    listCounsellors().then((res) => {
      if (active && res.ok) setCounsellors(res.data);
    });
    return () => {
      active = false;
    };
  }, []);

  const nameFor = useCallback(
    (id: string | null) => {
      if (!id) return 'Unassigned';
      if (id === myUserId) return 'You';
      return counsellors.find((c) => c.user_id === id)?.display_name ?? `Staff ${id.slice(0, 6)}`;
    },
    [counsellors, myUserId]
  );

  return { counsellors, nameFor };
}
