import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { GnssDiagnostics } from '../components/GnssDiagnostics';
import { LocationStatus } from '../components/LocationStatus';
import { Reading } from '../components/Reading';
import { WaypointManager } from '../components/WaypointManager';
import { useLocationReading } from '../hooks/useLocationReading';
import { useGnssStatus } from '../hooks/useGnssStatus';
import { formatMeasurement, formatSpeed, readingAgeSeconds, visiblePhase } from '../utils/locationDisplay';

export function LocationScreen() {
  const { state, retry } = useLocationReading();
  const gnssActive = state.phase === 'waiting' || state.phase === 'receiving' || state.phase === 'stale';
  const gnss = useGnssStatus(gnssActive);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const coords = state.reading?.coords;
  const age = readingAgeSeconds(state.reading?.timestamp ?? null, now);
  const phase = visiblePhase(state, now);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Navira</Text>
      <Text style={styles.subtitle}>Offline GNSS Lab</Text>
      <LocationStatus phase={phase} age={age} error={state.error} onRetry={retry} />
      <Reading label="Latitude" value={formatMeasurement(coords?.latitude, 6, '°')} />
      <Reading label="Longitude" value={formatMeasurement(coords?.longitude, 6, '°')} />
      <Reading label="Reported horizontal accuracy" value={formatMeasurement(coords?.accuracy, 1, ' m')} />
      <Reading label="Altitude" value={formatMeasurement(coords?.altitude, 1, ' m')} />
      <Reading label="Speed" value={formatSpeed(coords?.speed)} />
      <GnssDiagnostics state={gnss} active={gnssActive} now={now} />
      <Text style={styles.footer}>
        Readings come from Android location services. Expo Location does not establish that they came exclusively from GNSS. Coordinates stay on this device.
      </Text>
      <WaypointManager reading={state.reading} locationUsable={phase === 'receiving'} now={now} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#08131f' },
  content: { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 40 },
  title: { color: '#ffffff', fontSize: 40, fontWeight: '700' },
  subtitle: { color: '#a9bed0', fontSize: 16, marginTop: 4, marginBottom: 28 },
  footer: { color: '#a9bed0', lineHeight: 22, marginTop: 16 },
});
