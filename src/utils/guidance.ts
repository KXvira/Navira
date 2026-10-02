export type Coordinate = { latitude: number; longitude: number };

const EARTH_RADIUS_METERS = 6371008.8;
const radians = (degrees: number) => degrees * Math.PI / 180;

export function straightLineGuidance(from: Coordinate, to: Coordinate): { distanceMeters: number; bearingDegrees: number | null } | null {
  const values = [from.latitude, from.longitude, to.latitude, to.longitude];
  if (values.some((value) => !Number.isFinite(value)) || Math.abs(from.latitude) > 90 || Math.abs(to.latitude) > 90 || Math.abs(from.longitude) > 180 || Math.abs(to.longitude) > 180) return null;
  const phi1 = radians(from.latitude);
  const phi2 = radians(to.latitude);
  const deltaPhi = phi2 - phi1;
  const deltaLambda = radians(((to.longitude - from.longitude + 540) % 360) - 180);
  const haversine = Math.sin(deltaPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  const distanceMeters = 2 * EARTH_RADIUS_METERS * Math.asin(Math.min(1, Math.sqrt(haversine)));
  if (distanceMeters < 0.001) return { distanceMeters: 0, bearingDegrees: null };
  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  return { distanceMeters, bearingDegrees: (Math.atan2(y, x) * 180 / Math.PI + 360) % 360 };
}

const DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;
export function bearingLabel(degrees: number): string {
  return DIRECTIONS[Math.floor((((degrees % 360) + 360) % 360 + 22.5) / 45) % 8];
}

export function formatDistance(meters: number): string {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(2)} km`;
}
