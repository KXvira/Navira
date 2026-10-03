import type { RecordedRoute, RoutePoint } from '../types/route';

function escapeXml(value: string): string {
  // Keep XML 1.0 characters, including valid supplementary Unicode characters.
  return Array.from(value).filter((char) => {
    const code = char.codePointAt(0)!;
    return code === 9 || code === 10 || code === 13 ||
      (code >= 0x20 && code <= 0xD7FF) || (code >= 0xE000 && code <= 0xFFFD) ||
      (code >= 0x10000 && code <= 0x10FFFF);
  }).join('').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export function routeToGpx(route: RecordedRoute, points: RoutePoint[]): string {
  if (route.status !== 'saved' || !route.name) throw new Error('Only named saved routes can be exported.');
  const ordered = [...points].sort((a, b) => a.id - b.id);
  const segments: RoutePoint[][] = [];
  for (const point of ordered) {
    if (!Number.isFinite(point.latitude) || !Number.isFinite(point.longitude) || Math.abs(point.latitude) > 90 || Math.abs(point.longitude) > 180 || !Number.isFinite(point.capturedAt) || point.capturedAt <= 0 || (point.altitude !== null && !Number.isFinite(point.altitude))) throw new Error('Route contains an invalid point.');
    if (!['legacy', 'anchor', 'counted', 'stationary', 'spike', 'missing-accuracy', 'low-precision'].includes(point.distanceStatus)) throw new Error('Route contains an invalid distance status.');
    if (point.distanceStatus !== 'legacy' && point.distanceStatus !== 'anchor' && point.distanceStatus !== 'counted') continue;
    if (!segments.length || segments[segments.length - 1][0].segmentIndex !== point.segmentIndex) segments.push([]);
    segments[segments.length - 1].push(point);
  }
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<gpx version="1.1" creator="Navira" xmlns="http://www.topografix.com/GPX/1/1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">',
    '  <trk>', `    <name>${escapeXml(route.name)}</name>`,
  ];
  for (const segment of segments) {
    lines.push('    <trkseg>');
    for (const point of segment) {
      lines.push(`      <trkpt lat="${point.latitude}" lon="${point.longitude}">`);
      if (point.altitude !== null) lines.push(`        <ele>${point.altitude}</ele>`);
      lines.push(`        <time>${new Date(point.capturedAt).toISOString()}</time>`);
      lines.push('      </trkpt>');
    }
    lines.push('    </trkseg>');
  }
  lines.push('  </trk>', '</gpx>');
  return lines.join('\n') + '\n';
}
