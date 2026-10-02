import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from '../src/components/ActionButton';
import { InfoButton } from '../src/components/InfoButton';
import { useAppData } from '../src/hooks/AppData';
import { formatDistance } from '../src/utils/guidance';

function formatElapsed(ms: number): string {
  const total = Math.floor(ms / 1000);
  return `${Math.floor(total / 3600)}:${String(Math.floor(total % 3600 / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
export default function RecordingScreen() {
  const { routes, phase } = useAppData();
  const [name, setName] = useState('');
  const draft = routes.draft;
  const canAcquire = phase === 'receiving';
  async function save() { if (await routes.save(name)) router.back(); }
  function confirmDiscard() {
    if (!draft) return;
    Alert.alert('Discard recording?', 'Delete this unfinished route and all saved points from this device?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => { void routes.remove(draft.id).then((removed) => { if (removed) router.back(); }); } },
    ]);
  }
  return <SafeAreaView style={styles.screen} edges={['bottom', 'left', 'right']}><ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <Text style={styles.state}>{routes.loading ? 'Loading recording…' : !draft ? 'Ready to record' : routes.suspended ? 'Recording halted · pause not saved' : draft.status === 'paused' && draft.pauseReason === 'interrupted' ? 'Interrupted recording · resume required' : draft.status === 'paused' && draft.pauseReason === 'background' ? 'Paused after leaving foreground · resume required' : draft.status === 'recording' ? 'Recording in foreground' : draft.status === 'paused' ? 'Paused' : 'Stopped · name and save'}</Text>
    <View style={styles.metrics}><View style={styles.metric}><Text style={styles.label}>Active time</Text><Text style={styles.value}>{formatElapsed(routes.elapsedActiveMs)}</Text></View><View style={styles.metric}><Text style={styles.label}>Saved points</Text><Text style={styles.value}>{draft?.pointCount ?? 0}</Text></View></View>
    <View style={styles.metric}><Text style={styles.label}>Estimated recorded distance</Text><Text style={styles.value}>{formatDistance(draft?.distanceMeters ?? 0)}</Text></View>
    {!canAcquire && <Text style={styles.warning}>Wait for a fresh location before starting or resuming. Existing points remain saved.</Text>}
    {routes.error && <Text style={styles.error}>{routes.error}</Text>}
    {!draft && <ActionButton label="Start recording" onPress={() => void routes.start()} disabled={routes.loading || routes.busy || !canAcquire} />}
    {draft?.status === 'recording' && <><ActionButton label={routes.suspended ? 'Retry pause' : 'Pause recording'} onPress={() => void routes.pause()} disabled={routes.busy} /><ActionButton label="Stop recording" onPress={() => void routes.stop()} disabled={routes.busy || routes.suspended} /></>}
    {draft?.status === 'paused' && <><ActionButton label="Resume recording" onPress={() => void routes.resume()} disabled={routes.busy || !canAcquire} /><ActionButton label="Stop recording" onPress={() => void routes.stop()} disabled={routes.busy} /></>}
    {draft?.status === 'stopped' && <><Text style={styles.label}>Route name (required)</Text><TextInput accessibilityLabel="Route name" maxLength={120} placeholder="Name this route" placeholderTextColor="#71889b" value={name} onChangeText={setName} style={styles.input} /><ActionButton label="Save route" onPress={() => void save()} disabled={routes.busy || !name.trim()} /></>}
    {draft && <ActionButton label="Discard recording" onPress={confirmDiscard} disabled={routes.busy} danger />}
    <Text style={styles.muted}>Recording pauses when the app backgrounds or the phone locks. Return and choose Resume; closed time is not recorded.</Text>
    <InfoButton title="Route recording" message="Navira stores accepted location points locally while the app is foregrounded. It rejects stale and out-of-order samples and filters movement smaller than reported horizontal uncertainty or 10 m. Distance is estimated from accepted points within each segment, and can differ from actual travel. No distance is added across pauses or gaps." />
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#08131f' }, content: { padding: 18, paddingBottom: 38 }, state: { color: '#d9f4e8', fontSize: 18, fontWeight: '700', lineHeight: 24 }, metrics: { flexDirection: 'row', gap: 10, marginTop: 16 }, metric: { backgroundColor: '#132334', borderRadius: 12, padding: 14, marginTop: 10, flexGrow: 1 }, label: { color: '#a9bed0', lineHeight: 20, marginTop: 12 }, value: { color: '#fff', fontSize: 24, fontWeight: '700', marginTop: 4 }, muted: { color: '#a9bed0', lineHeight: 21, marginTop: 18 }, warning: { color: '#f4d7a1', lineHeight: 20, marginTop: 12 }, error: { color: '#ffb8b8', lineHeight: 20, marginTop: 12 }, input: { backgroundColor: '#132334', borderColor: '#456078', borderWidth: 1, borderRadius: 9, color: '#fff', padding: 12, marginTop: 8 } });
