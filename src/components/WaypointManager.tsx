import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { LocationObject } from 'expo-location';
import { useWaypoints } from '../hooks/useWaypoints';
import type { Waypoint, WaypointCapture, WaypointDraft } from '../types/waypoint';
import { formatMeasurement, readingAgeSeconds } from '../utils/locationDisplay';
import { captureLocationSnapshot, isCaptureFresh, normalizeWaypointDraft } from '../utils/waypointValidation';

interface Props {
  reading: LocationObject | null;
  locationUsable: boolean;
  now: number;
}

const emptyDraft: WaypointDraft = { name: '', note: '' };

function ActionButton({ label, onPress, disabled = false, danger = false }: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress}
      style={[styles.button, danger && styles.dangerButton, disabled && styles.disabledButton]}>
      <Text style={[styles.buttonText, danger && styles.dangerButtonText]}>{label}</Text>
    </Pressable>
  );
}

function WaypointFields({ draft, onChange, disabled }: {
  draft: WaypointDraft;
  onChange: (draft: WaypointDraft) => void;
  disabled: boolean;
}) {
  return (
    <>
      <Text style={styles.label}>Name (required)</Text>
      <TextInput accessibilityLabel="Waypoint name" editable={!disabled} maxLength={120}
        onChangeText={(name) => onChange({ ...draft, name })} placeholder="Waypoint name"
        placeholderTextColor="#71889b" style={styles.input} value={draft.name} />
      <Text style={styles.label}>Note (optional)</Text>
      <TextInput accessibilityLabel="Waypoint note" editable={!disabled} maxLength={1000} multiline
        onChangeText={(note) => onChange({ ...draft, note })} placeholder="Add a note"
        placeholderTextColor="#71889b" style={[styles.input, styles.noteInput]}
        textAlignVertical="top" value={draft.note} />
    </>
  );
}

function SnapshotDetails({ capture, now }: { capture: WaypointCapture; now: number }) {
  const age = readingAgeSeconds(capture.capturedAt, now);
  return (
    <View style={styles.snapshot}>
      <Text style={styles.snapshotText}>Capture age: {age === null ? 'Unavailable' : `${age} seconds`}</Text>
      <Text style={styles.snapshotText}>
        Reported horizontal accuracy: {formatMeasurement(capture.horizontalAccuracy, 1, ' m')}
      </Text>
      <Text style={styles.muted}>This accuracy is Android&apos;s reported estimate. A larger value is shown as reported and does not block saving.</Text>
    </View>
  );
}

