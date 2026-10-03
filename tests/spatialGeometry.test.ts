import type { RoutePoint } from '../src/types/route';
import { coordinateBounds, routeGeometry } from '../src/utils/spatialGeometry';

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
