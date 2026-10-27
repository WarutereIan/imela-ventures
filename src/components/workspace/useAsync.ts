import { useCallback, useEffect, useState } from 'react';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Runs an async loader when its dependencies change. Errors are reduced to a
 * friendly message — raw database errors are never shown to people.
 */
export function useAsync<T>(loader: (() => Promise<T>) | null, deps: unknown[], friendlyError = 'We couldn’t load this right now.'): AsyncState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(Boolean(loader));
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!loader) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    loader()
      .then((d) => {
        if (active) setData(d);
      })
      .catch(() => {
        if (active) setError(friendlyError);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { data, loading, error, reload };
}

/** Throws on a Supabase error so useAsync can turn it into a friendly message. */
export function unwrap<T>(res: { data: unknown; error: unknown }): T {
  if (res.error) throw res.error;
  return (res.data ?? ([] as unknown)) as T;
}
