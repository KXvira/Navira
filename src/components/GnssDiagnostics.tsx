import { StyleSheet, Text, View } from 'react-native';
import type { GnssState } from '../types/gnss';
import { formatCn0, gnssAgeSeconds, visibleGnssPhase } from '../utils/gnssDisplay';

const statusText = {
  unsupported: 'Native GNSS diagnostics unavailable. Install a rebuilt Android APK; Expo Go cannot load this module.',
  unavailable: 'GNSS status unavailable. Android has not provided a current status.',
  'permission-denied': 'Precise foreground location is required for GNSS status.',
  'services-disabled': 'Turn on Android Location and its GPS provider for GNSS status.',
  waiting: 'Waiting for Android GNSS status…',
  receiving: 'Receiving Android GNSS status',
  stale: 'GNSS status is stale',
  paused: 'GNSS diagnostics paused while the app is in the background.',
  error: 'GNSS diagnostics could not start.',
} as const;

export function GnssDiagnostics({ state, active, now }: { state: GnssState; active: boolean; now: number }) {
  const phase = active ? visibleGnssPhase(state, now) : 'waiting';
  const age = active ? gnssAgeSeconds(state.receivedAtMs, now) : null;
  const snapshot = active ? state.snapshot : null;

  return (
    <View style={styles.panel}>
      <Text style={styles.heading}>Android GNSS diagnostics</Text>
      <Text style={styles.status}>
        {active ? statusText[phase] : 'Waiting for foreground location access before starting GNSS diagnostics.'}
      </Text>
      <Text style={styles.note}>
        {age === null ? 'No current GNSS status age available.' : `Last GNSS status: ${age} seconds ago`}
      </Text>
      <View style={styles.counts}>
        <Text style={styles.count}>Reported: {snapshot ? snapshot.reportedCount : 'Unavailable'}</Text>
        <Text style={styles.count}>Used in latest GNSS fix: {snapshot ? snapshot.usedInFixCount : 'Unavailable'}</Text>
      </View>
      {snapshot?.satellites.map((satellite) => (
        <View key={`${satellite.constellation}-${satellite.svid}`} style={styles.satellite}>
          <Text style={styles.satelliteName}>{satellite.constellation} {satellite.svid}</Text>
          <Text style={styles.satelliteDetail}>
            C/N₀ {formatCn0(satellite.cn0DbHz)} · {satellite.usedInFix ? 'Used in GNSS fix' : 'Not used'}
          </Text>
        </View>
      ))}
      {snapshot && snapshot.reportedCount === 0 ? <Text style={styles.note}>Android reported zero satellites in this status.</Text> : null}
      <Text style={styles.disclaimer}>
        C/N₀ is signal strength density, not positioning accuracy. GNSS status does not prove the location reading above came only from GNSS.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { backgroundColor: '#132334', borderRadius: 16, padding: 18, marginTop: 12 },
  heading: { color: '#ffffff', fontSize: 22, fontWeight: '700' },
  status: { color: '#d9f4e8', lineHeight: 21, marginTop: 12 },
  note: { color: '#a9bed0', lineHeight: 20, marginTop: 8 },
  counts: { marginTop: 16, gap: 6 },
  count: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  satellite: { borderTopWidth: 1, borderTopColor: '#294154', paddingVertical: 10 },
  satelliteName: { color: '#ffffff', fontWeight: '600' },
  satelliteDetail: { color: '#a9bed0', marginTop: 4 },
  disclaimer: { color: '#a9bed0', lineHeight: 20, marginTop: 16 },
});
