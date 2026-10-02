import { Tabs } from 'expo-router';
export default function TabLayout() {
  return <Tabs screenOptions={{ headerStyle: { backgroundColor: '#08131f' }, headerTintColor: '#ffffff', tabBarStyle: { backgroundColor: '#132334', borderTopColor: '#294154' }, tabBarActiveTintColor: '#d9f4e8', tabBarInactiveTintColor: '#a9bed0', tabBarLabelStyle: { fontSize: 13, fontWeight: '600' } }}>
    <Tabs.Screen name="index" options={{ title: 'Location', tabBarAccessibilityLabel: 'Location tab' }} />
    <Tabs.Screen name="waypoints" options={{ title: 'Waypoints', tabBarAccessibilityLabel: 'Waypoints tab' }} />
    <Tabs.Screen name="satellites" options={{ title: 'Satellites', tabBarAccessibilityLabel: 'Satellites tab' }} />
  </Tabs>;
}
