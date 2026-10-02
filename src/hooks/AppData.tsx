import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'expo-router';
import { useLocationReading } from './useLocationReading';
import { useGnssStatus } from './useGnssStatus';
import { useRouteRecording } from './useRouteRecording';
import { useWaypoints } from './useWaypoints';
import type { WaypointCapture } from '../types/waypoint';
import { visiblePhase } from '../utils/locationDisplay';

function useAppDataValue() {
  const location = useLocationReading();
  const waypoints = useWaypoints();
  const [now, setNow] = useState(0);
  const [destinationId, setDestinationId] = useState<string | null>(null);
  const [saveCapture, setSaveCapture] = useState<WaypointCapture | null>(null);
  const pathname = usePathname();
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const phase = visiblePhase(location.state, now);
  const gnssActive = pathname === '/satellites' && ['waiting', 'receiving', 'stale'].includes(location.state.phase);
  const gnss = useGnssStatus(gnssActive);
  const routes = useRouteRecording(location.state.reading, phase, now);
  return { location, waypoints, routes, now, phase, gnss, gnssActive, destinationId, setDestinationId, saveCapture, setSaveCapture };
}

type AppData = ReturnType<typeof useAppDataValue>;
const Context = createContext<AppData | null>(null);
export function AppDataProvider({ children }: { children: ReactNode }) {
  const value = useAppDataValue();
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useAppData() {
  const value = useContext(Context);
  if (!value) throw new Error('App data provider missing');
  return value;
}
