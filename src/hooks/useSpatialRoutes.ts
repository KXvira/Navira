import { useEffect, useState } from 'react';
import { useAppData } from './AppData';
import type { RoutePoint } from '../types/route';

export function useSpatialRoutes() {
  const { routes } = useAppData();
  const [pointsByRoute, setPointsByRoute] = useState<Record<string, RoutePoint[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const savedIds = routes.routes.filter((route) => route.status === 'saved').map((route) => route.id).join('|');
  const loadPoints = routes.points;
  useEffect(() => {
    let cancelled = false;
    const ids = savedIds ? savedIds.split('|') : [];
    if (routes.loading) return;
    // Keep a failed read visible until the user retries; navigation may unmount this hook.
    void Promise.all(ids.map(async (id) => [id, await loadPoints(id)] as const)).then((pairs) => {
      if (!cancelled) { setPointsByRoute(Object.fromEntries(pairs)); setError(null); }
    }).catch((cause: unknown) => {
      if (!cancelled) {
        console.error('Map route load failed', cause);
        setPointsByRoute({}); setError('Saved routes could not be loaded.');
      }
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [savedIds, loadPoints, routes.loading, attempt]);
  return { pointsByRoute, error, loading: loading || routes.loading, retry: () => { setLoading(true); setError(null); setAttempt((value) => value + 1); } };
}
