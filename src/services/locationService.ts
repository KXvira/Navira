import * as Location from 'expo-location';

export async function requestForegroundAccess(): Promise<boolean> {
  const permission = await Location.requestForegroundPermissionsAsync();
  return permission.status === 'granted';
}

export function areLocationServicesEnabled(): Promise<boolean> {
  return Location.hasServicesEnabledAsync();
}

export function subscribeToLocation(
  onUpdate: (reading: Location.LocationObject) => void,
  onError: (message: string) => void,
): Promise<Location.LocationSubscription> {
  return Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 1000,
      distanceInterval: 0,
      mayShowUserSettingsDialog: false,
    },
    onUpdate,
    onError,
  );
}
