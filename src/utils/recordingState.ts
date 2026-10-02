import type { PauseReason, RecordedRoute } from '../types/route';

export function activeElapsedAt(route: RecordedRoute, now: number): number {
  if (route.status !== 'recording' || route.activeSinceMs === null) return route.activeElapsedMs;
  return route.activeElapsedMs + Math.max(0, now - route.activeSinceMs);
}

export function pauseRecording(route: RecordedRoute, reason: Exclude<PauseReason, null>, now: number): RecordedRoute {
  if (route.status !== 'recording') return route;
  return { ...route, status: 'paused', pauseReason: reason, activeElapsedMs: activeElapsedAt(route, now), activeSinceMs: null, updatedAt: now };
}

export function resumeRecording(route: RecordedRoute, now: number): RecordedRoute {
  if (route.status !== 'paused') throw new Error('Only a paused route can resume.');
  return { ...route, status: 'recording', pauseReason: null, activeSinceMs: now, segmentIndex: route.segmentIndex + 1, updatedAt: now };
}

export function stopRecording(route: RecordedRoute, now: number): RecordedRoute {
  if (route.status === 'saved' || route.status === 'stopped') throw new Error('Route is already stopped.');
  const paused = route.status === 'recording' ? pauseRecording(route, 'manual', now) : route;
  return { ...paused, status: 'stopped', pauseReason: null, activeSinceMs: null, updatedAt: now };
}

export function recoverInterruptedRecording(route: RecordedRoute, now: number): RecordedRoute {
  if (route.status !== 'recording') return route;
  // Persisted checkpoints are authoritative. Time after the last checkpoint is unknown.
  return { ...route, status: 'paused', pauseReason: 'interrupted', activeSinceMs: null, updatedAt: now };
}
