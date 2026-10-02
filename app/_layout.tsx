import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppDataProvider } from '../src/hooks/AppData';

export default function RootLayout() {
  return <SafeAreaProvider><AppDataProvider>
    <StatusBar style="light" />
    <Stack screenOptions={{ headerStyle: { backgroundColor: '#08131f' }, headerTintColor: '#fff', headerTitleStyle: { fontSize: 20, fontWeight: '700' }, contentStyle: { backgroundColor: '#08131f' } }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="recording" options={{ title: 'Record route' }} />
      <Stack.Screen name="route/[id]" options={{ title: 'Route' }} />
      <Stack.Screen name="guidance" options={{ title: 'Guidance' }} />
      <Stack.Screen name="waypoint/new" options={{ title: 'Save waypoint' }} />
      <Stack.Screen name="waypoint/[id]" options={{ title: 'Waypoint' }} />
      <Stack.Screen name="waypoint/edit" options={{ title: 'Edit waypoint' }} />
    </Stack>
  </AppDataProvider></SafeAreaProvider>;
}
