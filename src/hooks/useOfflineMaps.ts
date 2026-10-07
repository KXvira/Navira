import { useCallback, useEffect, useRef, useState } from 'react';
import { pickOfflineMapPackage } from '../services/offlineMapImport';
import { installBundledKabarakMap, installOfflineMap, listOfflineMaps, removeOfflineMap, selectOfflineMap } from '../services/offlineMapRepository';
import type { OfflineMapPackage, StoredOfflineMap } from '../types/offlineMap';

export function useOfflineMaps() {
  const [packages, setPackages] = useState<StoredOfflineMap[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedMap, setSelectedMap] = useState<OfflineMapPackage | null>(null);
  const [invalidCount, setInvalidCount] = useState(0);
  const [storageBytes, setStorageBytes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const operation = useRef(false);

  const refresh = useCallback(async () => {
    const result = await listOfflineMaps();
    setPackages(result.packages);
    setSelectedId(result.selectedId);
    setSelectedMap(result.selectedMap);
    setInvalidCount(result.invalidCount);
    setStorageBytes(result.storageBytes);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void listOfflineMaps().then((result) => {
      if (cancelled) return;
      setPackages(result.packages);
      setSelectedId(result.selectedId);
      setSelectedMap(result.selectedMap);
      setInvalidCount(result.invalidCount);
      setStorageBytes(result.storageBytes);
    }).catch((cause: unknown) => {
      if (!cancelled) setError(cause instanceof Error ? cause.message : 'Saved maps could not be loaded');
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  async function run(action: () => Promise<void>) {
    if (operation.current) return;
    operation.current = true;
    setWorking(true);
    setError(null);
    try {
      await action();
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Map storage action failed');
      try { await refresh(); } catch { /* Keep the original error visible. */ }
    } finally {
      operation.current = false;
      setWorking(false);
    }
  }

  return {
    packages, selectedId, selectedMap, invalidCount, storageBytes, loading, working, error,
    retry: () => { void run(async () => {}); },
    importLocal: () => { void run(async () => { const pack = await pickOfflineMapPackage(); if (pack) await installOfflineMap(pack); }); },
    installSample: () => { void run(installBundledKabarakMap); },
    select: (id: string | null) => { void run(() => selectOfflineMap(id)); },
    remove: (id: string) => { void run(() => removeOfflineMap(id)); },
  };
}
