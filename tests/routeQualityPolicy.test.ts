import type { RoutePoint, RouteSample } from '../src/types/route';
import { evaluateQualitySample, ROUTE_QUALITY_POLICY_V2, type QualityState } from '../src/utils/routeQualityPolicy';
import { ROUTE_GAP_MS } from '../src/utils/routeSampling';

const check = (value: boolean, message: string) => { if (!value) throw new Error(message); };
const start = 1_800_000_000_000;
let nextId = 1;
let state: QualityState = { segmentIndex: 0, lastObservedAtMs: null, lastObservedQualityExcluded: false, lastStoredPoint: null, lastGeometryPoint: null };
const base: RouteSample = { latitude: 0, longitude: 0, altitude: null, horizontalAccuracy: 8, capturedAt: start };
function observe(sample: RouteSample, receivedAt = sample.capturedAt + 100) {
  const decision = evaluateQualitySample(sample, state, receivedAt);
  if (decision.observed) {
    const point: RoutePoint | null = decision.store ? {
      ...sample, id: nextId++, routeId: 'r', segmentIndex: decision.segmentIndex,
      distanceStatus: decision.distanceStatus!,
    } : null;
    state = { ...state, segmentIndex: decision.segmentIndex, lastObservedAtMs: sample.capturedAt,
      lastObservedQualityExcluded: decision.qualityExcluded,
      lastStoredPoint: point ?? state.lastStoredPoint,
      lastGeometryPoint: point && ['anchor', 'counted'].includes(point.distanceStatus) ? point : state.lastGeometryPoint };
  } else if (decision.resetExcludedCoverage) {
    state = { ...state, lastObservedQualityExcluded: false };
  }
  return decision;
}

check(ROUTE_QUALITY_POLICY_V2.version === 2 && ROUTE_QUALITY_POLICY_V2.maximumHorizontalAccuracyMeters === 100, 'named policy');
const anchor = observe(base);
check(anchor.observed && anchor.distanceStatus === 'anchor' && anchor.distanceMeters === 0, 'first point anchors segment');
const tooSoon = observe({ ...base, horizontalAccuracy: 101, capturedAt: start + 1_000 });
check(tooSoon.observed && !tooSoon.store && tooSoon.segmentIndex === 1, 'quality loss breaks distance even within storage cadence');
const poor = observe({ ...base, horizontalAccuracy: 101, capturedAt: start + 2_000 });
check(poor.observed && poor.distanceStatus === 'low-precision' && poor.excludedDurationMs === 1_000, 'poor sample retained and observed interval counted');
const missing = observe({ ...base, horizontalAccuracy: null, capturedAt: start + 4_000 });
check(missing.observed && missing.distanceStatus === 'missing-accuracy' && missing.excludedDurationMs === 2_000, 'missing accuracy excluded, not treated as zero');
const recovered = observe({ ...base, longitude: 0.001, horizontalAccuracy: 100, capturedAt: start + 6_000 });
check(recovered.observed && recovered.distanceStatus === 'anchor' && recovered.segmentIndex === 1 && recovered.excludedDurationMs === 0, '100 m boundary eligible, recovery anchors without bridging');
const counted = observe({ ...base, longitude: 0.002, horizontalAccuracy: 8, capturedAt: start + 10_000 });
check(counted.observed && counted.distanceStatus === 'counted' && counted.distanceMeters > 110, 'eligible movement contributes distance');
const stationary = observe({ ...base, longitude: 0.00201, capturedAt: start + 12_000 });
check(stationary.observed && stationary.distanceStatus === 'stationary' && stationary.distanceMeters === 0, 'stationary sample retained but excluded');
const spike = observe({ ...base, longitude: 0.1, capturedAt: start + 14_000 });
check(spike.observed && spike.distanceStatus === 'spike' && spike.segmentIndex === 2 && spike.distanceMeters === 0, 'spike retained and severs geometry');
const afterSpike = observe({ ...base, longitude: 0.0021, capturedAt: start + 16_000 });
check(afterSpike.observed && afterSpike.distanceStatus === 'anchor' && afterSpike.distanceMeters === 0, 'after spike starts new geometry');
check(!observe({ ...base, capturedAt: start + 16_000 }).observed, 'out of order rejected');
check(!observe({ ...base, capturedAt: start + 17_000 }, start + 17_000 + ROUTE_GAP_MS).observed, 'stale rejected');
const gap = observe({ ...base, longitude: 0.0022, capturedAt: start + 16_000 + ROUTE_GAP_MS });
check(gap.observed && gap.distanceStatus === 'anchor' && gap.segmentIndex === 3 && gap.excludedDurationMs === 0, 'callback gap starts segment');

state = { ...state, segmentIndex: state.segmentIndex + 1, lastObservedAtMs: null, lastObservedQualityExcluded: false };
const resumed = observe({ ...base, longitude: 0.0023, capturedAt: start + 40_000 });
check(resumed.observed && resumed.distanceStatus === 'anchor' && resumed.excludedDurationMs === 0, 'pause/resume starts segment without duration');

state = { segmentIndex: 0, lastObservedAtMs: null, lastObservedQualityExcluded: false, lastStoredPoint: null, lastGeometryPoint: null };
const boundary = observe({ ...base, horizontalAccuracy: 100 });
check(boundary.observed && boundary.distanceStatus === 'anchor', 'exactly 100 m is eligible');
const over = observe({ ...base, horizontalAccuracy: 100.001, capturedAt: start + 2_000 });
check(over.observed && over.distanceStatus === 'low-precision', 'above 100 m is excluded');
const afterLongGap = observe({ ...base, horizontalAccuracy: 200, capturedAt: start + 2_000 + ROUTE_GAP_MS });
check(afterLongGap.observed && afterLongGap.excludedDurationMs === 0, 'missing callbacks add no excluded duration');
const shortMissingCallbacks = observe({ ...base, horizontalAccuracy: 200, capturedAt: start + 2_000 + ROUTE_GAP_MS + 5_000 });
check(shortMissingCallbacks.observed && shortMissingCallbacks.excludedDurationMs === 0, 'multi-second callback silence below segment gap adds no duration');
const invalidBetween = observe({ ...base, latitude: 91, capturedAt: start + 2_000 + ROUTE_GAP_MS + 6_000 });
check(!invalidBetween.observed && invalidBetween.resetExcludedCoverage, 'invalid callback cuts excluded-duration continuity');
const afterInvalid = observe({ ...base, horizontalAccuracy: 200, capturedAt: start + 2_000 + ROUTE_GAP_MS + 7_000 });
check(afterInvalid.observed && afterInvalid.excludedDurationMs === 0, 'no duration is invented across invalid callback');
