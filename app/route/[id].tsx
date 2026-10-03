import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from '../../src/components/ActionButton';
import { useAppData } from '../../src/hooks/AppData';
import type { RoutePoint } from '../../src/types/route';
import { formatDistance } from '../../src/utils/guidance';
import { formatMeasurement } from '../../src/utils/locationDisplay';

export default function RouteDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { routes } = useAppData();
  const route = routes.routes.find((item) => item.id === id && item.status === 'saved');
  const [points, setPoints] = useState<RoutePoint[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const routeId = route?.id;
  const loadPoints = routes.points;
  useEffect(() => {
    if (!routeId) return;
    let cancelled = false;
    void loadPoints(routeId).then((loaded) => { if (!cancelled) setPoints(loaded); }).catch((cause: unknown) => { if (!cancelled) setLoadError(cause instanceof Error ? cause.message : 'Route points could not be loaded.'); });
    return () => { cancelled = true; };
  }, [routeId, loadPoints]);
  function confirmDelete() {
    if (!route) return;
    Alert.alert('Delete route?', `Delete “${route.name}” and all its points from this device?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { void routes.remove(route.id).then((deleted) => { if (deleted) router.back(); }); } },
    ]);
  }
  return <><Stack.Screen options={{ title: route?.name ?? 'Route' }} /><SafeAreaView style={styles.screen} edges={['bottom', 'left', 'right']}><FlatList<RoutePoint>
    data={points} keyExtractor={(item) => String(item.id)} contentContainerStyle={styles.content}
    ListHeaderComponent={route ? <View>
      <Text style={styles.value}>{formatDistance(route.distanceMeters)}</Text><Text style={styles.muted}>Estimated recorded distance · {route.pointCount} stored samples</Text>
      {route.policyVersion === 2 && <><Text style={styles.muted}>{route.distancePointCount ?? 0} points contributing to distance · {Math.floor(route.excludedDurationMs / 1000)} s observed low-precision duration</Text>
        <Text style={styles.muted}>Distance excludes low-precision periods. GPX omits excluded samples and keeps distance segment breaks.</Text></>}
      {route.policyVersion === 1 && <Text style={styles.muted}>Legacy route · original distance and points preserved.</Text>}
      <Text style={styles.muted}>Active time: {Math.floor(route.activeElapsedMs / 1000)} s</Text>
      <Text style={styles.muted}>Started: {new Date(route.createdAt).toLocaleString()}</Text>
      <Text style={styles.muted}>Segments: {new Set(points.map((item) => item.segmentIndex)).size}</Text>
      {loadError && <Text style={styles.error}>{loadError}</Text>}{routes.error && <Text style={styles.error}>{routes.error}</Text>}
      <ActionButton label="Export GPX" onPress={() => void routes.exportGpx(route)} disabled={routes.busy || !!loadError} />
      <ActionButton label="Delete route" onPress={confirmDelete} disabled={routes.busy} danger />
      <Text style={styles.heading}>Saved points</Text>
    </View> : <Text style={styles.muted}>{routes.loading ? 'Loading route…' : 'Saved route unavailable.'}</Text>}
    ListEmptyComponent={route ? <Text style={styles.muted}>No saved points in this route.</Text> : null}
    renderItem={({ item }) => <View style={styles.row}><Text style={styles.text}>Segment {item.segmentIndex + 1} · {new Date(item.capturedAt).toLocaleTimeString()}</Text><Text style={styles.muted}>{formatMeasurement(item.latitude, 6, '°')}, {formatMeasurement(item.longitude, 6, '°')}</Text><Text style={styles.muted}>Accuracy {formatMeasurement(item.horizontalAccuracy, 1, ' m')} · {item.distanceStatus === 'legacy' ? 'Legacy point' : item.distanceStatus === 'counted' ? 'Distance counted' : item.distanceStatus === 'anchor' ? 'Segment anchor' : `Distance excluded: ${item.distanceStatus.replace('-', ' ')}`}</Text></View>}
  /></SafeAreaView></>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#08131f' }, content: { padding: 18, paddingBottom: 36, flexGrow: 1 }, value: { color: '#fff', fontSize: 30, fontWeight: '700' }, muted: { color: '#a9bed0', lineHeight: 19, marginTop: 5 }, heading: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 22, marginBottom: 8 }, row: { borderTopWidth: 1, borderTopColor: '#294154', paddingVertical: 10 }, text: { color: '#fff', fontWeight: '600' }, error: { color: '#ffb8b8', lineHeight: 20, marginTop: 10 } });
