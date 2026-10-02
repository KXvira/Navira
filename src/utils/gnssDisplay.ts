import type { GnssEvent, GnssPhase, GnssState } from '../types/gnss';

export const GNSS_STALE_AFTER_MS = 15_000;
// The UI clock ticks once per second. A callback can arrive after that tick.
const DISPLAY_CLOCK_SKEW_MS = 2_000;

export function gnssAgeSeconds(observedAtMs: number | null, now: number): number | null {
  if (observedAtMs === null || !Number.isFinite(observedAtMs) || observedAtMs <= 0 || !Number.isFinite(now) || now <= 0) return null;
  const elapsed = now - observedAtMs;
  if (elapsed < -DISPLAY_CLOCK_SKEW_MS) return null;
  return Math.max(0, Math.floor(elapsed / 1000));
}

export function visibleGnssPhase(state: GnssState, now: number): GnssPhase {
  if (state.phase !== 'receiving') return state.phase;
  const age = gnssAgeSeconds(state.observedAtMs, now);
  return age === null || now - state.observedAtMs! >= GNSS_STALE_AFTER_MS ? 'stale' : 'receiving';
}

export function formatCn0(value: number): string {
  return Number.isFinite(value) ? `${value.toFixed(1)} dB-Hz` : 'Unavailable';
}

export function stateFromGnssEvent(event: GnssEvent): GnssState {
  return event.state === 'receiving'
    ? { phase: 'receiving', snapshot: event, observedAtMs: event.observedAtMs }
    : { phase: event.state, snapshot: null, observedAtMs: null };
}
