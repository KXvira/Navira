import type { RoutePoint } from '../src/types/route';
import { coordinateBounds, routeGeometry, visibleRoutePoints } from '../src/utils/spatialGeometry';

function equal(actual: unknown, expected: unknown) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

const point = (id: number, segmentIndex: number, longitude: number, distanceStatus: RoutePoint['distanceStatus']): RoutePoint => ({ id, routeId: 'r', segmentIndex, latitude: 1, longitude, altitude: null, horizontalAccuracy: 5, capturedAt: id * 1000, distanceStatus });
const result = routeGeometry([
  point(1, 0, 1, 'anchor'), point(2, 0, 2, 'counted'),
  point(3, 0, 20, 'low-precision'), point(4, 1, 21, 'anchor'), point(5, 1, 22, 'counted'),
  point(6, 2, 30, 'anchor'), point(7, 2, 31, 'missing-accuracy'),
]);
equal(result.lines.features.length, 2);
equal(result.lines.features.map((feature) => feature.geometry.coordinates), [[[1, 1], [2, 1]], [[21, 1], [22, 1]]]);
equal(result.anchors.features.map((feature) => feature.geometry.coordinates), [[30, 1]]);
equal(coordinateBounds(result.coordinates), [1, 1, 30, 1]);
equal(coordinateBounds([]), null);

// The owner-exported Kitchen GPX has seven points in one segment, including an 18-second saved-point interval.
// Map geometry must preserve that segment and a selected route must not include another route's line.
const kitchen = [
  [35.9711518, 0.0002504, 0], [35.9712582, 0.0002864, 14000],
  [35.9713377, 0.0003691, 28999], [35.9714265, 0.0004346, 43999],
  [35.9715133, 0.0005004, 57000], [35.9715568, 0.0005877, 68999],
  [35.9716273, 0.0006649, 86997],
].map(([longitude, latitude, elapsed], index): RoutePoint => ({ ...point(index + 1, 0, longitude, 'legacy'), routeId: 'kitchen', latitude, capturedAt: 1_727_970_504_970 + elapsed }));
const other = [point(8, 0, 36, 'legacy'), point(9, 0, 36.001, 'legacy')];
equal(routeGeometry(kitchen).lines.features.length, 1);
equal(routeGeometry(kitchen).lines.features[0].geometry.coordinates.length, 7);
equal(Object.keys(visibleRoutePoints({ kitchen, other }, 'kitchen')), ['kitchen']);
equal(Object.keys(visibleRoutePoints({ kitchen, other })), ['kitchen', 'other']);

import { accuracyGeometry, displaySegments } from '../src/utils/mapCues';
const split = [
  point(1, 0, 1, 'low-precision'), point(2, 0, 2, 'anchor'),
  point(3, 0, 3, 'counted'), point(4, 1, 4, 'spike'),
  point(5, 1, 5, 'anchor'), point(6, 1, 6, 'counted'),
  point(7, 2, 7, 'anchor'), point(8, 3, 8, 'missing-accuracy'),
];
const stretches = displaySegments([...split].reverse());
equal(stretches.map((s) => [s.index, s.start.id, s.finish.id]), [[1, 2, 3], [2, 5, 6], [3, 7, 7]]);
equal(routeGeometry(split).lines.features.map((f) => f.geometry.coordinates), [[[2, 1], [3, 1]], [[5, 1], [6, 1]]]);
equal(displaySegments([]), []);
equal(displaySegments([point(1, 0, 1, 'anchor')]).map((s) => [s.start.id, s.finish.id]), [[1, 1]]);
const stationaryRows = [point(1, 4, 1, 'anchor'), point(2, 4, 2, 'stationary'), point(3, 4, 3, 'counted')];
equal(displaySegments(stationaryRows).map((s) => [s.index, s.start.segmentIndex, s.start.id, s.finish.id]), [[1, 4, 1, 3]]);
equal(routeGeometry(stationaryRows).lines.features[0].geometry.coordinates, [[1, 1], [3, 1]]);
const qualityBreak = [point(4, 4, 4, 'anchor'), point(5, 5, 5, 'low-precision'), point(6, 5, 6, 'anchor')];
equal(displaySegments(qualityBreak).map((s) => [s.index, s.start.segmentIndex, s.start.id]), [[1, 4, 4], [2, 5, 6]]);
equal(routeGeometry(qualityBreak).lines.features.length, 0);
const circle = accuracyGeometry([36, 0], 1000).features[0].geometry.coordinates[0];
const north = circle[0];
const east = circle[16];
if (Math.abs((north[1] - 0) * 111195 - 1000) > 2 || Math.abs((east[0] - 36) * 111195 - 1000) > 2) throw new Error('Accuracy geometry must use metre radius');
equal(accuracyGeometry([36, 0], null).features.length, 0);
equal(accuracyGeometry([36, 0], 0).features.length, 0);
const coincident = displaySegments([point(10, 0, 9, 'anchor'), point(11, 0, 9, 'counted')]);
equal([coincident[0].start.id, coincident[0].finish.id], [10, 11]);
