import { Alert, Pressable, StyleSheet, Text } from 'react-native';

export function InfoButton({ title, message }: { title: string; message: string }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`About ${title}`} onPress={() => Alert.alert(title, message)} style={styles.button}>
    <Text style={styles.label}>Info</Text>
  </Pressable>;
}
const styles = StyleSheet.create({ button: { minWidth: 48, minHeight: 44, alignItems: 'center', justifyContent: 'center' }, label: { color: '#a7e8ca', fontWeight: '700' } });
