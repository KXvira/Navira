import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from '../../src/components/ActionButton';
import { useAppData } from '../../src/hooks/AppData';
import type { RecordedRoute } from '../../src/types/route';
import { formatDistance } from '../../src/utils/guidance';

export default function RoutesScreen() {
  const { routes } = useAppData();
  const saved = routes.routes.filter((item) => item.status === 'saved');
  return <SafeAreaView style={styles.screen} edges={['left', 'right']}><FlatList<RecordedRoute>
    data={saved} keyExtractor={(item) => item.id} contentContainerStyle={styles.content}
    ListHeaderComponent={<View>
      <ActionButton label={routes.draft ? 'Open unfinished recording' : 'Record a route'} onPress={() => router.push('/recording')} disabled={routes.loading} />
      <Text style={styles.muted}>Foreground only. Locking or leaving the app pauses recording; resume explicitly.</Text>
      {routes.draft && <Pressable accessibilityRole="button" onPress={() => router.push('/recording')} style={styles.draft}>
        <Text style={styles.name}>Unfinished route · {routes.draft.status}</Text>
        <Text style={styles.muted}>{routes.draft.pointCount} saved points · {formatDistance(routes.draft.distanceMeters)}</Text>
      </Pressable>}
      {routes.error && <View><Text style={styles.error}>{routes.error}</Text><ActionButton label="Reload routes" onPress={() => void routes.reload()} /></View>}
      {routes.notice && <Text style={styles.notice}>{routes.notice}</Text>}
      {routes.malformedRecordCount > 0 && <Text style={styles.error}>{routes.malformedRecordCount} stored route(s) could not be read. They remain in SQLite.</Text>}
      <Text style={styles.heading}>Saved routes</Text>
      {routes.loading && <Text style={styles.muted}>Loading routes…</Text>}
    </View>}
    ListEmptyComponent={!routes.loading ? <Text style={styles.muted}>No saved routes yet.</Text> : null}
    renderItem={({ item }) => <Pressable accessibilityRole="button" accessibilityLabel={`Details for ${item.name}`} onPress={() => router.push({ pathname: '/route/[id]', params: { id: item.id } })} style={styles.row}>
      <Text numberOfLines={1} style={styles.name}>{item.name}</Text>
      <Text style={styles.muted}>{item.pointCount} points · {formatDistance(item.distanceMeters)} · {new Date(item.createdAt).toLocaleDateString()}</Text>
    </Pressable>}
  /></SafeAreaView>;
}
const styles = StyleSheet.create({ screen: { flex: 1, backgroundColor: '#08131f' }, content: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 24, flexGrow: 1 }, heading: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 20 }, muted: { color: '#a9bed0', lineHeight: 19, marginTop: 5 }, row: { backgroundColor: '#132334', borderRadius: 10, padding: 14, marginTop: 8 }, draft: { backgroundColor: '#3b3022', borderRadius: 10, padding: 14, marginTop: 12 }, name: { color: '#fff', fontSize: 16, fontWeight: '700' }, error: { color: '#ffb8b8', marginTop: 10 }, notice: { color: '#a7e8ca', marginTop: 10 } });
