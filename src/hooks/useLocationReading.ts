import { useEffect, useState } from 'react';
import type { LocationSubscription } from 'expo-location';
import { areLocationServicesEnabled, requestForegroundAccess, subscribeToLocation } from '../services/locationService';
import type { LocationState } from '../types/location';

const initialState: LocationState = { phase: 'starting', reading: null, receivedAt: null, error: null };

export function useLocationReading() {
  const [state, setState] = useState<LocationState>(initialState);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let disposed = false;
    let watcherFailed = false;
    let subscription: LocationSubscription | null = null;

    async function start() {
      setState((previous) => ({ ...previous, phase: 'starting', error: null }));
      try {
        if (!(await requestForegroundAccess())) {
          if (!disposed) setState((previous) => ({ ...previous, phase: 'permission-denied' }));
          return;
        }
        if (disposed) return;
        if (!(await areLocationServicesEnabled())) {
          if (!disposed) setState((previous) => ({ ...previous, phase: 'services-disabled' }));
          return;
        }
        if (disposed) return;
        setState((previous) => ({ ...previous, phase: 'waiting' }));
        const watcher = await subscribeToLocation(
          (reading) => {
            if (!disposed && !watcherFailed) setState({ phase: 'receiving', reading, receivedAt: Date.now(), error: null });
          },
          (message) => {
            if (!disposed) {
              watcherFailed = true;
              subscription?.remove();
              subscription = null;
              setState((previous) => ({ ...previous, phase: 'error', error: message }));
            }
          },
        );
        if (disposed || watcherFailed) watcher.remove();
        else subscription = watcher;
      } catch (error) {
        if (!disposed) {
          setState((previous) => ({
            ...previous,
            phase: 'error',
            error: error instanceof Error ? error.message : 'Location could not start.',
          }));
        }
      }
    }

    void start();
    return () => {
      disposed = true;
      subscription?.remove();
    };
  }, [attempt]);

  return { state, retry: () => setAttempt((value) => value + 1) };
}
