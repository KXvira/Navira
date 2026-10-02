import type { LocationObject } from 'expo-location';
import type { Waypoint, WaypointCapture, WaypointDraft } from '../types/waypoint';
import { STALE_AFTER_MS } from './locationDisplay';

export interface WaypointRow {
  id: unknown;
  name: unknown;
  note: unknown;
  latitude: unknown;
  longitude: unknown;
  altitude: unknown;
  horizontal_accuracy: unknown;
  captured_at: unknown;
  created_at: unknown;
  modified_at: unknown;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isNullableFiniteNumber(value: unknown): value is number | null {
  return value === null || isFiniteNumber(value);
}

export function normalizeWaypointDraft(draft: WaypointDraft): WaypointDraft | null {
  const name = draft.name.trim();
  if (!name) return null;
  return { name, note: draft.note.trim() };
}

export function captureLocationSnapshot(reading: LocationObject): WaypointCapture | null {
  const { latitude, longitude, altitude, accuracy } = reading.coords;
  if (!isFiniteNumber(latitude) || !isFiniteNumber(longitude) || !isFiniteNumber(reading.timestamp)) return null;
  return {
    latitude,
    longitude,
    altitude: isNullableFiniteNumber(altitude) ? altitude : null,
    horizontalAccuracy: isNullableFiniteNumber(accuracy) ? accuracy : null,
    capturedAt: reading.timestamp,
  };
}

export function isCaptureFresh(capture: WaypointCapture, now: number): boolean {
  return Number.isFinite(now) && now - capture.capturedAt < STALE_AFTER_MS;
}

export function parseWaypointRow(row: WaypointRow): Waypoint | null {
  if (
    typeof row.id !== 'string' || !row.id ||
    typeof row.name !== 'string' || !row.name.trim() ||
    !(row.note === null || typeof row.note === 'string') ||
    !isFiniteNumber(row.latitude) || !isFiniteNumber(row.longitude) ||
    !isNullableFiniteNumber(row.altitude) || !isNullableFiniteNumber(row.horizontal_accuracy) ||
    !isFiniteNumber(row.captured_at) || !isFiniteNumber(row.created_at) || !isFiniteNumber(row.modified_at)
  ) return null;

  return {
    id: row.id,
    name: row.name,
    note: row.note,
    latitude: row.latitude,
    longitude: row.longitude,
    altitude: row.altitude,
    horizontalAccuracy: row.horizontal_accuracy,
    capturedAt: row.captured_at,
    createdAt: row.created_at,
    modifiedAt: row.modified_at,
  };
}
