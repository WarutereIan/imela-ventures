import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchAvailability, type AvailabilitySnapshot } from './api';
import { buildSchedule, nairobiDate, type DaySlots } from './slots';

export type AvailabilityState =
  | { status: 'loading' }
  | { status: 'ready'; snapshot: AvailabilitySnapshot; days: DaySlots[] }
  | { status: 'error'; days: DaySlots[] };

/** Loads booked/closed slots and builds the selectable schedule. */
export function useAvailability() {
  const today = useMemo(() => nairobiDate(new Date()), []);
  const [state, setState] = useState<AvailabilityState>({ status: 'loading' });

  const load = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const snapshot = await fetchAvailability(today);
      setState({ status: 'ready', snapshot, days: buildSchedule({ today, booked: snapshot.booked, closed: snapshot.closed }) });
    } catch {
      // Live availability failed; times can still be requested and are confirmed by the team.
      setState({ status: 'error', days: buildSchedule({ today, booked: new Set(), closed: new Set() }) });
    }
  }, [today]);

  useEffect(() => {
    void load();
  }, [load]);

  return { state, reload: load };
}

export function firstOpenSlot(days: DaySlots[]): { date: string; time: string } | null {
  for (const d of days) {
    const s = d.slots.find((x) => x.available);
    if (s) return { date: d.date, time: s.time };
  }
  return null;
}
