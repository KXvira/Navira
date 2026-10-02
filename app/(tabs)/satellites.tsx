import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppData } from '../../src/hooks/AppData';
import { formatCn0, gnssAgeSeconds, visibleGnssPhase } from '../../src/utils/gnssDisplay';
import type { GnssSatellite } from '../../src/types/gnss';

const messages = {
  unsupported: 'Native GNSS diagnostics unavailable. Install a rebuilt Android APK; Expo Go cannot load this module.',
  unavailable: 'GNSS status unavailable. Android has not provided a current status.',
  'permission-denied': 'Precise foreground location is required for GNSS status.',
  'services-disabled': 'Turn on Android Location and its GPS provider for GNSS status.',
  waiting: 'Waiting for Android GNSS status…', receiving: 'Receiving Android GNSS status',
  stale: 'GNSS status is stale', paused: 'GNSS diagnostics paused while the app is in the background.',
  error: 'GNSS diagnostics could not start.',
};
export default function SatellitesScreen() {
  const { gnss, gnssActive, now } = useAppData();
  const phase = visibleGnssPhase(gnss, now);
  const snapshot = gnssActive && phase === 'receiving' ? gnss.snapshot : null;
  const age = gnssAgeSeconds(gnss.receivedAtMs, now);
  return <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}><FlatList<GnssSatellite>
    data={snapshot?.satellites ?? []} keyExtractor={(item) => `${item.constellation}-${item.svid}`}
    contentContainerStyle={styles.content}
    ListHeaderComponent={<View><Text style={styles.title}>Satellites</Text>
      <Text style={styles.status}>{gnssActive ? messages[phase] : 'Waiting for foreground location access before starting GNSS diagnostics.'}</Text>
      <Text style={styles.muted}>{age === null ? 'No current GNSS status age available.' : `Last GNSS status: ${age} seconds ago`}</Text>
      <Text style={styles.count}>Reported: {snapshot ? snapshot.reportedCount : 'Unavailable'}</Text>
      <Text style={styles.count}>Used in latest GNSS fix: {snapshot ? snapshot.usedInFixCount : 'Unavailable'}</Text>
      <Text style={styles.muted}>C/N₀ is signal strength density, not positioning accuracy. GNSS status does not prove an Expo location reading came only from GNSS.</Text>
      <Text style={styles.heading}>Satellite list</Text></View>}
    ListEmptyComponent={<Text style={styles.muted}>{snapshot?.reportedCount === 0 ? 'Android reported zero satellites in this status.' : 'No current satellite list available.'}</Text>}
    renderItem={({ item }) => <View style={styles.row}><Text style={styles.name}>{item.constellation} {item.svid}</Text><Text style={styles.muted}>C/N₀ {formatCn0(item.cn0DbHz)} · {item.usedInFix ? 'Used in GNSS fix' : 'Not used'}</Text></View>}
  /></SafeAreaView>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#08131f' }, content: { padding: 24, paddingTop: 20, paddingBottom: 36, flexGrow: 1 }, title: { color: '#fff', fontSize: 32, fontWeight: '700', marginBottom: 14 }, heading: { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: 28 }, status: { color: '#d9f4e8', fontSize: 16, lineHeight: 23 }, muted: { color: '#a9bed0', lineHeight: 21, marginTop: 8 }, count: { color: '#fff', fontSize: 16, marginTop: 12 }, row: { backgroundColor: '#132334', borderRadius: 12, padding: 16, marginTop: 10 }, name: { color: '#fff', fontSize: 17, fontWeight: '600' } });
