import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from '../../src/components/ActionButton';
import { WaypointFields } from '../../src/components/WaypointFields';
import { useAppData } from '../../src/hooks/AppData';
import type { Waypoint, WaypointDraft } from '../../src/types/waypoint';
import { formatMeasurement } from '../../src/utils/locationDisplay';
import { normalizeWaypointDraft } from '../../src/utils/waypointValidation';

export default function WaypointDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { waypoints, destinationId, setDestinationId } = useAppData();
  const waypoint = waypoints.waypoints.find((item) => item.id === id);
  if (!waypoint) return <SafeAreaView style={styles.screen}><Text style={styles.muted}>{waypoints.loading ? 'Loading waypoint…' : 'Waypoint unavailable. It may have been deleted or could not be read.'}</Text></SafeAreaView>;
  return <Details key={waypoint.id} waypoint={waypoint} waypoints={waypoints} destinationId={destinationId} setDestinationId={setDestinationId} />;
}

function Details({ waypoint, waypoints, destinationId, setDestinationId }: { waypoint: Waypoint; waypoints: ReturnType<typeof useAppData>['waypoints']; destinationId: string | null; setDestinationId: (id: string | null) => void }) {
  const [draft, setDraft] = useState<WaypointDraft>({ name: waypoint?.name ?? '', note: waypoint?.note ?? '' });
  const [error, setError] = useState<string | null>(null);
  async function save() {
    if (!waypoint) return;
    if (!normalizeWaypointDraft(draft)) { setError('Enter a waypoint name.'); return; }
    if (await waypoints.update(waypoint.id, draft)) { setError(null); router.back(); }
  }
  function confirmDelete() {
    if (!waypoint) return;
    Alert.alert('Delete waypoint?', `Delete “${waypoint.name}” from this device?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { void waypoints.remove(waypoint.id).then((deleted) => { if (deleted) { if (destinationId === waypoint.id) setDestinationId(null); router.back(); } }); } },
    ]);
  }
  return <SafeAreaView style={styles.screen} edges={['bottom', 'left', 'right']}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <><Text style={styles.title}>{waypoint.name}</Text>
      <Text style={styles.detail}>Latitude: {formatMeasurement(waypoint.latitude, 6, '°')}</Text><Text style={styles.detail}>Longitude: {formatMeasurement(waypoint.longitude, 6, '°')}</Text>
      <Text style={styles.detail}>Altitude: {formatMeasurement(waypoint.altitude, 1, ' m')}</Text><Text style={styles.detail}>Reported horizontal accuracy: {formatMeasurement(waypoint.horizontalAccuracy, 1, ' m')}</Text>
      <Text style={styles.detail}>Captured: {new Date(waypoint.capturedAt).toLocaleString()}</Text><Text style={styles.detail}>Created: {new Date(waypoint.createdAt).toLocaleString()}</Text><Text style={styles.detail}>Modified: {new Date(waypoint.modifiedAt).toLocaleString()}</Text>
      <ActionButton label={destinationId === waypoint.id ? 'Selected destination' : 'Navigate to this waypoint'} onPress={() => { setDestinationId(waypoint.id); router.back(); }} disabled={destinationId === waypoint.id} />
      <Text style={styles.heading}>Edit name and note</Text><WaypointFields draft={draft} onChange={setDraft} disabled={waypoints.writing} />
      {error && <Text style={styles.error}>{error}</Text>}{waypoints.error && <Text style={styles.error}>{waypoints.error}</Text>}
      <ActionButton label={waypoints.writing ? 'Saving…' : 'Save changes'} onPress={() => void save()} disabled={waypoints.writing} />
      <ActionButton label="Delete waypoint" onPress={confirmDelete} disabled={waypoints.writing} danger />
    </>
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#08131f' }, content: { padding: 24, paddingBottom: 48 }, title: { color: '#fff', fontSize: 28, fontWeight: '700', marginBottom: 16 }, heading: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 28 }, detail: { color: '#d9e4ec', lineHeight: 24, marginTop: 5 }, muted: { color: '#a9bed0', lineHeight: 21 }, error: { color: '#ffb8b8', lineHeight: 21, marginTop: 14 } });
