import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LocationStatus } from '../components/LocationStatus';
import { Reading } from '../components/Reading';
import { useAppData } from '../hooks/AppData';
import { formatMeasurement, formatSpeed, readingAgeSeconds } from '../utils/locationDisplay';

export function LocationScreen() {
  const { location, phase, now } = useAppData();
  const coords = location.state.reading?.coords;
  const age = readingAgeSeconds(location.state.reading?.timestamp ?? null, now);
  return <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Navira</Text>
      <Text style={styles.subtitle}>Offline GNSS Lab</Text>
      <LocationStatus phase={phase} age={age} error={location.state.error} onRetry={location.retry} />
      <Reading label="Latitude" value={formatMeasurement(coords?.latitude, 6, '°')} />
      <Reading label="Longitude" value={formatMeasurement(coords?.longitude, 6, '°')} />
      <Reading label="Reported horizontal accuracy" value={formatMeasurement(coords?.accuracy, 1, ' m')} />
      <Reading label="Altitude" value={formatMeasurement(coords?.altitude, 1, ' m')} />
      <Reading label="Speed" value={formatSpeed(coords?.speed)} />
      <Text style={styles.footer}>Readings come from Android location services. Expo Location does not establish that they came exclusively from GNSS. Coordinates stay on this device.</Text>
    </ScrollView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#08131f' },
  content: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 32 },
  title: { color: '#ffffff', fontSize: 40, fontWeight: '700' },
  subtitle: { color: '#a9bed0', fontSize: 16, marginTop: 4, marginBottom: 28 },
  footer: { color: '#a9bed0', lineHeight: 22, marginTop: 16 },
});
