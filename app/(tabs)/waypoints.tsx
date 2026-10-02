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
  const current = location.state.reading ? captureLocationSnapshot(location.state.reading) : null;
  const canSave = phase === 'receiving' && !!current && !waypoints.loading;
  const destination = waypoints.waypoints.find((item) => item.id === destinationId);
  useEffect(() => { if (destinationId && !destination && !waypoints.loading) setDestinationId(null); }, [destinationId, destination, waypoints.loading, setDestinationId]);
  const guidance = destination && current && phase === 'receiving' ? straightLineGuidance(current, destination) : null;
  function openSave() { if (!canSave || !current) return; setSaveCapture({ ...current }); router.push('/waypoint/new'); }
  return <SafeAreaView style={styles.screen} edges={['left', 'right']}><FlatList<Waypoint>
    data={waypoints.waypoints} keyExtractor={(item) => item.id} contentContainerStyle={styles.content}
    ListHeaderComponent={<View>
      <ActionButton label="Save current location" onPress={openSave} disabled={!canSave || waypoints.writing} />
      {!canSave && <Text style={styles.warning}>A fresh location is required to save.</Text>}
      {waypoints.error && <View><Text style={styles.error}>{waypoints.error}</Text><ActionButton label="Reload waypoints" onPress={() => void waypoints.reload()} disabled={waypoints.writing} /></View>}
      {waypoints.notice && <Text style={styles.success}>{waypoints.notice}</Text>}
      {waypoints.malformedRecordCount > 0 && <Text style={styles.error}>{waypoints.malformedRecordCount} stored record(s) could not be read. They remain on this device.</Text>}
      {destination && <Pressable accessibilityRole="button" accessibilityLabel={`Open straight-line guidance to ${destination.name}`} onPress={() => router.push('/guidance')} style={styles.summary}>
        <View style={styles.summaryTop}><Text numberOfLines={1} style={styles.summaryName}>To {destination.name}</Text><Text style={styles.open}>View ›</Text></View>
        <Text style={styles.summaryValue}>{guidance ? `${formatDistance(guidance.distanceMeters)} · ${guidance.bearingDegrees === null ? 'Bearing unavailable' : `${guidance.bearingDegrees.toFixed(0)}° true ${bearingLabel(guidance.bearingDegrees)}`}` : 'Guidance paused · location stale or unavailable'}</Text>
      </Pressable>}
      <Text style={styles.heading}>Saved places</Text>{waypoints.loading && <Text style={styles.muted}>Loading saved waypoints…</Text>}
    </View>}
    ListEmptyComponent={!waypoints.loading ? <Text style={styles.muted}>No saved waypoints yet. Save a fresh location to start.</Text> : null}
    renderItem={({ item }) => <Pressable accessibilityRole="button" accessibilityLabel={`Details for ${item.name}`} onPress={() => router.push({ pathname: '/waypoint/[id]', params: { id: item.id } })} style={styles.row}>
      <Text numberOfLines={1} style={styles.rowName}>{item.name}{destinationId === item.id ? ' · Destination' : ''}</Text>
      <Text style={styles.muted}>{formatMeasurement(item.latitude, 6, '°')}, {formatMeasurement(item.longitude, 6, '°')}</Text>
    </Pressable>}
  /></SafeAreaView>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#08131f' }, content: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 24, flexGrow: 1 }, heading: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 20, marginBottom: 4 }, summary: { backgroundColor: '#132334', borderRadius: 12, padding: 12, marginTop: 12, minHeight: 70 }, summaryTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 }, summaryName: { color: '#fff', fontSize: 16, fontWeight: '700', flex: 1 }, summaryValue: { color: '#d9f4e8', marginTop: 4 }, open: { color: '#a7e8ca', fontWeight: '700' }, row: { backgroundColor: '#132334', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, marginTop: 8, minHeight: 58 }, rowName: { color: '#fff', fontSize: 16, fontWeight: '700' }, muted: { color: '#a9bed0', lineHeight: 19, marginTop: 3 }, warning: { color: '#f4d7a1', lineHeight: 20, marginTop: 6 }, error: { color: '#ffb8b8', lineHeight: 20, marginTop: 7 }, success: { color: '#a7e8ca', lineHeight: 20, marginTop: 7 } });
