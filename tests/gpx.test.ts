import type { RecordedRoute, RoutePoint } from '../src/types/route';
import { routeToGpx } from '../src/utils/gpx';
const start = 1_800_000_000_000;
const route: RecordedRoute = { id: 'r1', name: 'A & <B> "C" 😃', status: 'saved', pauseReason: null, createdAt: start,
  updatedAt: start, activeElapsedMs: 10_000, activeSinceMs: null, segmentIndex: 1,
  pointCount: 2, distanceMeters: 0, lastPoint: null };
const points: RoutePoint[] = [
  { id: 1, routeId: 'r1', segmentIndex: 0, latitude: 1, longitude: 2, altitude: 0, horizontalAccuracy: 8, capturedAt: start },
  { id: 2, routeId: 'r1', segmentIndex: 1, latitude: 3, longitude: 4, altitude: null, horizontalAccuracy: null, capturedAt: start + 10_000 },
];
const xml = routeToGpx(route, points);
if (!xml.includes('version="1.1"') || !xml.includes('A &amp; &lt;B&gt; &quot;C&quot; 😃')) throw new Error('Invalid GPX header or name escaping');
if ((xml.match(/<trkseg>/g) ?? []).length !== 2) throw new Error('Segment boundaries missing');
if ((xml.match(/<ele>0<\/ele>/g) ?? []).length !== 1) throw new Error('Zero elevation must be retained');
if (xml.includes('hdop') || xml.includes('horizontalAccuracy')) throw new Error('Accuracy must not be mislabeled as HDOP');
if (!xml.includes(new Date(start).toISOString())) throw new Error('UTC timestamp missing');
console.log(xml);
