import { useEffect, useState } from 'react';
import { useAppData } from './AppData';
import type { RoutePoint } from '../types/route';

export function useSpatialRoutes() {
  const { routes } = useAppData();
  const [pointsByRoute, setPointsByRoute] = useState<Record<string, RoutePoint[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const savedIds = routes.routes.filter((route) => route.status === 'saved').map((route) => route.id).join('|');
  const loadPoints = routes.points;
  useEffect(() => {
    let cancelled = false;
    const ids = savedIds ? savedIds.split('|') : [];
    if (routes.loading) return;
    void Promise.all(ids.map(async (id) => [id, await loadPoints(id)] as const)).then((pairs) => {
      if (!cancelled) { setPointsByRoute(Object.fromEntries(pairs)); setError(null); }
    }).catch((cause: unknown) => {
      if (!cancelled) { setPointsByRoute({}); setError(cause instanceof Error ? cause.message : 'Saved routes could not be loaded.'); }
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [savedIds, loadPoints, routes.loading]);
  return { pointsByRoute, error, loading: loading || routes.loading };
}
