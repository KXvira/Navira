import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { RecordedRoute, RoutePoint } from '../types/route';
import { routeToGpx } from '../utils/gpx';

export async function shareRouteGpx(route: RecordedRoute, points: RoutePoint[]): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) throw new Error('The share sheet is unavailable on this device.');
  const file = new File(Paths.cache, `${route.id}.gpx`);
  file.create({ overwrite: true });
  file.write(routeToGpx(route, points));
  await Sharing.shareAsync(file.uri, { mimeType: 'application/gpx+xml', dialogTitle: 'Export route as GPX' });
}
