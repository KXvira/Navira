import type { LocationPhase, LocationState } from '../types/location';

export const STALE_AFTER_MS = 15_000;

export function readingAgeSeconds(timestamp: number | null, now: number): number | null {
  if (timestamp === null || !Number.isFinite(timestamp)) return null;
  return Math.max(0, Math.floor((now - timestamp) / 1000));
}

export function visiblePhase(state: LocationState, now: number): LocationPhase {
  if (state.phase !== 'receiving' || state.reading === null) return state.phase;
  const age = readingAgeSeconds(state.reading.timestamp, now);
  return age === null || age * 1000 >= STALE_AFTER_MS ? 'stale' : 'receiving';
}

export function formatMeasurement(
  value: number | null | undefined,
  decimals: number,
  unit = '',
): string {
  return value == null || !Number.isFinite(value) ? 'Unavailable' : `${value.toFixed(decimals)}${unit}`;
}

export function formatSpeed(metersPerSecond: number | null | undefined): string {
  return formatMeasurement(
    metersPerSecond != null && metersPerSecond >= 0 ? metersPerSecond * 3.6 : null,
    1,
    ' km/h',
  );
}
