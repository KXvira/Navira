import { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from '../src/components/ActionButton';
import { InfoButton } from '../src/components/InfoButton';
import { SpatialMap, type SpatialMapControls } from '../src/components/SpatialMap';
import { useAppData } from '../src/hooks/AppData';
import { useSpatialRoutes } from '../src/hooks/useSpatialRoutes';
import { formatMeasurement, readingAgeSeconds } from '../src/utils/locationDisplay';
import { routeGeometry, visibleRoutePoints } from '../src/utils/spatialGeometry';

export default function MapScreen() {
  const { routeId, waypointId } = useLocalSearchParams<{ routeId?: string; waypointId?: string }>();
  const { waypoints, location, phase, now } = useAppData();
  const { pointsByRoute, error, loading } = useSpatialRoutes();
  const controls = useRef<SpatialMapControls>(null);
  const reading = location.state.reading;
  const fresh = phase === 'receiving' && reading !== null;
  const current: [number, number] | null = fresh ? [reading.coords.longitude, reading.coords.latitude] : null;
  const age = readingAgeSeconds(reading?.timestamp ?? null, now);
  const hasRoute = Object.values(visibleRoutePoints(pointsByRoute, routeId)).some((points) => routeGeometry(points).coordinates.length > 0);
  return <><Stack.Screen options={{ title: 'Local map' }} /><SafeAreaView style={styles.screen} edges={['bottom', 'left', 'right']}>
    <View style={styles.notice}><Text style={styles.title}>Local spatial view · No street or terrain basemap installed</Text>
      <View style={styles.legend}><Text style={styles.details}>Pin W · Start square · Finish circle · You</Text><InfoButton title="Map cues" message="Pins are saved waypoints. Squares mark the first displayed eligible sample of each continuous route stretch; numbered starts identify multiple stretches. Round F markers show their last eligible samples. A single-point stretch has one Start / Finish marker. Route gaps and excluded samples are not connected. Start and Finish may differ from recording times when edge samples were excluded. The blue You marker appears only for a fresh location reading. Its geographic circle shows reported horizontal uncertainty in metres, not a guaranteed boundary. The scale changes with pan and zoom. No street or terrain basemap is installed." /></View>
      <Text style={styles.details}>Location: {fresh ? 'Fresh' : phase.replace('-', ' ')}{age !== null ? ` · ${age} s old` : ''} · Reported accuracy: {formatMeasurement(fresh ? reading?.coords.accuracy : null, 1, ' m')}{!fresh ? ' (marker hidden)' : ''}</Text>
      {loading && <Text style={styles.details}>Loading saved routes…</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
    <SpatialMap waypoints={waypoints.waypoints} pointsByRoute={pointsByRoute} routeId={routeId} waypointId={waypointId} current={current} accuracy={fresh ? reading?.coords.accuracy : null} controls={controls} onWaypointDetails={(id) => router.push({ pathname: '/waypoint/[id]', params: { id } })} />
    <View style={styles.actions}><ActionButton label="Fit route" disabled={!hasRoute} onPress={() => controls.current?.fitRoute()} /><ActionButton label="Recenter" disabled={!fresh} onPress={() => controls.current?.recenter()} /></View>
  </SafeAreaView></>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#08131f' }, notice: { paddingHorizontal: 14, paddingVertical: 6 }, legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, title: { color: '#fff', fontWeight: '700', lineHeight: 21 }, details: { color: '#a9bed0', lineHeight: 19, marginTop: 2 }, error: { color: '#ffb8b8', marginTop: 4 }, actions: { flexDirection: 'row', gap: 12, paddingHorizontal: 14, paddingBottom: 14 } });
