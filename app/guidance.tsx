import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from '../src/components/ActionButton';
import { InfoButton } from '../src/components/InfoButton';
import { useAppData } from '../src/hooks/AppData';
import { bearingLabel, formatDistance, straightLineGuidance } from '../src/utils/guidance';
import { formatMeasurement } from '../src/utils/locationDisplay';
import { captureLocationSnapshot } from '../src/utils/waypointValidation';
import { router } from 'expo-router';

export default function GuidanceScreen() {
  const { location, phase, waypoints, destinationId, setDestinationId } = useAppData();
  const destination = waypoints.waypoints.find((item) => item.id === destinationId);
  const current = location.state.reading ? captureLocationSnapshot(location.state.reading) : null;
  const result = destination && current && phase === 'receiving' ? straightLineGuidance(current, destination) : null;
  return <SafeAreaView style={styles.screen} edges={['bottom', 'left', 'right']}><ScrollView contentContainerStyle={styles.content}>
    {!destination ? <Text style={styles.warning}>No destination selected. Choose a saved waypoint.</Text> : <>
      <Text style={styles.name}>To {destination.name}</Text><Text style={styles.muted}>Straight-line guidance</Text>
      {result ? <View style={styles.panel}>
        <Text style={styles.distance}>{formatDistance(result.distanceMeters)}</Text>
        <Text style={styles.bearing}>{result.bearingDegrees === null ? 'Same reported position · no bearing' : `${result.bearingDegrees.toFixed(0)}° true · ${bearingLabel(result.bearingDegrees)}`}</Text>
      </View> : <View style={styles.paused}><Text style={styles.warning}>Current location is stale or unavailable. Live guidance is paused.</Text></View>}
      <Text style={styles.accuracy}>Current accuracy: {formatMeasurement(current?.horizontalAccuracy, 1, ' m')}</Text>
      <Text style={styles.accuracy}>Saved accuracy: {formatMeasurement(destination.horizontalAccuracy, 1, ' m')}</Text>
      <Text style={styles.muted}>Reported uncertainty may be large relative to this distance. Exact arrival is not claimed.</Text>
      <InfoButton title="Straight-line guidance" message="Distance is the shortest geographic path between the reported coordinates. Bearing is the initial course clockwise from true north, not an arrow aligned to your phone. This is not a road or walking route. Reported accuracies are estimates." />
      <ActionButton label="Clear destination" onPress={() => { setDestinationId(null); router.back(); }} />
    </>}
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#08131f' }, content: { padding: 18, paddingBottom: 36 }, name: { color: '#fff', fontSize: 23, fontWeight: '700' }, muted: { color: '#a9bed0', lineHeight: 21, marginTop: 7 }, panel: { backgroundColor: '#132334', borderRadius: 14, padding: 20, marginTop: 18 }, paused: { backgroundColor: '#3b3022', borderRadius: 14, padding: 16, marginTop: 18 }, distance: { color: '#fff', fontSize: 36, fontWeight: '700' }, bearing: { color: '#d9f4e8', fontSize: 20, marginTop: 10 }, accuracy: { color: '#d9e4ec', marginTop: 13 }, warning: { color: '#f4d7a1', lineHeight: 21 } });
