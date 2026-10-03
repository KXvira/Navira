import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InfoButton } from '../components/InfoButton';
import { LocationStatus } from '../components/LocationStatus';
import { Reading } from '../components/Reading';
import { useAppData } from '../hooks/AppData';
import { formatMeasurement, formatSpeed, readingAgeSeconds } from '../utils/locationDisplay';

export function LocationScreen() {
  const { location, phase, now } = useAppData();
  const coords = location.state.reading?.coords;
  const age = readingAgeSeconds(location.state.reading?.timestamp ?? null, now);
  return <SafeAreaView style={styles.screen} edges={['left', 'right']}><ScrollView contentContainerStyle={styles.content}>
    <LocationStatus phase={phase} age={age} accuracy={coords?.accuracy} error={location.state.error} onRetry={location.retry} />
    <View style={styles.grid}>
      <Reading label="Latitude" value={formatMeasurement(coords?.latitude, 6, '°')} />
      <Reading label="Longitude" value={formatMeasurement(coords?.longitude, 6, '°')} />
      <Reading label="Horizontal accuracy" value={formatMeasurement(coords?.accuracy, 1, ' m')} />
      <Reading label="Altitude" value={formatMeasurement(coords?.altitude, 1, ' m')} />
      <Reading label="Speed" value={formatSpeed(coords?.speed)} />
    </View>
    <View style={styles.info}><InfoButton title="Location readings" message="Readings come from Android location services. Expo Location does not establish that they came exclusively from GNSS. Reported accuracy is an estimate, not a measured error. Coordinates stay on this device and are stored only when you save a waypoint or start a foreground route recording." /></View>
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#08131f' }, content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, info: { alignSelf: 'flex-start', marginTop: 8 } });
