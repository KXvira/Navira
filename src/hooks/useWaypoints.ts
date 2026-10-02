import { useCallback, useEffect, useState } from 'react';
import { waypointRepository } from '../services/waypointRepository';
import type { Waypoint, WaypointCapture, WaypointDraft } from '../types/waypoint';

export function useWaypoints() {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [writing, setWriting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [malformedRecordCount, setMalformedRecordCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await waypointRepository.list();
      setWaypoints(result.waypoints);
      setMalformedRecordCount(result.malformedRecordCount);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Saved waypoints could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void waypointRepository.list().then((result) => {
      if (cancelled) return;
      setWaypoints(result.waypoints);
      setMalformedRecordCount(result.malformedRecordCount);
    }).catch((loadError: unknown) => {
      if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Saved waypoints could not be loaded.');
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function runWrite(action: () => Promise<void>): Promise<boolean> {
    setWriting(true);
    setError(null);
    setNotice(null);
    try {
      await action();
      return true;
    } catch (writeError) {
      setError(writeError instanceof Error ? writeError.message : 'Waypoint could not be saved.');
      return false;
    } finally {
      setWriting(false);
    }
  }

  async function create(capture: WaypointCapture, draft: WaypointDraft): Promise<boolean> {
    return runWrite(async () => {
      const waypoint = await waypointRepository.create(capture, draft);
      setWaypoints((current) => [waypoint, ...current]);
      setNotice('Waypoint saved on this device.');
    });
  }

  async function update(id: string, draft: WaypointDraft): Promise<boolean> {
    return runWrite(async () => {
      const waypoint = await waypointRepository.update(id, draft);
      setWaypoints((current) => current.map((item) => item.id === id ? waypoint : item));
      setNotice('Waypoint changes saved.');
    });
  }

  async function remove(id: string): Promise<boolean> {
    return runWrite(async () => {
      await waypointRepository.delete(id);
      setWaypoints((current) => current.filter((item) => item.id !== id));
      setNotice('Waypoint deleted.');
    });
  }

  return { waypoints, loading, writing, error, notice, malformedRecordCount, reload: load, create, update, remove };
}
