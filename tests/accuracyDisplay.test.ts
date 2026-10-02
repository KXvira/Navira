import { accuracyDescription } from '../src/utils/accuracyDisplay';
if (accuracyDescription(800) !== 'low') throw new Error('Fresh 800 m estimate needs low-precision styling');
if (accuracyDescription(0) !== 'reported') throw new Error('Zero is a valid reported accuracy');
if (accuracyDescription(null) !== 'unavailable') throw new Error('Missing accuracy is not zero');
