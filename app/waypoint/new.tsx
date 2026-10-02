import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from '../../src/components/ActionButton';
import { WaypointFields } from '../../src/components/WaypointFields';
import { useAppData } from '../../src/hooks/AppData';
import type { WaypointDraft } from '../../src/types/waypoint';
import { formatMeasurement, readingAgeSeconds } from '../../src/utils/locationDisplay';
import { isCaptureFresh, normalizeWaypointDraft } from '../../src/utils/waypointValidation';

export default function NewWaypointScreen() {
  const { saveCapture, setSaveCapture, phase, now, waypoints } = useAppData();
  const [draft, setDraft] = useState<WaypointDraft>({ name: '', note: '' });
  const [error, setError] = useState<string | null>(null);
  const usable = !!saveCapture && phase === 'receiving' && isCaptureFresh(saveCapture, now);
  async function save() {
    if (!saveCapture) return;
    if (!normalizeWaypointDraft(draft)) { setError('Enter a waypoint name.'); return; }
    if (phase !== 'receiving' || !isCaptureFresh(saveCapture, Date.now())) { setError('This captured location is stale or location access is unavailable. Return to Waypoints and capture a fresh location.'); return; }
    if (await waypoints.create(saveCapture, draft)) { setSaveCapture(null); router.back(); }
  }
  return <SafeAreaView style={styles.screen} edges={['bottom', 'left', 'right']}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    {saveCapture ? <><View style={styles.panel}><Text style={styles.text}>Capture age: {readingAgeSeconds(saveCapture.capturedAt, now) ?? 'Unavailable'} seconds</Text><Text style={styles.text}>Reported horizontal accuracy: {formatMeasurement(saveCapture.horizontalAccuracy, 1, ' m')}</Text><Text style={styles.muted}>The coordinates stay fixed while this form is open. Reported accuracy does not block saving.</Text></View>
      <WaypointFields draft={draft} onChange={setDraft} disabled={waypoints.writing} />
      {!usable && <Text style={styles.warning}>The captured location is stale or unavailable. Return and capture a fresh location.</Text>}
      {error && <Text style={styles.error}>{error}</Text>}{waypoints.error && <Text style={styles.error}>{waypoints.error}</Text>}
      <ActionButton label={waypoints.writing ? 'Saving…' : 'Save waypoint'} onPress={() => void save()} disabled={!usable || waypoints.writing} /></> : <Text style={styles.warning}>No captured location. Return to Waypoints and use Save current location.</Text>}
    <ActionButton label="Cancel" onPress={() => { setSaveCapture(null); router.back(); }} disabled={waypoints.writing} />
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#08131f' }, content: { padding: 24, paddingBottom: 48 }, panel: { backgroundColor: '#132334', borderRadius: 14, padding: 16, marginTop: 18 }, text: { color: '#fff', lineHeight: 24 }, muted: { color: '#a9bed0', lineHeight: 21, marginTop: 8 }, warning: { color: '#f4d7a1', lineHeight: 21, marginTop: 14 }, error: { color: '#ffb8b8', lineHeight: 21, marginTop: 14 } });
