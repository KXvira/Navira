import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppDataProvider } from '../src/hooks/AppData';

export default function RootLayout() {
  return <SafeAreaProvider><AppDataProvider>
    <StatusBar style="light" />
    <Stack screenOptions={{ headerStyle: { backgroundColor: '#08131f' }, headerTintColor: '#ffffff', contentStyle: { backgroundColor: '#08131f' } }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="waypoint/new" options={{ title: 'Save waypoint' }} />
      <Stack.Screen name="waypoint/[id]" options={{ title: 'Waypoint details' }} />
    </Stack>
  </AppDataProvider></SafeAreaProvider>;
}