export function WaypointManager({ reading, locationUsable, now }: Props) {
  const store = useWaypoints();
  const [capture, setCapture] = useState<WaypointCapture | null>(null);
  const [saveDraft, setSaveDraft] = useState<WaypointDraft>(emptyDraft);
  const [selected, setSelected] = useState<Waypoint | null>(null);
  const [editDraft, setEditDraft] = useState<WaypointDraft>(emptyDraft);
  const [formError, setFormError] = useState<string | null>(null);

  const currentCapture = reading ? captureLocationSnapshot(reading) : null;
  const canOpenSave = locationUsable && currentCapture !== null && !store.loading;
  const captureStillUsable = capture !== null && locationUsable && isCaptureFresh(capture, now);

  function openSaveForm() {
    if (!canOpenSave || !currentCapture) return;
    setCapture({ ...currentCapture });
    setSaveDraft(emptyDraft);
    setFormError(null);
  }

  async function saveWaypoint() {
    if (!capture) return;
    if (!normalizeWaypointDraft(saveDraft)) {
      setFormError('Enter a waypoint name.');
      return;
    }
    if (!locationUsable || !isCaptureFresh(capture, Date.now())) {
      setFormError('This captured location is now stale or location access is unavailable. Close this form and capture a fresh location.');
      return;
    }
    if (await store.create(capture, saveDraft)) {
      setCapture(null);
      setSaveDraft(emptyDraft);
      setFormError(null);
    }
  }

  function openDetails(waypoint: Waypoint) {
    setSelected(waypoint);
    setEditDraft({ name: waypoint.name, note: waypoint.note ?? '' });
    setFormError(null);
  }

  async function updateWaypoint() {
    if (!selected) return;
    if (!normalizeWaypointDraft(editDraft)) {
      setFormError('Enter a waypoint name.');
      return;
    }
    if (await store.update(selected.id, editDraft)) {
      setSelected(null);
      setFormError(null);
    }
  }

  function confirmDelete() {
    if (!selected) return;
    Alert.alert('Delete waypoint?', `Delete “${selected.name}” from this device?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        void store.remove(selected.id).then((deleted) => {
          if (deleted) setSelected(null);
        });
      } },
    ]);
  }

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Saved waypoints</Text>
      <Text style={styles.muted}>Waypoints are stored only in this app on this device.</Text>
      {capture ? (
        <View style={styles.panel}>
          <Text style={styles.subheading}>Save captured location</Text>
          <SnapshotDetails capture={capture} now={now} />
          <WaypointFields draft={saveDraft} onChange={setSaveDraft} disabled={store.writing} />
          {formError ? <Text style={styles.error}>{formError}</Text> : null}
          {!captureStillUsable ? <Text style={styles.warning}>This captured location is stale or location access is unavailable. Cancel and capture a fresh location.</Text> : null}
          <View style={styles.actions}>
            <ActionButton label={store.writing ? 'Saving…' : 'Save waypoint'} onPress={() => void saveWaypoint()} disabled={store.writing || !captureStillUsable} />
            <ActionButton label="Cancel" onPress={() => { setCapture(null); setFormError(null); }} disabled={store.writing} />
          </View>
        </View>
      ) : (
        <>
          <ActionButton label="Save current location" onPress={openSaveForm} disabled={!canOpenSave || store.writing} />
          {!canOpenSave ? <Text style={styles.warning}>A fresh, available location is required before saving.</Text> : null}
        </>
      )}
      {store.error ? (
        <View style={styles.messagePanel}>
          <Text style={styles.error}>{store.error}</Text>
          {!store.writing ? <ActionButton label="Reload waypoints" onPress={() => void store.reload()} /> : null}
        </View>
      ) : null}
      {store.notice ? <Text style={styles.success}>{store.notice}</Text> : null}
      {store.malformedRecordCount > 0 ? (
        <Text style={styles.error}>{store.malformedRecordCount} stored waypoint record(s) could not be read. They remain in local storage.</Text>
      ) : null}
      {selected ? (
        <View style={styles.panel}>
          <Text style={styles.subheading}>Waypoint details</Text>
          <Text style={styles.detail}>Latitude: {formatMeasurement(selected.latitude, 6, '°')}</Text>
          <Text style={styles.detail}>Longitude: {formatMeasurement(selected.longitude, 6, '°')}</Text>
          <Text style={styles.detail}>Altitude: {formatMeasurement(selected.altitude, 1, ' m')}</Text>
          <Text style={styles.detail}>Reported horizontal accuracy: {formatMeasurement(selected.horizontalAccuracy, 1, ' m')}</Text>
          <Text style={styles.detail}>Captured: {new Date(selected.capturedAt).toLocaleString()}</Text>
          <Text style={styles.detail}>Created: {new Date(selected.createdAt).toLocaleString()}</Text>
          <Text style={styles.detail}>Modified: {new Date(selected.modifiedAt).toLocaleString()}</Text>
          <WaypointFields draft={editDraft} onChange={setEditDraft} disabled={store.writing} />
          {formError ? <Text style={styles.error}>{formError}</Text> : null}
          <View style={styles.actions}>
            <ActionButton label={store.writing ? 'Saving…' : 'Save changes'} onPress={() => void updateWaypoint()} disabled={store.writing} />
            <ActionButton label="Close" onPress={() => { setSelected(null); setFormError(null); }} disabled={store.writing} />
            <ActionButton label="Delete" onPress={confirmDelete} disabled={store.writing} danger />
          </View>
        </View>
      ) : null}
      {store.loading ? <Text style={styles.muted}>Loading saved waypoints…</Text> : null}
      {!store.loading && store.waypoints.length === 0 ? <Text style={styles.empty}>No saved waypoints yet.</Text> : null}
      {store.waypoints.map((waypoint) => (
        <Pressable key={waypoint.id} accessibilityRole="button" onPress={() => openDetails(waypoint)} style={styles.row}>
          <Text style={styles.rowName}>{waypoint.name}</Text>
          <Text style={styles.muted}>{new Date(waypoint.capturedAt).toLocaleString()}</Text>
          <Text style={styles.muted}>{formatMeasurement(waypoint.latitude, 6, '°')}, {formatMeasurement(waypoint.longitude, 6, '°')}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24 },
  heading: { color: '#ffffff', fontSize: 26, fontWeight: '700' },
  subheading: { color: '#ffffff', fontSize: 20, fontWeight: '700', marginBottom: 12 },
  muted: { color: '#a9bed0', lineHeight: 20, marginTop: 6 },
  warning: { color: '#f4d7a1', lineHeight: 20, marginTop: 10 },
  panel: { backgroundColor: '#132334', borderRadius: 16, padding: 18, marginTop: 16 },
  messagePanel: { marginTop: 12 },
  snapshot: { backgroundColor: '#0d1c29', borderRadius: 10, padding: 12, marginBottom: 16 },
  snapshotText: { color: '#ffffff', lineHeight: 22 },
  label: { color: '#d9e4ec', fontWeight: '600', marginTop: 12, marginBottom: 6 },
  input: { backgroundColor: '#08131f', borderColor: '#456078', borderWidth: 1, borderRadius: 9, color: '#ffffff', padding: 12 },
  noteInput: { minHeight: 88 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  button: { alignSelf: 'flex-start', backgroundColor: '#d9f4e8', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 11, marginTop: 12 },
  disabledButton: { opacity: 0.45 },
  buttonText: { color: '#102820', fontWeight: '700' },
  dangerButton: { backgroundColor: '#f2c5c5' },
  dangerButtonText: { color: '#4d1717' },
  error: { color: '#ffb8b8', lineHeight: 20, marginTop: 12 },
  success: { color: '#a7e8ca', lineHeight: 20, marginTop: 12 },
  empty: { color: '#a9bed0', fontStyle: 'italic', marginTop: 18 },
  row: { backgroundColor: '#132334', borderRadius: 12, padding: 16, marginTop: 12 },
  rowName: { color: '#ffffff', fontSize: 18, fontWeight: '700' },
  detail: { color: '#d9e4ec', lineHeight: 22, marginTop: 4 },
});
