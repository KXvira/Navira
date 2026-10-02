import type { LocationObject } from 'expo-location';

export type LocationPhase =
  | 'starting'
  | 'waiting'
  | 'receiving'
  | 'stale'
  | 'permission-denied'
  | 'services-disabled'
  | 'error';

export interface LocationState {
  phase: LocationPhase;
  reading: LocationObject | null;
  error: string | null;
}
