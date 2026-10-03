import type { DistanceStatus, RoutePoint, RouteSample } from '../types/route';
import { straightLineGuidance } from './guidance';
import { MAX_PLAUSIBLE_SPEED_MPS, MIN_MOVEMENT_METERS, MIN_SAMPLE_INTERVAL_MS, ROUTE_GAP_MS } from './routeSampling';

// Recording policy v2. Changing these values requires a new policy version.
export const ROUTE_QUALITY_POLICY_V2 = {
  version: 2 as const,
  maximumHorizontalAccuracyMeters: 100,
  sampleIntervalMs: MIN_SAMPLE_INTERVAL_MS,
  maximumCoveredObservationIntervalMs: 3_000,
};

export type QualityState = {
  segmentIndex: number;
  lastObservedAtMs: number | null;
  lastObservedQualityExcluded: boolean;
  lastStoredPoint: RoutePoint | null;
  lastGeometryPoint: RoutePoint | null;
};

export type QualityDecision =
  | { observed: false; reason: 'invalid' | 'stale' | 'order'; resetExcludedCoverage: boolean }
  | { observed: true; store: boolean; segmentIndex: number; distanceStatus: DistanceStatus | null;
      distanceMeters: number; excludedDurationMs: number; qualityExcluded: boolean };

export function evaluateQualitySample(sample: RouteSample, state: QualityState, now: number): QualityDecision {
  if (!Number.isInteger(state.segmentIndex) || state.segmentIndex < 0 || !Number.isFinite(now) ||
    !Number.isFinite(sample.latitude) || !Number.isFinite(sample.longitude) ||
    Math.abs(sample.latitude) > 90 || Math.abs(sample.longitude) > 180 ||
    !Number.isFinite(sample.capturedAt) || sample.capturedAt <= 0 || sample.capturedAt > now + 2_000 ||
    (sample.altitude !== null && !Number.isFinite(sample.altitude)) ||
    (sample.horizontalAccuracy !== null && (!Number.isFinite(sample.horizontalAccuracy) || sample.horizontalAccuracy < 0))) return { observed: false, reason: 'invalid', resetExcludedCoverage: true };
  if (now - sample.capturedAt >= ROUTE_GAP_MS) return { observed: false, reason: 'stale', resetExcludedCoverage: true };
  if (state.lastObservedAtMs !== null && sample.capturedAt <= state.lastObservedAtMs) return { observed: false, reason: 'order', resetExcludedCoverage: false };

  const gap = state.lastObservedAtMs !== null && sample.capturedAt - state.lastObservedAtMs >= ROUTE_GAP_MS;
  const qualityExcluded = sample.horizontalAccuracy === null || sample.horizontalAccuracy > ROUTE_QUALITY_POLICY_V2.maximumHorizontalAccuracyMeters;
  const excludedDurationMs = !gap && qualityExcluded && state.lastObservedQualityExcluded && state.lastObservedAtMs !== null &&
    sample.capturedAt - state.lastObservedAtMs <= ROUTE_QUALITY_POLICY_V2.maximumCoveredObservationIntervalMs
    ? sample.capturedAt - state.lastObservedAtMs : 0;
  // A gap or the first unsuitable reading severs the prior distance geometry, even if cadence skips storing it.
  let segmentIndex = state.segmentIndex + (gap || qualityExcluded && !state.lastObservedQualityExcluded && state.lastGeometryPoint !== null ? 1 : 0);
  const store = state.lastStoredPoint === null || sample.capturedAt - state.lastStoredPoint.capturedAt >= ROUTE_QUALITY_POLICY_V2.sampleIntervalMs;
  if (!store) return { observed: true, store: false, segmentIndex, distanceStatus: null, distanceMeters: 0, excludedDurationMs, qualityExcluded };
  if (qualityExcluded) return { observed: true, store, segmentIndex,
    distanceStatus: sample.horizontalAccuracy === null ? 'missing-accuracy' : 'low-precision', distanceMeters: 0, excludedDurationMs, qualityExcluded };

  const last = state.lastGeometryPoint;
  if (!last || last.segmentIndex !== segmentIndex) return { observed: true, store, segmentIndex,
    distanceStatus: 'anchor', distanceMeters: 0, excludedDurationMs, qualityExcluded };
  const guidance = straightLineGuidance(last, sample);
  if (!guidance) return { observed: false, reason: 'invalid', resetExcludedCoverage: true };
  const threshold = Math.max(MIN_MOVEMENT_METERS, last.horizontalAccuracy ?? 0, sample.horizontalAccuracy ?? 0);
  if (guidance.distanceMeters < threshold) return { observed: true, store, segmentIndex,
    distanceStatus: 'stationary', distanceMeters: 0, excludedDurationMs, qualityExcluded };
  const seconds = (sample.capturedAt - last.capturedAt) / 1000;
  if (seconds <= 0 || guidance.distanceMeters / seconds > MAX_PLAUSIBLE_SPEED_MPS) {
    segmentIndex += 1;
    return { observed: true, store, segmentIndex, distanceStatus: 'spike', distanceMeters: 0, excludedDurationMs, qualityExcluded };
  }
  return { observed: true, store, segmentIndex, distanceStatus: 'counted',
    distanceMeters: guidance.distanceMeters, excludedDurationMs, qualityExcluded };
}
