import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { WaypointDraft } from '../types/waypoint';
export function WaypointFields({ draft, onChange, disabled }: { draft: WaypointDraft; onChange: (draft: WaypointDraft) => void; disabled: boolean }) {
  return <View><Text style={styles.label}>Name (required)</Text><TextInput accessibilityLabel="Waypoint name" editable={!disabled} maxLength={120} onChangeText={(name) => onChange({ ...draft, name })} placeholder="Waypoint name" placeholderTextColor="#71889b" style={styles.input} value={draft.name} />
    <Text style={styles.label}>Note (optional)</Text><TextInput accessibilityLabel="Waypoint note" editable={!disabled} maxLength={1000} multiline onChangeText={(note) => onChange({ ...draft, note })} placeholder="Add a note" placeholderTextColor="#71889b" style={[styles.input, styles.note]} textAlignVertical="top" value={draft.note} /></View>;
}
const styles = StyleSheet.create({ label: { color: '#d9e4ec', fontWeight: '600', marginTop: 16, marginBottom: 7 }, input: { backgroundColor: '#08131f', borderColor: '#456078', borderWidth: 1, borderRadius: 9, color: '#fff', padding: 12 }, note: { minHeight: 88 } });
