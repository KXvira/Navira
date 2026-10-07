import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from '../../src/components/ActionButton';
import { useAppData } from '../../src/hooks/AppData';
import { formatMeasurement } from '../../src/utils/locationDisplay';

export default function WaypointDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { waypoints, destinationId, setDestinationId } = useAppData();
  const waypoint = waypoints.waypoints.find((item) => item.id === id);
  function confirmDelete() {
    if (!waypoint) return;
    Alert.alert('Delete waypoint?', `Delete “${waypoint.name}” from this device?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { void waypoints.remove(waypoint.id).then((deleted) => { if (deleted) { if (destinationId === waypoint.id) setDestinationId(null); router.back(); } }); } },
    ]);
  }
  return <><Stack.Screen options={{ title: waypoint?.name ?? 'Waypoint' }} /><SafeAreaView style={styles.screen} edges={['bottom', 'left', 'right']}><ScrollView contentContainerStyle={styles.content}>
    {!waypoint ? <Text style={styles.muted}>{waypoints.loading ? 'Loading waypoint…' : 'Waypoint unavailable. It may have been deleted or could not be read.'}</Text> : <>
      {waypoint.note ? <Text style={styles.note}>{waypoint.note}</Text> : null}
      <Text style={styles.detail}>Latitude: {formatMeasurement(waypoint.latitude, 6, '°')}</Text>
      <Text style={styles.detail}>Longitude: {formatMeasurement(waypoint.longitude, 6, '°')}</Text>
      <Text style={styles.detail}>Altitude: {formatMeasurement(waypoint.altitude, 1, ' m')}</Text>
      <Text style={styles.detail}>Reported horizontal accuracy: {formatMeasurement(waypoint.horizontalAccuracy, 1, ' m')}</Text>
      <Text style={styles.muted}>Captured {new Date(waypoint.capturedAt).toLocaleString()}</Text>
      <Text style={styles.muted}>Modified {new Date(waypoint.modifiedAt).toLocaleString()}</Text>
      <ActionButton label={destinationId === waypoint.id ? 'View guidance' : 'Set as destination'} onPress={() => { setDestinationId(waypoint.id); router.push('/guidance'); }} />
      <ActionButton label="View on map" onPress={() => router.push({ pathname: '/map', params: { waypointId: waypoint.id } })} />
      <ActionButton label="Edit name and note" onPress={() => router.push({ pathname: '/waypoint/edit', params: { id: waypoint.id } })} />
      {waypoints.error && <Text style={styles.error}>{waypoints.error}</Text>}
      <ActionButton label="Delete waypoint" onPress={confirmDelete} disabled={waypoints.writing} danger />
    </>}
  </ScrollView></SafeAreaView></>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#08131f' }, content: { padding: 18, paddingBottom: 36 }, note: { color: '#fff', fontSize: 17, lineHeight: 24, marginBottom: 16 }, detail: { color: '#d9e4ec', lineHeight: 23, marginTop: 4 }, muted: { color: '#a9bed0', lineHeight: 20, marginTop: 8 }, error: { color: '#ffb8b8', lineHeight: 21, marginTop: 14 } });
