import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { LocationPhase } from '../types/location';

const messages: Record<LocationPhase, string> = {
  starting: 'Starting location services…',
  waiting: 'Waiting for a location update…',
  receiving: 'Receiving location updates',
  stale: 'Location reading is stale',
  'permission-denied': 'Foreground location permission is denied. Allow it in app settings, then retry.',
  'services-disabled': 'Device Location is off. Turn it on, then retry.',
  error: 'Location update failed.',
};

export function LocationStatus({
  phase,
  age,
  error,
  onRetry,
}: {
  phase: LocationPhase;
  age: number | null;
  error: string | null;
  onRetry: () => void;
}) {
  const canRetry = phase === 'permission-denied' || phase === 'services-disabled' || phase === 'error' || phase === 'stale';
  return (
    <View style={[styles.card, phase === 'receiving' ? styles.live : styles.other]}>
      <Text style={styles.status}>{messages[phase]}</Text>
      {error ? <Text style={styles.note}>{error}</Text> : null}
      <Text style={styles.note}>
        {age === null ? 'No reading yet. For better reception, try an open outdoor area.' : `Last update: ${age} seconds ago`}
      </Text>
      {canRetry ? (
        <Pressable accessibilityRole="button" onPress={onRetry} style={styles.button}>
          <Text style={styles.buttonText}>Retry location</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 18, marginBottom: 20 },
  live: { backgroundColor: '#12352e' },
  other: { backgroundColor: '#3b3022' },
  status: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  note: { color: '#e0e4e5', marginTop: 8, lineHeight: 20 },
  button: { alignSelf: 'flex-start', backgroundColor: '#d9f4e8', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, marginTop: 16 },
  buttonText: { color: '#102820', fontWeight: '700' },
});
