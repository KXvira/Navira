import type { FeatureCollection, LineString, Point } from 'geojson';
import type { RoutePoint } from '../types/route';
import type { Waypoint } from '../types/waypoint';
import { displaySegments } from './mapCues';
export { isEligibleRoutePoint } from './mapCues';

export function routeGeometry(points: RoutePoint[]): { lines: FeatureCollection<LineString>; anchors: FeatureCollection<Point>; coordinates: [number, number][] } {
  const all = displaySegments(points).map((part) => part.points.map((point): [number, number] => [point.longitude, point.latitude]));
  return {
    lines: { type: 'FeatureCollection', features: all.filter((part) => part.length >= 2).map((part) => ({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: part } })) },
    anchors: { type: 'FeatureCollection', features: all.flatMap((part) => part.length === 1 ? [{ type: 'Feature' as const, properties: {}, geometry: { type: 'Point' as const, coordinates: part[0] } }] : []) },
    coordinates: all.flat(),
  };
}

export function visibleRoutePoints(pointsByRoute: Record<string, RoutePoint[]>, routeId?: string): Record<string, RoutePoint[]> {
  if (!routeId) return pointsByRoute;
  return pointsByRoute[routeId] ? { [routeId]: pointsByRoute[routeId] } : {};
}

export function waypointGeometry(waypoints: Waypoint[]): FeatureCollection<Point> {
  return { type: 'FeatureCollection', features: waypoints.filter((point) => Number.isFinite(point.latitude) && Number.isFinite(point.longitude) && Math.abs(point.latitude) <= 90 && Math.abs(point.longitude) <= 180).map((point) => ({ type: 'Feature', properties: { id: point.id, name: point.name }, geometry: { type: 'Point', coordinates: [point.longitude, point.latitude] } })) };
}

export function coordinateBounds(coordinates: [number, number][]): [number, number, number, number] | null {
  if (!coordinates.length) return null;
  const longitudes = coordinates.map((point) => point[0]);
  const latitudes = coordinates.map((point) => point[1]);
  return [Math.min(...longitudes), Math.min(...latitudes), Math.max(...longitudes), Math.max(...latitudes)];
}
