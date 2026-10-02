import { StyleSheet, Text, View } from 'react-native';
export function Reading({ label, value }: { label: string; value: string }) {
  return <View style={styles.card}><Text style={styles.label}>{label}</Text><Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={styles.value}>{value}</Text></View>;
}
const styles = StyleSheet.create({ card: { flexGrow: 1, flexBasis: '47%', minWidth: 140, backgroundColor: '#132334', padding: 12, borderRadius: 12 }, label: { color: '#a9bed0', fontSize: 13, minHeight: 32 }, value: { color: '#fff', fontSize: 21, fontWeight: '600', marginTop: 3 } });
