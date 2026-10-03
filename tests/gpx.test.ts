import type { RecordedRoute, RoutePoint } from '../src/types/route';
import { routeToGpx } from '../src/utils/gpx';
const start = 1_800_000_000_000;
const route: RecordedRoute = { id: 'r1', name: 'A & <B> "C" 😃', status: 'saved', pauseReason: null, createdAt: start,
  updatedAt: start, activeElapsedMs: 10_000, activeSinceMs: null, segmentIndex: 1,
  pointCount: 2, distanceMeters: 0, policyVersion: 1, distancePointCount: null,
  excludedDurationMs: 0, lastObservedAtMs: null, lastObservedQualityExcluded: false, lastPoint: null };
const points: RoutePoint[] = [
  { id: 1, routeId: 'r1', segmentIndex: 0, latitude: 1, longitude: 2, altitude: 0, horizontalAccuracy: 8, capturedAt: start, distanceStatus: 'legacy' },
  { id: 2, routeId: 'r1', segmentIndex: 1, latitude: 3, longitude: 4, altitude: null, horizontalAccuracy: null, capturedAt: start + 10_000, distanceStatus: 'legacy' },
];
const xml = routeToGpx(route, points);
if (!xml.includes('version="1.1"') || !xml.includes('A &amp; &lt;B&gt; &quot;C&quot; 😃')) throw new Error('Invalid GPX header or name escaping');
if ((xml.match(/<trkseg>/g) ?? []).length !== 2) throw new Error('Segment boundaries missing');
if ((xml.match(/<ele>0<\/ele>/g) ?? []).length !== 1) throw new Error('Zero elevation must be retained');
if (xml.includes('hdop') || xml.includes('horizontalAccuracy')) throw new Error('Accuracy must not be mislabeled as HDOP');
if (!xml.includes(new Date(start).toISOString())) throw new Error('UTC timestamp missing');
const qualityRoute: RecordedRoute = { ...route, policyVersion: 2, pointCount: 5, distancePointCount: 1 };
const qualityPoints: RoutePoint[] = [
  { ...points[0], id: 1, segmentIndex: 0, distanceStatus: 'anchor' },
  { ...points[0], id: 2, segmentIndex: 0, capturedAt: start + 2_000, distanceStatus: 'counted' },
  { ...points[0], id: 3, segmentIndex: 1, capturedAt: start + 4_000, distanceStatus: 'low-precision' },
  { ...points[0], id: 4, segmentIndex: 1, capturedAt: start + 6_000, distanceStatus: 'missing-accuracy' },
  { ...points[0], id: 5, segmentIndex: 1, capturedAt: start + 8_000, distanceStatus: 'anchor' },
];
const qualityXml = routeToGpx(qualityRoute, qualityPoints);
if ((qualityXml.match(/<trkseg>/g) ?? []).length !== 2 || (qualityXml.match(/<trkpt /g) ?? []).length !== 3) throw new Error('Quality exclusions must not reconnect track geometry');
if (qualityXml.includes(new Date(start + 4_000).toISOString()) || qualityXml.includes(new Date(start + 6_000).toISOString())) throw new Error('Excluded points must not appear in GPX track');
console.log(xml);
