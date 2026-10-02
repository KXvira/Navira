import type { GnssPhase, GnssState } from '../types/gnss';

export const GNSS_STALE_AFTER_MS = 15_000;

export function gnssAgeSeconds(receivedAtMs: number | null, now: number): number | null {
  if (receivedAtMs === null || now < receivedAtMs) return null;
  return Math.floor((now - receivedAtMs) / 1000);
}

export function visibleGnssPhase(state: GnssState, now: number): GnssPhase {
  if (state.phase !== 'receiving') return state.phase;
  if (state.receivedAtMs === null || now - state.receivedAtMs >= GNSS_STALE_AFTER_MS) return 'stale';
  return 'receiving';
}

export function formatCn0(value: number): string {
  return Number.isFinite(value) ? `${value.toFixed(1)} dB-Hz` : 'Unavailable';
}
