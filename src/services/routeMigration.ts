// navira.db route schema migration 1 -> 2. Existing rows keep their original policy and totals.
export const ROUTE_MIGRATION_2 = [
  'ALTER TABLE routes ADD COLUMN policy_version INTEGER NOT NULL DEFAULT 1',
  'ALTER TABLE routes ADD COLUMN distance_point_count INTEGER',
  'ALTER TABLE routes ADD COLUMN excluded_duration_ms INTEGER NOT NULL DEFAULT 0',
  'ALTER TABLE routes ADD COLUMN last_observed_at_ms INTEGER',
  'ALTER TABLE routes ADD COLUMN last_observed_quality_excluded INTEGER NOT NULL DEFAULT 0',
  "ALTER TABLE route_points ADD COLUMN distance_status TEXT NOT NULL DEFAULT 'legacy'",
] as const;
