import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from '../src/components/ActionButton';
import { InfoButton } from '../src/components/InfoButton';
import { OfflineMapPanel } from '../src/components/OfflineMapPanel';
import { SpatialMap, type SpatialMapControls } from '../src/components/SpatialMap';
import { useAppData } from '../src/hooks/AppData';
import { useOfflineMaps } from '../src/hooks/useOfflineMaps';
import { useSpatialRoutes } from '../src/hooks/useSpatialRoutes';
import { formatMeasurement, readingAgeSeconds } from '../src/utils/locationDisplay';
import { routeGeometry, visibleRoutePoints } from '../src/utils/spatialGeometry';

export default function MapScreen() {
  const { routeId, waypointId } = useLocalSearchParams<{ routeId?: string; waypointId?: string }>();
  const { waypoints, location, phase, now } = useAppData();
  const { pointsByRoute, error, loading, retry } = useSpatialRoutes();
  const controls = useRef<SpatialMapControls>(null);
  const maps = useOfflineMaps();
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const reading = location.state.reading;
  const fresh = phase === 'receiving' && reading !== null;
  const current: [number, number] | null = fresh ? [reading.coords.longitude, reading.coords.latitude] : null;
  const age = readingAgeSeconds(reading?.timestamp ?? null, now);
  const hasRoute = Object.values(visibleRoutePoints(pointsByRoute, routeId)).some((points) => routeGeometry(points).coordinates.length > 0);
  return <><Stack.Screen options={{ title: 'Local map' }} /><SafeAreaView style={styles.screen} edges={['bottom', 'left', 'right']}>
    <View style={styles.notice}><Text style={styles.title}>Local map</Text>
      <View style={styles.legend}><Text style={styles.details}>W waypoint · S/F endpoints · route dots · You</Text><InfoButton title="Map cues" message="Line shows thin eligible route stretches with small Start and Finish cues. A small unlabelled dot is an isolated eligible sample; tap it for its stored segment and time. Points shows all saved samples, including excluded ones; tap a dot for its stored segment, quality status, time and reported accuracy. Stationary samples are omitted from line geometry without breaking their stored segment. Quality loss, spikes, pauses and genuine gaps stay disconnected. W marks a saved waypoint; You appears only for a fresh location reading. Its circle shows reported horizontal uncertainty, not a guaranteed boundary. The scale changes with pan and zoom. Offline basemap coverage is limited to the selected package bounds." /></View>
      <Text style={styles.details}>Location: {fresh ? 'Fresh' : phase.replace('-', ' ')}{age !== null ? ` · ${age} s old` : ''} · Reported accuracy: {formatMeasurement(fresh ? reading?.coords.accuracy : null, 1, ' m')}{!fresh ? ' (marker hidden)' : ''}</Text>
      {loading && <Text style={styles.details}>Loading saved routes…</Text>}
      {error && <View style={styles.legend}><Text style={styles.error}>{error}</Text><Pressable accessibilityRole="button" accessibilityLabel="Retry loading saved routes" onPress={retry}><Text style={styles.retry}>Retry</Text></Pressable></View>}
    </View>
    <OfflineMapPanel maps={maps} center={mapCenter} current={current} />
    <SpatialMap waypoints={waypoints.waypoints} pointsByRoute={pointsByRoute} routeId={routeId} waypointId={waypointId} current={current} accuracy={fresh ? reading?.coords.accuracy : null} offlineMap={maps.selectedMap} controls={controls} onCenterChange={setMapCenter} onWaypointDetails={(id) => router.push({ pathname: '/waypoint/[id]', params: { id } })} />
    <View style={styles.actions}><ActionButton label="Fit route" disabled={!hasRoute} onPress={() => controls.current?.fitRoute()} /><ActionButton label="Fit coverage" disabled={!maps.selectedMap} onPress={() => controls.current?.fitCoverage()} /><ActionButton label="Recenter" disabled={!fresh} onPress={() => controls.current?.recenter()} /></View>
  </SafeAreaView></>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#08131f' }, notice: { paddingHorizontal: 14, paddingVertical: 6 }, legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, title: { color: '#fff', fontWeight: '700', lineHeight: 21 }, details: { color: '#a9bed0', lineHeight: 19, marginTop: 2 }, error: { color: '#ffb8b8', marginTop: 4 }, retry: { color: '#a7e8ca', fontWeight: '700', padding: 8 }, actions: { flexDirection: 'row', gap: 12, paddingHorizontal: 14, paddingBottom: 14 } });
