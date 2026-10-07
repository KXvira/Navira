import type { OfflineMapPackage } from '../types/offlineMap';

export function parseOfflineMapPackage(value: unknown): OfflineMapPackage {
  if (!value || typeof value !== 'object') throw new Error('Invalid map package');
  const pack = value as Partial<OfflineMapPackage>;
  if (pack.format !== 'navira-geojson-v1' || typeof pack.name !== 'string' || typeof pack.attribution !== 'string' || typeof pack.source !== 'string') throw new Error('Unsupported map package');
  const b = pack.bounds;
  if (!Array.isArray(b) || b.length !== 4 || !b.every(Number.isFinite) || b[0] < -180 || b[2] > 180 || b[1] < -90 || b[3] > 90 || b[0] >= b[2] || b[1] >= b[3]) throw new Error('Invalid coverage bounds');
  const features = pack.features;
  if (features?.type !== 'FeatureCollection' || !Array.isArray(features.features) || features.features.length > 5000) throw new Error('Invalid map features');
  for (const feature of features.features) {
    if (feature.type !== 'Feature' || !['road', 'building', 'water', 'land'].includes(feature.properties?.kind)) throw new Error('Unsupported map feature');
    const geometry = feature.geometry;
    if (geometry.type !== 'Polygon' && geometry.type !== 'LineString') throw new Error('Unsupported map geometry');
    const coordinates: number[][] = geometry.type === 'Polygon' ? geometry.coordinates.flat() : geometry.coordinates;
    if (!coordinates.length || coordinates.some((point) => !Array.isArray(point) || point.length !== 2 || !Number.isFinite(point[0]) || !Number.isFinite(point[1]) || Math.abs(point[0]) > 180 || Math.abs(point[1]) > 90)) throw new Error('Invalid map coordinates');
  }
  return pack as OfflineMapPackage;
}

export function isInsideCoverage(bounds: OfflineMapPackage['bounds'], coordinate: [number, number]) {
  return coordinate[0] >= bounds[0] && coordinate[0] <= bounds[2] && coordinate[1] >= bounds[1] && coordinate[1] <= bounds[3];
}
