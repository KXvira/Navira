import { isInsideCoverage, parseOfflineMapPackage } from '../src/utils/offlineMapPackage';

function check(condition: boolean) { if (!condition) throw new Error('Map package assertion failed'); }
function rejects(value: unknown) { try { parseOfflineMapPackage(value); } catch { return; } throw new Error('Invalid map package was accepted'); }

const sample = {
  format: 'navira-geojson-v1', name: 'Small map', bounds: [35.95, -0.18, 35.98, -0.15],
  attribution: '© OpenStreetMap contributors · ODbL 1.0', source: 'Local data',
  features: { type: 'FeatureCollection', features: [{ type: 'Feature', properties: { kind: 'road', class: 'residential', name: '' }, geometry: { type: 'LineString', coordinates: [[35.96, -0.17], [35.97, -0.16]] } }] },
};
const parsed = parseOfflineMapPackage(sample);
check(parsed.name === 'Small map');
check(isInsideCoverage(parsed.bounds, [35.95, -0.18]));
check(!isInsideCoverage(parsed.bounds, [35.99, -0.17]));
rejects({ ...sample, bounds: [35.98, -0.18, 35.95, -0.15] });
rejects({ ...sample, features: { type: 'FeatureCollection', features: [{ ...sample.features.features[0], geometry: null }] } });
rejects({ ...sample, attribution: '' });
