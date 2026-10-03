import { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from '../src/components/ActionButton';
import { SpatialMap, type SpatialMapControls } from '../src/components/SpatialMap';
import { useAppData } from '../src/hooks/AppData';
import { useSpatialRoutes } from '../src/hooks/useSpatialRoutes';
import { formatMeasurement, readingAgeSeconds } from '../src/utils/locationDisplay';
import { routeGeometry } from '../src/utils/spatialGeometry';

export default function MapScreen() {
  const { routeId, waypointId } = useLocalSearchParams<{ routeId?: string; waypointId?: string }>();
  const { waypoints, location, phase, now } = useAppData();
  const { pointsByRoute, error, loading } = useSpatialRoutes();
  const controls = useRef<SpatialMapControls>(null);
  const reading = location.state.reading;
  const fresh = phase === 'receiving' && reading !== null;
  const current: [number, number] | null = fresh ? [reading.coords.longitude, reading.coords.latitude] : null;
  const age = readingAgeSeconds(reading?.timestamp ?? null, now);
  const hasRoute = Object.values(pointsByRoute).some((points) => routeGeometry(points).coordinates.length > 0);
  return <><Stack.Screen options={{ title: 'Local map' }} /><SafeAreaView style={styles.screen} edges={['bottom', 'left', 'right']}>
    <View style={styles.notice}><Text style={styles.title}>Local spatial view · No street or terrain basemap installed</Text>
      <Text style={styles.details}>Yellow: waypoints · Cyan: eligible route segments · Blue: fresh location</Text>
      <Text style={styles.details}>Location: {fresh ? 'Fresh' : phase.replace('-', ' ')}{age !== null ? ` · ${age} s old` : ''} · Reported accuracy: {formatMeasurement(reading?.coords.accuracy, 1, ' m')}{!fresh ? ' (marker hidden)' : ''}</Text>
      {loading && <Text style={styles.details}>Loading saved routes…</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
    <SpatialMap waypoints={waypoints.waypoints} pointsByRoute={pointsByRoute} routeId={routeId} waypointId={waypointId} current={current} controls={controls} />
    <View style={styles.actions}><ActionButton label="Fit route" disabled={!hasRoute} onPress={() => controls.current?.fitRoute()} /><ActionButton label="Recenter" disabled={!fresh} onPress={() => controls.current?.recenter()} /></View>
  </SafeAreaView></>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#08131f' }, notice: { paddingHorizontal: 14, paddingVertical: 10 }, title: { color: '#fff', fontWeight: '700', lineHeight: 21 }, details: { color: '#a9bed0', lineHeight: 19, marginTop: 2 }, error: { color: '#ffb8b8', marginTop: 4 }, actions: { flexDirection: 'row', gap: 12, paddingHorizontal: 14, paddingBottom: 14 } });
