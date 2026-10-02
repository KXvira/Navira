import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { LocationPhase } from '../types/location';
import { accuracyDescription } from '../utils/accuracyDisplay';
import { formatMeasurement } from '../utils/locationDisplay';

const messages: Record<LocationPhase, string> = {
  starting: 'Starting location services…', waiting: 'Waiting for a location update…',
  receiving: 'Receiving location updates', stale: 'Location reading is stale',
  'permission-denied': 'Foreground location permission is denied. Allow it in app settings, then retry.',
  'services-disabled': 'Device Location is off. Turn it on, then retry.', error: 'Location update failed.',
};
export function LocationStatus({ phase, age, accuracy, error, onRetry }: { phase: LocationPhase; age: number | null; accuracy: number | null | undefined; error: string | null; onRetry: () => void }) {
  const quality = accuracyDescription(accuracy);
  const fresh = phase === 'receiving';
  const preciseEnoughForGreen = fresh && quality === 'reported';
  const canRetry = ['permission-denied', 'services-disabled', 'error', 'stale'].includes(phase);
  return <View style={[styles.card, preciseEnoughForGreen ? styles.live : styles.caution]}>
    <Text style={styles.status}>{fresh && quality === 'low' ? 'Fresh update · low reported precision' : fresh && quality === 'unavailable' ? 'Fresh update · accuracy unavailable' : messages[phase]}</Text>
    <Text style={styles.note}>{age === null ? 'No reading yet' : `Updated ${age} s ago`} · Accuracy {formatMeasurement(accuracy, 1, ' m')}</Text>
    {error && <Text style={styles.note}>{error}</Text>}
    {canRetry && <Pressable accessibilityRole="button" onPress={onRetry} style={styles.button}><Text style={styles.buttonText}>Retry location</Text></Pressable>}
  </View>;
}
const styles = StyleSheet.create({ card: { borderRadius: 12, padding: 14, marginBottom: 12 }, live: { backgroundColor: '#12352e' }, caution: { backgroundColor: '#3b3022' }, status: { color: '#fff', fontSize: 16, fontWeight: '700' }, note: { color: '#e0e4e5', marginTop: 5, lineHeight: 20 }, button: { alignSelf: 'flex-start', backgroundColor: '#d9f4e8', paddingHorizontal: 16, minHeight: 44, justifyContent: 'center', borderRadius: 8, marginTop: 10 }, buttonText: { color: '#102820', fontWeight: '700' } });
