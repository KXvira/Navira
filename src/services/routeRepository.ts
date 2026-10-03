import * as Crypto from 'expo-crypto';
import * as SQLite from 'expo-sqlite';
import type { RecordedRoute, RouteLoadResult, RoutePoint, RouteRepository, RouteSample, RouteStatus, PauseReason } from '../types/route';
import { activeElapsedAt, pauseRecording, recoverInterruptedRecording, resumeRecording, stopRecording } from '../utils/recordingState';
import { evaluateRouteSample } from '../utils/routeSampling';
import { evaluateQualitySample } from '../utils/routeQualityPolicy';
import { ROUTE_MIGRATION_2 } from './routeMigration';

type RouteRow = {
  id: unknown; name: unknown; status: unknown; pause_reason: unknown; created_at: unknown; updated_at: unknown;
  active_elapsed_ms: unknown; active_since_ms: unknown; segment_index: unknown; point_count: unknown; distance_meters: unknown;
  policy_version: unknown; distance_point_count: unknown; excluded_duration_ms: unknown;
  last_observed_at_ms: unknown; last_observed_quality_excluded: unknown;
};
type PointRow = {
  id: unknown; route_id: unknown; segment_index: unknown; latitude: unknown; longitude: unknown;
  altitude: unknown; horizontal_accuracy: unknown; captured_at: unknown; distance_status: unknown;
};
const routeColumns = 'id, name, status, pause_reason, created_at, updated_at, active_elapsed_ms, active_since_ms, segment_index, point_count, distance_meters, policy_version, distance_point_count, excluded_duration_ms, last_observed_at_ms, last_observed_quality_excluded';
const pointColumns = 'id, route_id, segment_index, latitude, longitude, altitude, horizontal_accuracy, captured_at, distance_status';
const validStatuses = ['recording', 'paused', 'stopped', 'saved'];
const validReasons = ['manual', 'background', 'interrupted'];
const validDistanceStatuses = ['legacy', 'anchor', 'counted', 'stationary', 'spike', 'missing-accuracy', 'low-precision'];
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const nullableFinite = (value: unknown): value is number | null => value === null || finite(value);
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function db(): Promise<SQLite.SQLiteDatabase> {
  dbPromise ??= (async () => {
    const database = await SQLite.openDatabaseAsync('navira.db');
    await database.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS routes (
        id TEXT PRIMARY KEY NOT NULL, name TEXT, status TEXT NOT NULL, pause_reason TEXT,
        created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, active_elapsed_ms INTEGER NOT NULL,
        active_since_ms INTEGER, segment_index INTEGER NOT NULL, point_count INTEGER NOT NULL,
        distance_meters REAL NOT NULL
      );
      CREATE TABLE IF NOT EXISTS route_points (
        id INTEGER PRIMARY KEY AUTOINCREMENT, route_id TEXT NOT NULL, segment_index INTEGER NOT NULL,
        latitude REAL NOT NULL, longitude REAL NOT NULL, altitude REAL, horizontal_accuracy REAL,
        captured_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS route_points_route_order ON route_points(route_id, id);
    `);
    await database.withExclusiveTransactionAsync(async (tx) => {
      const version = await tx.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
      if (!version || !Number.isInteger(version.user_version) || version.user_version > 2) throw new Error('Unsupported route database schema version.');
      if (version.user_version < 2) {
        for (const statement of ROUTE_MIGRATION_2) await tx.execAsync(statement);
        await tx.execAsync('PRAGMA user_version = 2');
      }
    });
    return database;
  })().catch((error: unknown) => { dbPromise = null; throw error; });
  return dbPromise;
}

function parsePoint(row: PointRow): RoutePoint | null {
  if (!Number.isInteger(row.id) || !Number.isInteger(row.segment_index) || (row.segment_index as number) < 0 ||
    typeof row.route_id !== 'string' || !row.route_id || !finite(row.latitude) || Math.abs(row.latitude) > 90 ||
    !finite(row.longitude) || Math.abs(row.longitude) > 180 || !nullableFinite(row.altitude) ||
    !nullableFinite(row.horizontal_accuracy) || (row.horizontal_accuracy !== null && row.horizontal_accuracy < 0) ||
    !finite(row.captured_at) || row.captured_at <= 0 || !validDistanceStatuses.includes(String(row.distance_status))) return null;
  return { id: row.id as number, routeId: row.route_id, segmentIndex: row.segment_index as number,
    latitude: row.latitude, longitude: row.longitude, altitude: row.altitude,
    horizontalAccuracy: row.horizontal_accuracy, capturedAt: row.captured_at, distanceStatus: row.distance_status as RoutePoint['distanceStatus'] };
}

function parseRoute(row: RouteRow, lastPoint: RoutePoint | null): RecordedRoute | null {
  if (typeof row.id !== 'string' || !row.id || !(row.name === null || typeof row.name === 'string') ||
    !validStatuses.includes(String(row.status)) || (row.status === 'saved' && (typeof row.name !== 'string' || !row.name.trim())) ||
    !(row.pause_reason === null || validReasons.includes(String(row.pause_reason))) ||
    !finite(row.created_at) || !finite(row.updated_at) || !finite(row.active_elapsed_ms) || row.active_elapsed_ms < 0 ||
    !nullableFinite(row.active_since_ms) || (row.status === 'recording' ? row.active_since_ms === null : row.active_since_ms !== null) || !Number.isInteger(row.segment_index) || (row.segment_index as number) < 0 ||
    !Number.isInteger(row.point_count) || (row.point_count as number) < 0 || !finite(row.distance_meters) || row.distance_meters < 0 ||
    (row.policy_version !== 1 && row.policy_version !== 2) ||
    !(row.distance_point_count === null || Number.isInteger(row.distance_point_count) && (row.distance_point_count as number) >= 0) ||
    !Number.isInteger(row.excluded_duration_ms) || (row.excluded_duration_ms as number) < 0 ||
    !nullableFinite(row.last_observed_at_ms) || (row.last_observed_quality_excluded !== 0 && row.last_observed_quality_excluded !== 1)) return null;
  return { id: row.id, name: row.name, status: row.status as RouteStatus, pauseReason: row.pause_reason as PauseReason,
    createdAt: row.created_at, updatedAt: row.updated_at, activeElapsedMs: row.active_elapsed_ms,
    activeSinceMs: row.active_since_ms, segmentIndex: row.segment_index as number, pointCount: row.point_count as number,
    distanceMeters: row.distance_meters, policyVersion: row.policy_version as 1 | 2,
    distancePointCount: row.distance_point_count as number | null, excludedDurationMs: row.excluded_duration_ms as number,
    lastObservedAtMs: row.last_observed_at_ms as number | null,
    lastObservedQualityExcluded: row.last_observed_quality_excluded === 1, lastPoint };
}

async function one(database: SQLite.SQLiteDatabase, id: string): Promise<RecordedRoute> {
  const row = await database.getFirstAsync<RouteRow>(`SELECT ${routeColumns} FROM routes WHERE id = ?`, id);
  if (!row) throw new Error('Route no longer exists.');
  const pointRow = await database.getFirstAsync<PointRow>(`SELECT ${pointColumns} FROM route_points WHERE route_id = ? ORDER BY id DESC LIMIT 1`, id);
  const point = pointRow ? parsePoint(pointRow) : null;
  if (pointRow && !point) throw new Error('Stored route point could not be read.');
  const route = parseRoute(row, point);
  if (!route) throw new Error('Stored route could not be read.');
  return route;
}

class SQLiteRouteRepository implements RouteRepository {
  async recoverInterrupted(): Promise<void> {
    const database = await db();
    await database.withExclusiveTransactionAsync(async (tx) => {
      const rows = await tx.getAllAsync<RouteRow>(`SELECT ${routeColumns} FROM routes WHERE status = 'recording'`);
      const now = Date.now();
      for (const row of rows) {
        const route = parseRoute(row, null);
        if (!route) continue; // Preserve malformed rows for inspection.
        const recovered = recoverInterruptedRecording(route, now);
        await tx.runAsync('UPDATE routes SET status = ?, pause_reason = ?, active_since_ms = NULL, last_observed_at_ms = NULL, last_observed_quality_excluded = 0, updated_at = ? WHERE id = ?', recovered.status, recovered.pauseReason, recovered.updatedAt, recovered.id);
      }
    });
  }
  async list(): Promise<RouteLoadResult> {
    const database = await db();
    const rows = await database.getAllAsync<RouteRow>(`SELECT ${routeColumns} FROM routes ORDER BY created_at DESC`);
    const routes: RecordedRoute[] = [];
    let malformedRecordCount = 0;
    for (const row of rows) {
      const pointRow = await database.getFirstAsync<PointRow>(`SELECT ${pointColumns} FROM route_points WHERE route_id = ? ORDER BY id DESC LIMIT 1`, String(row.id));
      const point = pointRow ? parsePoint(pointRow) : null;
      const route = pointRow && !point ? null : parseRoute(row, point);
      if (route) routes.push(route); else malformedRecordCount++;
    }
    return { routes, malformedRecordCount };
  }
  async points(routeId: string): Promise<RoutePoint[]> {
    const database = await db();
    await one(database, routeId);
    const rows = await database.getAllAsync<PointRow>(`SELECT ${pointColumns} FROM route_points WHERE route_id = ? ORDER BY id`, routeId);
    return rows.map((row) => { const point = parsePoint(row); if (!point) throw new Error('Stored route point could not be exported.'); return point; });
  }
  async create(now: number): Promise<RecordedRoute> {
    const database = await db();
    const id = Crypto.randomUUID();
    await database.withExclusiveTransactionAsync(async (tx) => {
      const existing = await tx.getFirstAsync<{ id: string }>("SELECT id FROM routes WHERE status != 'saved' LIMIT 1");
      if (existing) throw new Error('Finish the current route before starting another.');
      await tx.runAsync(`INSERT INTO routes (id, name, status, pause_reason, created_at, updated_at, active_elapsed_ms, active_since_ms, segment_index, point_count, distance_meters, policy_version, distance_point_count, excluded_duration_ms) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, id, null, 'recording', null, now, now, 0, now, 0, 0, 0, 2, 0, 0);
    });
    return one(database, id);
  }
  async pause(id: string, reason: Exclude<PauseReason, null>, now: number): Promise<RecordedRoute> {
    const database = await db();
    await database.withExclusiveTransactionAsync(async (tx) => {
      const route = await one(tx, id);
      const next = pauseRecording(route, reason, now);
      if (next === route) return;
      await tx.runAsync('UPDATE routes SET status = ?, pause_reason = ?, active_elapsed_ms = ?, active_since_ms = NULL, last_observed_at_ms = NULL, last_observed_quality_excluded = 0, updated_at = ? WHERE id = ?', next.status, next.pauseReason, next.activeElapsedMs, now, id);
    });
    return one(database, id);
  }
  async resume(id: string, now: number): Promise<RecordedRoute> {
    const database = await db();
    await database.withExclusiveTransactionAsync(async (tx) => {
      const next = resumeRecording(await one(tx, id), now);
      await tx.runAsync('UPDATE routes SET status = ?, pause_reason = NULL, active_since_ms = ?, segment_index = ?, last_observed_at_ms = NULL, last_observed_quality_excluded = 0, updated_at = ? WHERE id = ?', next.status, next.activeSinceMs, next.segmentIndex, now, id);
    });
    return one(database, id);
  }
  async stop(id: string, now: number): Promise<RecordedRoute> {
    const database = await db();
    await database.withExclusiveTransactionAsync(async (tx) => {
      const next = stopRecording(await one(tx, id), now);
      await tx.runAsync('UPDATE routes SET status = ?, pause_reason = NULL, active_elapsed_ms = ?, active_since_ms = NULL, last_observed_at_ms = NULL, last_observed_quality_excluded = 0, updated_at = ? WHERE id = ?', next.status, next.activeElapsedMs, now, id);
    });
    return one(database, id);
  }
  async save(id: string, name: string, now: number): Promise<RecordedRoute> {
    const normalized = name.trim();
    if (!normalized) throw new Error('Enter a route name.');
    const database = await db();
    await database.withExclusiveTransactionAsync(async (tx) => {
      const route = await one(tx, id);
      if (route.status !== 'stopped') throw new Error('Stop the route before saving it.');
      await tx.runAsync("UPDATE routes SET name = ?, status = 'saved', updated_at = ? WHERE id = ?", normalized, now, id);
    });
    return one(database, id);
  }
  async append(id: string, sample: RouteSample, now: number, lastObservedAtMs: number | null): Promise<RecordedRoute | null> {
    const database = await db();
    let changed = false;
    await database.withExclusiveTransactionAsync(async (tx) => {
      const route = await one(tx, id);
      if (route.status !== 'recording') return;
      if (route.policyVersion === 1) {
        const decision = evaluateRouteSample(sample, route.lastPoint, route.segmentIndex, now, lastObservedAtMs);
        if (!decision.accepted) return;
        await tx.runAsync(`INSERT INTO route_points (route_id, segment_index, latitude, longitude, altitude, horizontal_accuracy, captured_at) VALUES (?, ?, ?, ?, ?, ?, ?)`, id, decision.segmentIndex, sample.latitude, sample.longitude, sample.altitude, sample.horizontalAccuracy, sample.capturedAt);
        await tx.runAsync('UPDATE routes SET point_count = point_count + 1, distance_meters = distance_meters + ?, segment_index = ?, updated_at = ? WHERE id = ?', decision.distanceMeters, decision.segmentIndex, now, id);
        changed = true;
        return;
      }
      const geometryRow = await tx.getFirstAsync<PointRow>(`SELECT ${pointColumns} FROM route_points WHERE route_id = ? AND segment_index = ? AND distance_status IN ('anchor', 'counted') ORDER BY id DESC LIMIT 1`, id, route.segmentIndex);
      const geometryPoint = geometryRow ? parsePoint(geometryRow) : null;
      if (geometryRow && !geometryPoint) throw new Error('Stored route geometry could not be read.');
      const decision = evaluateQualitySample(sample, {
        segmentIndex: route.segmentIndex, lastObservedAtMs: route.lastObservedAtMs,
        lastObservedQualityExcluded: route.lastObservedQualityExcluded,
        lastStoredPoint: route.lastPoint, lastGeometryPoint: geometryPoint,
      }, now);
      if (!decision.observed) {
        if (decision.resetExcludedCoverage && route.lastObservedQualityExcluded) {
          // A rejected callback gives no evidence that low precision covered the intervening time.
          await tx.runAsync('UPDATE routes SET last_observed_quality_excluded = 0, updated_at = ? WHERE id = ?', now, id);
          changed = true;
        }
        return;
      }
      if (decision.store) {
        await tx.runAsync(`INSERT INTO route_points (route_id, segment_index, latitude, longitude, altitude, horizontal_accuracy, captured_at, distance_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          id, decision.segmentIndex, sample.latitude, sample.longitude, sample.altitude, sample.horizontalAccuracy, sample.capturedAt, decision.distanceStatus);
      }
      await tx.runAsync(`UPDATE routes SET point_count = point_count + ?, distance_point_count = distance_point_count + ?,
        distance_meters = distance_meters + ?, excluded_duration_ms = excluded_duration_ms + ?,
        segment_index = ?, last_observed_at_ms = ?, last_observed_quality_excluded = ?, updated_at = ? WHERE id = ?`,
        decision.store ? 1 : 0, decision.distanceStatus === 'counted' ? 1 : 0, decision.distanceMeters,
        decision.excludedDurationMs, decision.segmentIndex, sample.capturedAt, decision.qualityExcluded ? 1 : 0, now, id);
      changed = true;
    });
    return changed ? one(database, id) : null;
  }
  async checkpoint(id: string, now: number): Promise<RecordedRoute> {
    const database = await db();
    await database.withExclusiveTransactionAsync(async (tx) => {
      const route = await one(tx, id);
      if (route.status !== 'recording') return;
      await tx.runAsync('UPDATE routes SET active_elapsed_ms = ?, active_since_ms = ?, updated_at = ? WHERE id = ?', activeElapsedAt(route, now), now, now, id);
    });
    return one(database, id);
  }
  async delete(id: string): Promise<void> {
    const database = await db();
    await database.withExclusiveTransactionAsync(async (tx) => {
      await tx.runAsync('DELETE FROM route_points WHERE route_id = ?', id);
      const result = await tx.runAsync('DELETE FROM routes WHERE id = ?', id);
      if (result.changes !== 1) throw new Error('Route no longer exists.');
    });
  }
}
export const routeRepository: RouteRepository = new SQLiteRouteRepository();
