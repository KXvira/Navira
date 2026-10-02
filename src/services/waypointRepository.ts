import * as Crypto from 'expo-crypto';
import * as SQLite from 'expo-sqlite';
import type {
  Waypoint,
  WaypointCapture,
  WaypointDraft,
  WaypointLoadResult,
  WaypointRepository,
} from '../types/waypoint';
import { normalizeWaypointDraft, parseWaypointRow, type WaypointRow } from '../utils/waypointValidation';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  databasePromise ??= SQLite.openDatabaseAsync('navira.db');
  let database: SQLite.SQLiteDatabase;
  try {
    database = await databasePromise;
  } catch (error) {
    databasePromise = null;
    throw error;
  }
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS waypoints (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      note TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      altitude REAL,
      horizontal_accuracy REAL,
      captured_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      modified_at INTEGER NOT NULL
    );
  `);
  return database;
}

function requireDraft(draft: WaypointDraft): WaypointDraft {
  const normalized = normalizeWaypointDraft(draft);
  if (!normalized) throw new Error('Waypoint name is required.');
  return normalized;
}

class SQLiteWaypointRepository implements WaypointRepository {
  async list(): Promise<WaypointLoadResult> {
    const database = await initializeDatabase();
    const rows = await database.getAllAsync<WaypointRow>(
      'SELECT id, name, note, latitude, longitude, altitude, horizontal_accuracy, captured_at, created_at, modified_at FROM waypoints ORDER BY created_at DESC',
    );
    const waypoints: Waypoint[] = [];
    let malformedRecordCount = 0;
    for (const row of rows) {
      const waypoint = parseWaypointRow(row);
      if (waypoint) waypoints.push(waypoint);
      else malformedRecordCount += 1;
    }
    return { waypoints, malformedRecordCount };
  }

  async create(capture: WaypointCapture, draft: WaypointDraft): Promise<Waypoint> {
    const database = await initializeDatabase();
    const normalized = requireDraft(draft);
    const now = Date.now();
    const waypoint: Waypoint = {
      id: Crypto.randomUUID(),
      name: normalized.name,
      note: normalized.note || null,
      ...capture,
      createdAt: now,
      modifiedAt: now,
    };
    await database.runAsync(
      `INSERT INTO waypoints
        (id, name, note, latitude, longitude, altitude, horizontal_accuracy, captured_at, created_at, modified_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      waypoint.id,
      waypoint.name,
      waypoint.note,
      waypoint.latitude,
      waypoint.longitude,
      waypoint.altitude,
      waypoint.horizontalAccuracy,
      waypoint.capturedAt,
      waypoint.createdAt,
      waypoint.modifiedAt,
    );
    return waypoint;
  }

  async update(id: string, draft: WaypointDraft): Promise<Waypoint> {
    const database = await initializeDatabase();
    const normalized = requireDraft(draft);
    const modifiedAt = Date.now();
    const result = await database.runAsync(
      'UPDATE waypoints SET name = ?, note = ?, modified_at = ? WHERE id = ?',
      normalized.name,
      normalized.note || null,
      modifiedAt,
      id,
    );
    if (result.changes !== 1) throw new Error('Waypoint no longer exists.');
    const row = await database.getFirstAsync<WaypointRow>(
      'SELECT id, name, note, latitude, longitude, altitude, horizontal_accuracy, captured_at, created_at, modified_at FROM waypoints WHERE id = ?',
      id,
    );
    const waypoint = row ? parseWaypointRow(row) : null;
    if (!waypoint) throw new Error('Saved waypoint data could not be read.');
    return waypoint;
  }

  async delete(id: string): Promise<void> {
    const database = await initializeDatabase();
    const result = await database.runAsync('DELETE FROM waypoints WHERE id = ?', id);
    if (result.changes !== 1) throw new Error('Waypoint no longer exists.');
  }
}

export const waypointRepository: WaypointRepository = new SQLiteWaypointRepository();
