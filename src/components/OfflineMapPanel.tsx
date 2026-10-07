import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { useOfflineMaps } from '../hooks/useOfflineMaps';
import { isInsideCoverage } from '../utils/offlineMapPackage';

type State = ReturnType<typeof useOfflineMaps>;

export function OfflineMapPanel({ maps, center, current }: { maps: State; center: [number, number] | null; current: [number, number] | null }) {
  const [expanded, setExpanded] = useState(false);
  const selected = maps.selectedMap;
  const coverage = !selected ? 'No offline coverage selected' : center && !isInsideCoverage(selected.bounds, center) ? 'Map center is outside selected coverage' : center ? 'Map center is inside selected coverage' : 'Map coverage position pending';
  const remove = (id: string, name: string) => Alert.alert('Remove offline map?', `Remove ${name} from this device? Saved routes and waypoints will stay.`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Remove map', style: 'destructive', onPress: () => maps.remove(id) },
  ]);
  return <View style={styles.panel}>
    <View style={styles.row}><Text style={styles.title}>Offline coverage</Text><Pressable accessibilityRole="button" accessibilityLabel={expanded ? 'Hide offline map packages' : 'Manage offline map packages'} onPress={() => setExpanded(!expanded)}><Text style={styles.action}>{expanded ? 'Hide' : 'Manage'}</Text></Pressable></View>
    <Text style={styles.status}>{maps.loading ? 'Loading saved maps…' : coverage}</Text>
    {selected && <Text style={styles.detail}>{selected.name} · {selected.attribution}{current && !isInsideCoverage(selected.bounds, current) ? ' · Your location is outside coverage' : ''}</Text>}
    {maps.error && <View style={styles.row}><Text style={styles.error}>{maps.error}</Text><Pressable accessibilityRole="button" onPress={maps.retry}><Text style={styles.action}>Retry</Text></Pressable></View>}
    {maps.invalidCount > 0 && <Text style={styles.error}>{maps.invalidCount} unreadable map file(s) retained</Text>}
    {expanded && <View>
      <View style={styles.row}><Pressable accessibilityRole="button" disabled={maps.working || maps.loading} onPress={maps.importLocal}><Text style={styles.action}>Import local JSON</Text></Pressable><Pressable accessibilityRole="button" disabled={maps.working || maps.loading} onPress={maps.installSample}><Text style={styles.action}>Install Kabarak sample</Text></Pressable></View>
      <Text style={styles.detail}>{(maps.storageBytes / 1024).toFixed(1)} KiB stored · up to 10 packages · 5 MB each · 50 MB total</Text>
      <ScrollView style={styles.list} nestedScrollEnabled>
        {maps.packages.length === 0 && <Text style={styles.detail}>No imported packages on this device.</Text>}
        {maps.packages.map((pack) => <View key={pack.id} style={styles.item}>
          <Text style={styles.itemTitle}>{pack.name}{pack.id === maps.selectedId ? ' · Selected' : ''}</Text>
          <Text style={styles.detail}>W {pack.bounds[0].toFixed(5)} · S {pack.bounds[1].toFixed(5)} · E {pack.bounds[2].toFixed(5)} · N {pack.bounds[3].toFixed(5)}</Text>
          <Text style={styles.detail}>{(pack.sizeBytes / 1024).toFixed(1)} KiB · {pack.source}</Text>
          <View style={styles.row}><Pressable accessibilityRole="button" disabled={maps.working || pack.id === maps.selectedId} onPress={() => maps.select(pack.id)}><Text style={styles.action}>Select</Text></Pressable><Pressable accessibilityRole="button" disabled={maps.working} onPress={() => remove(pack.id, pack.name)}><Text style={styles.remove}>Remove…</Text></Pressable></View>
        </View>)}
      </ScrollView>
      {maps.selectedId && <Pressable accessibilityRole="button" disabled={maps.working} onPress={() => maps.select(null)}><Text style={styles.action}>Clear selection</Text></Pressable>}
    </View>}
  </View>;
}

const styles = StyleSheet.create({ panel: { backgroundColor: '#193748', paddingHorizontal: 14, paddingVertical: 6 }, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }, title: { color: '#fff', fontWeight: '700' }, status: { color: '#fff', fontWeight: '600', marginTop: 2 }, detail: { color: '#b7cbd5', fontSize: 12, lineHeight: 17 }, error: { color: '#ffb8b8', flexShrink: 1 }, action: { color: '#a7e8ca', fontWeight: '700', paddingVertical: 5 }, remove: { color: '#ffb8b8', fontWeight: '700', paddingVertical: 5 }, list: { maxHeight: 170 }, item: { borderTopWidth: 1, borderColor: '#4c6877', paddingVertical: 5 }, itemTitle: { color: '#fff', fontWeight: '700' } });
