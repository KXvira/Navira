export type GnssPhase =
  | 'unsupported'
  | 'unavailable'
  | 'permission-denied'
  | 'services-disabled'
  | 'waiting'
  | 'receiving'
  | 'stale'
  | 'paused'
  | 'error';

export type GnssSatellite = {
  constellation: string;
  svid: number;
  cn0DbHz: number;
  usedInFix: boolean;
};

export type GnssSnapshot = {
  observedAtMs: number;
  observedElapsedRealtimeMs: number;
  reportedCount: number;
  usedInFixCount: number;
  satellites: GnssSatellite[];
};

export type GnssEvent =
  | { state: 'receiving' } & GnssSnapshot
  | { state: Exclude<GnssPhase, 'receiving' | 'stale' | 'paused'> };

export type GnssState = {
  phase: GnssPhase;
  snapshot: GnssSnapshot | null;
  receivedAtMs: number | null;
};
