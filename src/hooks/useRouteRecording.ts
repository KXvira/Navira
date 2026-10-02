import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import type { LocationObject } from 'expo-location';
import type { LocationPhase } from '../types/location';
import type { RecordedRoute, RoutePoint, RouteSample } from '../types/route';
import { routeRepository } from '../services/routeRepository';
import { shareRouteGpx } from '../services/routeExport';
import { activeElapsedAt } from '../utils/recordingState';
import { ROUTE_GAP_MS } from '../utils/routeSampling';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Route storage operation failed.';
}

export function useRouteRecording(reading: LocationObject | null, locationPhase: LocationPhase, now: number) {
  const [routes, setRoutes] = useState<RecordedRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [malformedRecordCount, setMalformedRecordCount] = useState(0);
  const draftRef = useRef<RecordedRoute | null>(null);
  const activeRef = useRef(AppState.currentState === 'active');
  const suspendedRef = useRef(false);
  const [suspendedAt, setSuspendedAt] = useState<number | null>(null);
  const suspendedAtRef = useRef<number | null>(null);
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const readyRef = useRef(false);
  const lastObservedAtRef = useRef<number | null>(null);
  const loadPoints = useCallback((id: string): Promise<RoutePoint[]> => routeRepository.points(id), []);

  function enqueue<T>(work: () => Promise<T>): Promise<T> {
    const result = queueRef.current.then(work, work);
    queueRef.current = result.then(() => undefined, () => undefined);
    return result;
  }
  function haltAfterWriteFailure(message: string) {
    suspendedRef.current = true;
    suspendedAtRef.current = Date.now();
    setSuspendedAt(suspendedAtRef.current);
    setError(`${message} Recording halted; retry pause before resuming.`);
  }
  function replace(route: RecordedRoute) {
    if (route.status !== 'saved') draftRef.current = route;
    else if (draftRef.current?.id === route.id) draftRef.current = null;
    setRoutes((previous) => [route, ...previous.filter((item) => item.id !== route.id)]);
  }
  async function run<T>(work: () => Promise<T>): Promise<T | null> {
    setBusy(true); setError(null); setNotice(null);
    try { return await enqueue(work); }
    catch (cause) { setError(errorMessage(cause)); return null; }
    finally { setBusy(false); }
  }

  useEffect(() => {
    let cancelled = false;
    void enqueue(async () => {
      await routeRepository.recoverInterrupted();
      const result = await routeRepository.list();
      if (cancelled) return;
      setRoutes(result.routes);
      setMalformedRecordCount(result.malformedRecordCount);
      draftRef.current = result.routes.find((item) => item.status !== 'saved') ?? null;
      readyRef.current = true;
      setLoading(false);
    }).catch((cause: unknown) => { if (!cancelled) { setError(errorMessage(cause)); setLoading(false); } });
    const listener = AppState.addEventListener('change', (state) => {
      activeRef.current = state === 'active';
      if (state !== 'active') {
        const pauseAt = Date.now();
        suspendedRef.current = true;
        suspendedAtRef.current = pauseAt;
        setSuspendedAt(pauseAt);
        void enqueue(async () => {
          const route = draftRef.current;
          if (route?.status !== 'recording') return;
          const paused = await routeRepository.pause(route.id, 'background', pauseAt);
          if (!cancelled) { replace(paused); setNotice('Recording paused when the app left the foreground. Resume explicitly.'); }
        }).catch((cause: unknown) => { if (!cancelled) setError(`Could not persist foreground pause: ${errorMessage(cause)}. Recording will be recovered as interrupted on restart.`); });
      }
    });
    return () => { cancelled = true; listener.remove(); };
  }, []);

  useEffect(() => {
    if (!reading || !activeRef.current || suspendedRef.current || !readyRef.current || locationPhase !== 'receiving') return;
    const sample: RouteSample = {
      latitude: reading.coords.latitude, longitude: reading.coords.longitude,
      altitude: reading.coords.altitude, horizontalAccuracy: reading.coords.accuracy,
      capturedAt: reading.timestamp,
    };
    if (draftRef.current?.status !== 'recording') return;
    const previousObservation = lastObservedAtRef.current;
    const receivedAt = Date.now();
    if (Number.isFinite(sample.capturedAt) && sample.capturedAt > 0 && sample.capturedAt <= receivedAt + 2_000 && receivedAt - sample.capturedAt < ROUTE_GAP_MS &&
      Number.isFinite(sample.latitude) && Math.abs(sample.latitude) <= 90 && Number.isFinite(sample.longitude) && Math.abs(sample.longitude) <= 180 &&
      (previousObservation === null || sample.capturedAt > previousObservation)) lastObservedAtRef.current = sample.capturedAt;
    void enqueue(async () => {
      const route = draftRef.current;
      if (!activeRef.current || suspendedRef.current || route?.status !== 'recording') return;
      const saved = await routeRepository.append(route.id, sample, Date.now(), previousObservation);
      if (saved) replace(saved);
    }).catch((cause: unknown) => haltAfterWriteFailure(`Point was not saved: ${errorMessage(cause)}.`));
  }, [reading, locationPhase]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (!activeRef.current || suspendedRef.current) return;
      void enqueue(async () => {
        const route = draftRef.current;
        if (!activeRef.current || suspendedRef.current || route?.status !== 'recording') return;
        const saved = await routeRepository.checkpoint(route.id, Date.now());
        replace(saved);
      }).catch((cause: unknown) => haltAfterWriteFailure(`Active time could not be saved: ${errorMessage(cause)}.`));
    }, 5_000);
    return () => clearInterval(timer);
  }, []);

  const draft = routes.find((item) => item.status !== 'saved') ?? null;
  return {
    routes, draft, loading, busy, error, notice, malformedRecordCount,
    elapsedActiveMs: draft ? activeElapsedAt(draft, suspendedAt === null ? now : Math.min(now, suspendedAt)) : 0,
    suspended: suspendedAt !== null && draft?.status === 'recording',
    reload: () => run(async () => {
      if (!readyRef.current) await routeRepository.recoverInterrupted();
      const result = await routeRepository.list();
      setRoutes(result.routes); setMalformedRecordCount(result.malformedRecordCount);
      draftRef.current = result.routes.find((item) => item.status !== 'saved') ?? null;
      readyRef.current = true;
      return true;
    }),
    start: () => run(async () => {
      if (!readyRef.current) throw new Error('Route storage is not ready. Reload routes first.');
      if (!activeRef.current || locationPhase !== 'receiving') throw new Error('A fresh foreground location is required to start.');
      if (draftRef.current) throw new Error('Finish the current route first.');
      const route = await routeRepository.create(Date.now()); replace(route); lastObservedAtRef.current = null; suspendedRef.current = false; suspendedAtRef.current = null; setSuspendedAt(null); return true;
    }),
    pause: () => run(async () => {
      const route = draftRef.current;
      if (!route || route.status !== 'recording') throw new Error('No active recording to pause.');
      replace(await routeRepository.pause(route.id, 'manual', suspendedAtRef.current ?? Date.now())); suspendedRef.current = true; suspendedAtRef.current = null; setSuspendedAt(null); return true;
    }),
    resume: () => run(async () => {
      const route = draftRef.current;
      if (!activeRef.current || locationPhase !== 'receiving') throw new Error('A fresh foreground location is required to resume.');
      if (!route || route.status !== 'paused') throw new Error('No paused recording to resume.');
      replace(await routeRepository.resume(route.id, Date.now())); lastObservedAtRef.current = null; suspendedRef.current = false; suspendedAtRef.current = null; setSuspendedAt(null); return true;
    }),
    stop: () => run(async () => {
      const route = draftRef.current;
      if (!route) throw new Error('No recording to stop.');
      replace(await routeRepository.stop(route.id, Date.now())); suspendedRef.current = true; suspendedAtRef.current = null; setSuspendedAt(null); return true;
    }),
    save: (name: string) => run(async () => {
      const route = draftRef.current;
      if (!route) throw new Error('No route to save.');
      replace(await routeRepository.save(route.id, name, Date.now()));
      setNotice('Route saved on this device.'); return true;
    }),
    remove: (id: string) => run(async () => {
      await routeRepository.delete(id);
      if (draftRef.current?.id === id) draftRef.current = null;
      setRoutes((previous) => previous.filter((item) => item.id !== id));
      setNotice('Route deleted.'); return true;
    }),
    points: loadPoints,
    exportGpx: (route: RecordedRoute) => run(async () => {
      const points = await routeRepository.points(route.id);
      await shareRouteGpx(route, points);
      return true;
    }),
  };
}
