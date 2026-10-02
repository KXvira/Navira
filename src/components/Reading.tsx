import { StyleSheet, Text, View } from 'react-native';

export function Reading({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#132334', padding: 18, borderRadius: 16, marginBottom: 12 },
  label: { color: '#a9bed0', fontSize: 14 },
  value: { color: '#ffffff', fontSize: 26, fontWeight: '600', marginTop: 8 },
});
