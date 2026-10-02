export type RouteStatus = 'recording' | 'paused' | 'stopped' | 'saved';
export type PauseReason = 'manual' | 'background' | 'interrupted' | null;

export interface RoutePoint {
  id: number;
  routeId: string;
  segmentIndex: number;
  latitude: number;
  longitude: number;
  altitude: number | null;
  horizontalAccuracy: number | null;
  capturedAt: number;
}

export type RouteSample = Pick<RoutePoint, 'latitude' | 'longitude' | 'altitude' | 'horizontalAccuracy' | 'capturedAt'>;

export interface RecordedRoute {
  id: string;
  name: string | null;
  status: RouteStatus;
  pauseReason: PauseReason;
  createdAt: number;
  updatedAt: number;
  activeElapsedMs: number;
  activeSinceMs: number | null;
  segmentIndex: number;
  pointCount: number;
  distanceMeters: number;
  lastPoint: RoutePoint | null;
}

export interface RouteLoadResult {
  routes: RecordedRoute[];
  malformedRecordCount: number;
}

export interface RouteRepository {
  recoverInterrupted(): Promise<void>;
  list(): Promise<RouteLoadResult>;
  points(routeId: string): Promise<RoutePoint[]>;
  create(now: number): Promise<RecordedRoute>;
  pause(id: string, reason: Exclude<PauseReason, null>, now: number): Promise<RecordedRoute>;
  resume(id: string, now: number): Promise<RecordedRoute>;
  stop(id: string, now: number): Promise<RecordedRoute>;
  save(id: string, name: string, now: number): Promise<RecordedRoute>;
  append(id: string, sample: RouteSample, now: number, lastObservedAtMs: number | null): Promise<RecordedRoute | null>;
  checkpoint(id: string, now: number): Promise<RecordedRoute>;
  delete(id: string): Promise<void>;
}
