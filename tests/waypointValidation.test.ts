import type { LocationObject } from 'expo-location';
import { STALE_AFTER_MS } from '../src/utils/locationDisplay';
import { captureLocationSnapshot, isCaptureFresh, normalizeWaypointDraft, parseWaypointRow, type WaypointRow } from '../src/utils/waypointValidation';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const normalized = normalizeWaypointDraft({ name: '  Ridge marker  ', note: '  Windy  ' });
assert(normalized?.name === 'Ridge marker', 'name should be trimmed');
assert(normalized?.note === 'Windy', 'note should be trimmed');
assert(normalizeWaypointDraft({ name: '   ', note: '' }) === null, 'blank names should be rejected');

const capturedAt = 1_000_000;
const reading = {
  timestamp: capturedAt,
  coords: {
    latitude: -1.2921,
    longitude: 36.8219,
    altitude: null,
    accuracy: 26.9,
  },
} as LocationObject;
const capture = captureLocationSnapshot(reading);
assert(capture !== null, 'valid location should create a capture');
reading.coords.latitude = 0;
assert(capture?.latitude === -1.2921, 'capture must not change with the live reading');
assert(isCaptureFresh(capture!, capturedAt + STALE_AFTER_MS - 1), 'capture should be fresh before the boundary');
assert(!isCaptureFresh(capture!, capturedAt + STALE_AFTER_MS), 'capture should be stale at the shared boundary');

const validRow: WaypointRow = {
  id: 'f8a96979-2a28-4afb-b501-710b21d08d12',
  name: 'Ridge marker',
  note: null,
  latitude: -1.2921,
  longitude: 36.8219,
  altitude: null,
  horizontal_accuracy: null,
  captured_at: capturedAt,
  created_at: capturedAt + 100,
  modified_at: capturedAt + 100,
};
const parsed = parseWaypointRow(validRow);
assert(parsed?.horizontalAccuracy === null, 'nullable measurements should be retained');
assert(parsed?.note === null, 'nullable note should be retained');
assert(parseWaypointRow({ ...validRow, latitude: 'invalid' }) === null, 'malformed coordinates should be reported');
assert(parseWaypointRow({ ...validRow, name: ' ' }) === null, 'blank stored names should be reported');

console.log('Waypoint validation tests passed.');
