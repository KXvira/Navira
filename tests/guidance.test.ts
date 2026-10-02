const assert = { ok(value: unknown): void { if (!value) throw new Error('Assertion failed'); }, equal(a: unknown, b: unknown) { if (a !== b) throw new Error(`${a} !== ${b}`); }, deepEqual(a: unknown, b: unknown) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error('Objects differ'); } };
import { bearingLabel, straightLineGuidance } from '../src/utils/guidance';

function guidance(a: [number, number], b: [number, number]) {
  const result = straightLineGuidance({ latitude: a[0], longitude: a[1] }, { latitude: b[0], longitude: b[1] });
  if (!result) throw new Error('Expected guidance');
  return result;
}
const east = guidance([0, 0], [0, 1]);
assert.ok(Math.abs(east.distanceMeters - 111195) < 2);
assert.ok(Math.abs(east.bearingDegrees! - 90) < 0.001);
assert.ok(Math.abs(guidance([0, 0], [1, 0]).bearingDegrees!) < 0.001);
assert.ok(Math.abs(guidance([0, 0], [0, -1]).bearingDegrees! - 270) < 0.001);
assert.equal(bearingLabel(359), 'N');
assert.equal(bearingLabel(22.5), 'NE');
assert.equal(bearingLabel(-45), 'NW');
const crossing = guidance([0, 179.9], [0, -179.9]);
assert.ok(Math.abs(crossing.distanceMeters - 22239) < 2);
assert.ok(Math.abs(crossing.bearingDegrees! - 90) < 0.001);
assert.deepEqual(guidance([5, 10], [5, 10]), { distanceMeters: 0, bearingDegrees: null });
assert.equal(straightLineGuidance({ latitude: 91, longitude: 0 }, { latitude: 0, longitude: 0 }), null);
