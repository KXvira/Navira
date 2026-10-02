import type { RecordedRoute, RoutePoint, RouteSample } from '../src/types/route';
import { activeElapsedAt, pauseRecording, recoverInterruptedRecording, resumeRecording, stopRecording } from '../src/utils/recordingState';
import { evaluateRouteSample, ROUTE_GAP_MS } from '../src/utils/routeSampling';

const check = (value: boolean, message: string) => { if (!value) throw new Error(message); };
const start = 1_800_000_000_000;
const route: RecordedRoute = { id: 'r1', name: null, status: 'recording', pauseReason: null, createdAt: start,
  updatedAt: start, activeElapsedMs: 5_000, activeSinceMs: start, segmentIndex: 0,
  pointCount: 0, distanceMeters: 0, lastPoint: null };
check(activeElapsedAt(route, start + 3_000) === 8_000, 'active time adds live interval');
const paused = pauseRecording(route, 'manual', start + 3_000);
check(paused.status === 'paused' && paused.activeElapsedMs === 8_000 && paused.activeSinceMs === null, 'pause stores elapsed time');
const resumed = resumeRecording(paused, start + 20_000);
check(resumed.segmentIndex === 1 && resumed.activeSinceMs === start + 20_000, 'resume begins a new segment');
const stopped = stopRecording(resumed, start + 24_000);
check(stopped.status === 'stopped' && stopped.activeElapsedMs === 12_000, 'stop ends active time');
const recovered = recoverInterruptedRecording({ ...route, activeElapsedMs: 7_000 }, start + 600_000);
check(recovered.status === 'paused' && recovered.pauseReason === 'interrupted' && recovered.activeElapsedMs === 7_000 && recovered.activeSinceMs === null, 'restart cannot count closed time');
check(recoverInterruptedRecording(paused, start + 600_000) === paused, 'already paused recording is unchanged');

const first: RouteSample = { latitude: 0, longitude: 0, altitude: null, horizontalAccuracy: 5, capturedAt: start };
const accepted = evaluateRouteSample(first, null, 0, start + 100);
check(accepted.accepted && accepted.distanceMeters === 0, 'first sample starts without distance');
const last: RoutePoint = { id: 1, routeId: 'r1', segmentIndex: 0, ...first };
check(!evaluateRouteSample(first, last, 0, start + 100).accepted, 'duplicate timestamp rejected');
check(!evaluateRouteSample({ ...first, capturedAt: start - 1 }, last, 0, start + 100).accepted, 'out-of-order timestamp rejected');
check(evaluateRouteSample({ ...first, capturedAt: start + 2_000 }, last, 0, start + 4_100, start + 3_000).accepted === false, 'sample older than a filtered observation rejected');
check(!evaluateRouteSample({ ...first, latitude: 91, capturedAt: start + 3_000 }, last, 0, start + 3_100).accepted, 'invalid coordinate rejected');
check(!evaluateRouteSample({ ...first, capturedAt: start + 3_000 }, last, 0, start + ROUTE_GAP_MS + 3_000).accepted, 'stale sample rejected');
check(!evaluateRouteSample({ ...first, longitude: 0.00004, capturedAt: start + 3_000 }, last, 0, start + 3_100).accepted, 'stationary jitter rejected');
check(!evaluateRouteSample({ ...first, longitude: 0.0005, horizontalAccuracy: 800, capturedAt: start + 3_000 }, last, 0, start + 3_100).accepted, 'reported uncertainty limits jitter');
const moved = evaluateRouteSample({ ...first, longitude: 0.001, capturedAt: start + 3_000 }, last, 0, start + 3_100);
check(moved.accepted && moved.distanceMeters > 110 && moved.distanceMeters < 112, 'same-segment distance counts known movement');
const gap = evaluateRouteSample({ ...first, longitude: 0.01, capturedAt: start + ROUTE_GAP_MS + 1 }, last, 0, start + ROUTE_GAP_MS + 100);
check(gap.accepted && gap.segmentIndex === 1 && gap.distanceMeters === 0, 'time gap starts segment with no bridging distance');
const manualBreak = evaluateRouteSample({ ...first, longitude: 0.001, capturedAt: start + 3_000 }, last, 1, start + 3_100);
check(manualBreak.accepted && manualBreak.segmentIndex === 1 && manualBreak.distanceMeters === 0, 'pause/resume starts segment with no bridging distance');
const stationaryCallbacks = evaluateRouteSample({ ...first, longitude: 0.001, capturedAt: start + ROUTE_GAP_MS + 1 }, last, 0, start + ROUTE_GAP_MS + 100, start + ROUTE_GAP_MS - 1_000);
check(stationaryCallbacks.accepted && stationaryCallbacks.segmentIndex === 0 && stationaryCallbacks.distanceMeters > 0, 'filtered stationary callbacks do not create a false gap');
