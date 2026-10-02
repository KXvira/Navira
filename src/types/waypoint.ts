export interface Waypoint {
  id: string;
  name: string;
  note: string | null;
  latitude: number;
  longitude: number;
  altitude: number | null;
  horizontalAccuracy: number | null;
  capturedAt: number;
  createdAt: number;
  modifiedAt: number;
}

export interface WaypointCapture {
  latitude: number;
  longitude: number;
  altitude: number | null;
  horizontalAccuracy: number | null;
  capturedAt: number;
}

export interface WaypointDraft {
  name: string;
  note: string;
}

export interface WaypointLoadResult {
  waypoints: Waypoint[];
  malformedRecordCount: number;
}

export interface WaypointRepository {
  list(): Promise<WaypointLoadResult>;
  create(capture: WaypointCapture, draft: WaypointDraft): Promise<Waypoint>;
  update(id: string, draft: WaypointDraft): Promise<Waypoint>;
  delete(id: string): Promise<void>;
}
