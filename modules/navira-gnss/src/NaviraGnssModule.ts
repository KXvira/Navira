import { NativeModule, requireOptionalNativeModule } from 'expo';
import type { GnssEvent } from '../../../src/types/gnss';

type GnssModuleEvents = {
  onGnssStatus: (event: GnssEvent) => void;
};

export class NaviraGnssModule extends NativeModule<GnssModuleEvents> {
  start!: () => void;
  stop!: () => void;
}

export default requireOptionalNativeModule<NaviraGnssModule>('NaviraGnss');
