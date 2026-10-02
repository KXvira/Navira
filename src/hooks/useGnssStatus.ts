import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import naviraGnssModule from '../../modules/navira-gnss/src/NaviraGnssModule';
import type { GnssEvent, GnssState } from '../types/gnss';

const initialState: GnssState = {
  phase: naviraGnssModule ? 'waiting' : 'unsupported',
  snapshot: null,
  receivedAtMs: null,
};

export function useGnssStatus(active: boolean): GnssState {
  const [state, setState] = useState<GnssState>(initialState);

  useEffect(() => {
    const module = naviraGnssModule;
    if (!active || !module) return;

    const gnssListener = module.addListener('onGnssStatus', (event: GnssEvent) => {
      if (event.state === 'receiving') {
        setState({ phase: 'receiving', snapshot: event, receivedAtMs: Date.now() });
      } else {
        setState({ phase: event.state, snapshot: null, receivedAtMs: null });
      }
    });
    const appListener = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        setState({ phase: 'waiting', snapshot: null, receivedAtMs: null });
        module.start();
      } else {
        module.stop();
        setState({ phase: 'paused', snapshot: null, receivedAtMs: null });
      }
    });
    if (AppState.currentState === 'active') module.start();

    return () => {
      appListener.remove();
      module.stop();
      gnssListener.remove();
    };
  }, [active]);

  return state;
}
