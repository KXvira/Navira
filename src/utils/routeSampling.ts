import type { RoutePoint, RouteSample } from '../types/route';
import { straightLineGuidance } from './guidance';

export const ROUTE_GAP_MS = 15_000;
export const MIN_SAMPLE_INTERVAL_MS = 2_000;
export const MIN_MOVEMENT_METERS = 10;
export const MAX_PLAUSIBLE_SPEED_MPS = 70;

export type SampleDecision =
  | { accepted: true; segmentIndex: number; distanceMeters: number }
  | { accepted: false; reason: 'invalid' | 'stale' | 'order' | 'stationary' | 'too-soon' | 'spike' };

export function evaluateRouteSample(sample: RouteSample, last: RoutePoint | null, currentSegment: number, now: number, lastObservedAtMs: number | null = last?.capturedAt ?? null): SampleDecision {
  if (!Number.isInteger(currentSegment) || currentSegment < 0 || !Number.isFinite(now) ||
    !Number.isFinite(sample.latitude) || !Number.isFinite(sample.longitude) ||
    Math.abs(sample.latitude) > 90 || Math.abs(sample.longitude) > 180 ||
    !Number.isFinite(sample.capturedAt) || sample.capturedAt <= 0 || sample.capturedAt > now + 2_000 ||
    (sample.altitude !== null && !Number.isFinite(sample.altitude)) ||
    (sample.horizontalAccuracy !== null && (!Number.isFinite(sample.horizontalAccuracy) || sample.horizontalAccuracy < 0))) return { accepted: false, reason: 'invalid' };
  if (now - sample.capturedAt >= ROUTE_GAP_MS) return { accepted: false, reason: 'stale' };
  if (lastObservedAtMs !== null && sample.capturedAt <= lastObservedAtMs) return { accepted: false, reason: 'order' };
  if (!last) return { accepted: true, segmentIndex: currentSegment, distanceMeters: 0 };
  if (sample.capturedAt <= last.capturedAt) return { accepted: false, reason: 'order' };
  const gap = lastObservedAtMs !== null && sample.capturedAt - lastObservedAtMs >= ROUTE_GAP_MS;
  const segmentIndex = gap ? Math.max(currentSegment, last.segmentIndex + 1) : currentSegment;
  if (segmentIndex !== last.segmentIndex) return { accepted: true, segmentIndex, distanceMeters: 0 };
  const seconds = (sample.capturedAt - last.capturedAt) / 1000;
  if (seconds * 1000 < MIN_SAMPLE_INTERVAL_MS) return { accepted: false, reason: 'too-soon' };
  const guidance = straightLineGuidance(last, sample);
  if (!guidance) return { accepted: false, reason: 'invalid' };
  const movementThreshold = Math.max(MIN_MOVEMENT_METERS, sample.horizontalAccuracy ?? 0, last.horizontalAccuracy ?? 0);
  if (guidance.distanceMeters < movementThreshold) return { accepted: false, reason: 'stationary' };
  if (guidance.distanceMeters / seconds > MAX_PLAUSIBLE_SPEED_MPS) return { accepted: false, reason: 'spike' };
  return { accepted: true, segmentIndex, distanceMeters: guidance.distanceMeters };
}
