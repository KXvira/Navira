import { useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from '../../src/components/ActionButton';
import { useAppData } from '../../src/hooks/AppData';
import { formatMeasurement } from '../../src/utils/locationDisplay';
import { captureLocationSnapshot } from '../../src/utils/waypointValidation';
import { bearingLabel, formatDistance, straightLineGuidance } from '../../src/utils/guidance';
import type { Waypoint } from '../../src/types/waypoint';

export default function WaypointsScreen() {
  const { location, phase, waypoints, destinationId, setDestinationId, setSaveCapture } = useAppData();
  const reading = location.state.reading;
  const current = reading ? captureLocationSnapshot(reading) : null;
  const canSave = phase === 'receiving' && !!current && !waypoints.loading;
  const destination = waypoints.waypoints.find((item) => item.id === destinationId);
  useEffect(() => { if (destinationId && !destination && !waypoints.loading) setDestinationId(null); }, [destinationId, destination, waypoints.loading, setDestinationId]);
  const guidance = destination && current && phase === 'receiving' ? straightLineGuidance(current, destination) : null;
  function openSave() { if (!canSave || !current) return; setSaveCapture({ ...current }); router.push('/waypoint/new'); }
  return <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}><FlatList<Waypoint>
    data={waypoints.waypoints} keyExtractor={(item) => item.id} contentContainerStyle={styles.content}
    ListHeaderComponent={<View><Text style={styles.title}>Waypoints</Text><Text style={styles.muted}>Saved only in this app on this device.</Text>
      <ActionButton label="Save current location" onPress={openSave} disabled={!canSave || waypoints.writing} />
      {!canSave && <Text style={styles.warning}>A fresh, available location is required before saving.</Text>}
      {waypoints.error && <View><Text style={styles.error}>{waypoints.error}</Text><ActionButton label="Reload waypoints" onPress={() => void waypoints.reload()} disabled={waypoints.writing} /></View>}
      {waypoints.notice && <Text style={styles.success}>{waypoints.notice}</Text>}
      {waypoints.malformedRecordCount > 0 && <Text style={styles.error}>{waypoints.malformedRecordCount} stored waypoint record(s) could not be read. They remain in local storage.</Text>}
      {destination && <View style={styles.panel}><Text style={styles.heading}>Straight-line guidance to {destination.name}</Text>
        {guidance ? <><Text style={styles.value}>{formatDistance(guidance.distanceMeters)}</Text><Text style={styles.detail}>{guidance.bearingDegrees === null ? 'Same reported position; bearing unavailable.' : `Initial bearing: ${guidance.bearingDegrees.toFixed(0)}° true (${bearingLabel(guidance.bearingDegrees)})`}</Text>
          <Text style={styles.muted}>Current reported accuracy: {formatMeasurement(current?.horizontalAccuracy, 1, ' m')} · Saved accuracy: {formatMeasurement(destination.horizontalAccuracy, 1, ' m')}</Text>
          <Text style={styles.muted}>These estimates may be large relative to the distance. No exact arrival is claimed.</Text></> : <Text style={styles.warning}>Current location is stale or unavailable. Live guidance is paused.</Text>}
        <Text style={styles.muted}>Direct geographic distance and initial bearing only. No road or walking directions; bearing is relative to true north, not the phone.</Text>
        <ActionButton label="Clear destination" onPress={() => setDestinationId(null)} /></View>}
      <Text style={styles.heading}>Saved places</Text>{waypoints.loading && <Text style={styles.muted}>Loading saved waypoints…</Text>}</View>}
    ListEmptyComponent={!waypoints.loading ? <Text style={styles.muted}>No saved waypoints yet. Save a fresh location to start.</Text> : null}
    renderItem={({ item }) => <Pressable accessibilityRole="button" accessibilityLabel={`Details for ${item.name}`} onPress={() => router.push({ pathname: '/waypoint/[id]', params: { id: item.id } })} style={styles.row}>
      <Text style={styles.rowName}>{item.name}{destinationId === item.id ? ' · Destination' : ''}</Text><Text style={styles.muted}>{new Date(item.capturedAt).toLocaleString()}</Text><Text style={styles.muted}>{formatMeasurement(item.latitude, 6, '°')}, {formatMeasurement(item.longitude, 6, '°')}</Text>
    </Pressable>}
  /></SafeAreaView>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#08131f' }, content: { padding: 24, paddingTop: 20, paddingBottom: 36, flexGrow: 1 }, title: { color: '#fff', fontSize: 32, fontWeight: '700' }, heading: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 26, marginBottom: 8 }, panel: { backgroundColor: '#132334', borderRadius: 16, padding: 18, marginTop: 22 }, value: { color: '#fff', fontSize: 30, fontWeight: '700', marginTop: 12 }, detail: { color: '#fff', fontSize: 17, marginTop: 8 }, row: { backgroundColor: '#132334', borderRadius: 12, padding: 16, marginTop: 12, minHeight: 72 }, rowName: { color: '#fff', fontSize: 18, fontWeight: '700' }, muted: { color: '#a9bed0', lineHeight: 21, marginTop: 7 }, warning: { color: '#f4d7a1', lineHeight: 21, marginTop: 10 }, error: { color: '#ffb8b8', lineHeight: 21, marginTop: 10 }, success: { color: '#a7e8ca', lineHeight: 21, marginTop: 10 } });
