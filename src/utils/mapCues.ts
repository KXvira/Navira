import type { FeatureCollection, Polygon } from 'geojson';
import type { RoutePoint } from '../types/route';

export function isEligibleRoutePoint(point: RoutePoint): boolean {
  return point.distanceStatus === 'legacy' || point.distanceStatus === 'anchor' || point.distanceStatus === 'counted';
}

export type DisplaySegment = { index: number; points: RoutePoint[]; start: RoutePoint; finish: RoutePoint };

export function displaySegments(points: RoutePoint[]): DisplaySegment[] {
  const ordered = [...points].sort((a, b) => a.capturedAt - b.capturedAt || a.id - b.id);
  const stretches: RoutePoint[][] = [];
  let active: RoutePoint[] = [];
  for (const point of ordered) {
    const valid = Number.isFinite(point.latitude) && Math.abs(point.latitude) <= 90 && Number.isFinite(point.longitude) && Math.abs(point.longitude) <= 180;
    // Excluded rows are omitted from geometry. Policy 2 advances segmentIndex for
    // quality loss and spikes, but stationary rows retain the segment: GPX does too.
    if (!valid || !isEligibleRoutePoint(point)) continue;
    if (active.length && active[0].segmentIndex !== point.segmentIndex) { stretches.push(active); active = []; }
    active.push(point);
  }
  if (active.length) stretches.push(active);
  return stretches.map((part, index) => ({ index: index + 1, points: part, start: part[0], finish: part[part.length - 1] }));
}

// Great-circle destination points keep the radius in metres at any map zoom.
export function accuracyGeometry(center: [number, number] | null, radius: number | null | undefined): FeatureCollection<Polygon> {
  const empty: FeatureCollection<Polygon> = { type: 'FeatureCollection', features: [] };
  if (!center || radius == null || !Number.isFinite(radius) || radius <= 0 || !Number.isFinite(center[0]) || !Number.isFinite(center[1]) || Math.abs(center[1]) > 90 || Math.abs(center[0]) > 180) return empty;
  const earthRadius = 6371008.8;
  const [longitude, latitude] = center.map((degrees) => degrees * Math.PI / 180);
  const angular = Math.min(radius / earthRadius, Math.PI);
  const ring: [number, number][] = [];
  for (let i = 0; i <= 64; i++) {
    const bearing = 2 * Math.PI * i / 64;
    const lat = Math.asin(Math.sin(latitude) * Math.cos(angular) + Math.cos(latitude) * Math.sin(angular) * Math.cos(bearing));
    const lon = longitude + Math.atan2(Math.sin(bearing) * Math.sin(angular) * Math.cos(latitude), Math.cos(angular) - Math.sin(latitude) * Math.sin(lat));
    ring.push([((lon * 180 / Math.PI + 540) % 360) - 180, lat * 180 / Math.PI]);
  }
  ring[64] = ring[0];
  return { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring] } }] };
}
