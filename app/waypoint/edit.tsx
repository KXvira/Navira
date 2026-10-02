import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from '../../src/components/ActionButton';
import { WaypointFields } from '../../src/components/WaypointFields';
import { useAppData } from '../../src/hooks/AppData';
import type { Waypoint, WaypointDraft } from '../../src/types/waypoint';
import { normalizeWaypointDraft } from '../../src/utils/waypointValidation';

export default function EditWaypointScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { waypoints } = useAppData();
  const waypoint = waypoints.waypoints.find((item) => item.id === id);
  if (!waypoint) return <SafeAreaView style={styles.screen}><Text style={styles.muted}>{waypoints.loading ? 'Loading waypoint…' : 'Waypoint unavailable.'}</Text></SafeAreaView>;
  return <EditForm key={waypoint.id} waypoint={waypoint} waypoints={waypoints} />;
}
function EditForm({ waypoint, waypoints }: { waypoint: Waypoint; waypoints: ReturnType<typeof useAppData>['waypoints'] }) {
  const [draft, setDraft] = useState<WaypointDraft>({ name: waypoint.name, note: waypoint.note ?? '' });
  const [error, setError] = useState<string | null>(null);
  async function save() {
    if (!normalizeWaypointDraft(draft)) { setError('Enter a waypoint name.'); return; }
    if (await waypoints.update(waypoint.id, draft)) router.back();
  }
  return <SafeAreaView style={styles.screen} edges={['bottom', 'left', 'right']}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <WaypointFields draft={draft} onChange={setDraft} disabled={waypoints.writing} />
    {error && <Text style={styles.error}>{error}</Text>}{waypoints.error && <Text style={styles.error}>{waypoints.error}</Text>}
    <ActionButton label={waypoints.writing ? 'Saving…' : 'Save changes'} onPress={() => void save()} disabled={waypoints.writing} />
    <ActionButton label="Cancel" onPress={() => router.back()} disabled={waypoints.writing} />
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#08131f' }, content: { padding: 18, paddingBottom: 36 }, muted: { color: '#a9bed0', margin: 18 }, error: { color: '#ffb8b8', lineHeight: 21, marginTop: 14 } });
