// Display classification only; it does not affect saving or location freshness.
export const LOW_PRECISION_OVER_METERS = 100;
export function accuracyDescription(accuracy: number | null | undefined): 'unavailable' | 'low' | 'reported' {
  if (accuracy == null || !Number.isFinite(accuracy) || accuracy < 0) return 'unavailable';
  return accuracy > LOW_PRECISION_OVER_METERS ? 'low' : 'reported';
}
