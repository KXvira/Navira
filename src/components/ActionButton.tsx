import { Pressable, StyleSheet, Text } from 'react-native';
export function ActionButton({ label, onPress, disabled = false, danger = false }: { label: string; onPress: () => void; disabled?: boolean; danger?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={[styles.button, danger && styles.danger, disabled && styles.disabled]}><Text style={styles.text}>{label}</Text></Pressable>;
}
const styles = StyleSheet.create({ button: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', backgroundColor: '#d9f4e8', borderRadius: 9, paddingHorizontal: 18, marginTop: 14 }, danger: { backgroundColor: '#f2c5c5' }, disabled: { opacity: 0.45 }, text: { color: '#102820', fontWeight: '700', fontSize: 15 } });
