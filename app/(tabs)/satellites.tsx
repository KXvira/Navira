import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { InfoButton } from '../../src/components/InfoButton';
import { useAppData } from '../../src/hooks/AppData';
import { formatCn0, gnssAgeSeconds, visibleGnssPhase } from '../../src/utils/gnssDisplay';
import type { GnssSatellite } from '../../src/types/gnss';

const messages = {
  unsupported: 'Native GNSS diagnostics unavailable in Expo Go. Install a rebuilt Android APK.',
  unavailable: 'Android has no current GNSS status.',
  'permission-denied': 'Precise foreground location is required.',
  'services-disabled': 'Turn on Android Location and GPS.',
  waiting: 'Waiting for Android GNSS status…', receiving: 'Receiving Android GNSS status',
  stale: 'GNSS status is stale', paused: 'GNSS monitoring paused in background.', error: 'GNSS diagnostics could not start.',
};
export default function SatellitesScreen() {
  const { gnss, gnssActive, now } = useAppData();
  const phase = visibleGnssPhase(gnss, now);
  const snapshot = gnssActive && phase === 'receiving' ? gnss.snapshot : null;
  const age = gnssAgeSeconds(gnss.observedAtMs, now);
  return <SafeAreaView style={styles.screen} edges={['left', 'right']}><FlatList<GnssSatellite>
    data={snapshot?.satellites ?? []} keyExtractor={(item) => `${item.constellation}-${item.svid}`} contentContainerStyle={styles.content}
    ListHeaderComponent={<View>
      <Text style={[styles.status, phase === 'receiving' && gnssActive ? styles.receiving : styles.warning]}>{gnssActive ? messages[phase] : 'Waiting for foreground location access.'}</Text>
      <Text style={styles.muted}>{age === null ? 'Status age unavailable' : `Status age: ${age} s`}</Text>
      {snapshot && <Text style={snapshot.usedInFixCount > 0 ? styles.receiving : styles.warning}>{snapshot.usedInFixCount > 0 ? 'Satellites marked used in latest GNSS fix' : 'No satellites marked used in latest GNSS fix'}</Text>}
      <View style={styles.counts}><Text style={styles.count}>Reported {snapshot ? snapshot.reportedCount : '—'}</Text><Text style={styles.count}>Used in fix {snapshot ? snapshot.usedInFixCount : '—'}</Text></View>
      <InfoButton title="GNSS status" message="Android reports satellites used in its latest GNSS fix. This does not establish the source of a separate Expo Location reading. C/N₀ is signal strength density, not positioning accuracy." />
    </View>}
    ListEmptyComponent={<Text style={styles.muted}>{snapshot?.reportedCount === 0 ? 'Android reported zero satellites.' : 'No current satellite list available.'}</Text>}
    renderItem={({ item }) => <View style={styles.row}><Text numberOfLines={1} style={styles.name}>{item.constellation} {item.svid}</Text><Text style={styles.detail}>{formatCn0(item.cn0DbHz)} · {item.usedInFix ? 'Used' : 'Not used'}</Text></View>}
  /></SafeAreaView>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#08131f' }, content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24, flexGrow: 1 }, status: { fontSize: 16, fontWeight: '700' }, receiving: { color: '#d9f4e8' }, warning: { color: '#f4d7a1' }, muted: { color: '#a9bed0', lineHeight: 19, marginTop: 6 }, counts: { flexDirection: 'row', gap: 18, marginTop: 10 }, count: { color: '#fff', fontWeight: '600' }, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 44, borderTopWidth: 1, borderTopColor: '#294154', gap: 8 }, name: { color: '#fff', fontSize: 15, fontWeight: '600', flex: 1 }, detail: { color: '#a9bed0', fontSize: 13 } });
