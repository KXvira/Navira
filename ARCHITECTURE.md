# Architecture

Current flow: Expo Router composes Location, Waypoints, Routes, and Satellites tabs plus focused waypoint save, detail, edit, and guidance routes. `AppDataProvider` holds location, waypoint, and GNSS hooks above the navigator so tab changes do not duplicate location subscriptions. `useLocationReading` owns foreground permission, service check, subscription lifecycle, errors, and retry. `locationService` is the only code calling Expo Location. The screen derives age and stale status with pure functions from `locationDisplay`, then renders `LocationStatus` and `Reading` cards.

The subscription is removed on effect cleanup and after reported watcher errors. A retry restarts the effect and requests foreground access again. A late subscription returned after cleanup is removed immediately. Live readings remain in memory and are never transmitted. Coordinates are persisted only when the user saves a waypoint.

Waypoint guidance is calculated locally in `src/utils/guidance.ts`; no network or mapping service is involved.

## Android preview packaging

`app.json` holds the native app identity and foreground-only permission configuration. `eas.json` retains the earlier internal preview APK profile used for the installed milestone 2 build. The EAS project is linked in `app.json`; the owner controls its credentials. The location screen and Expo Location data flow remain unchanged.

## Native GNSS diagnostics

The local Android module in `modules/navira-gnss` uses `LocationManager.GPS_PROVIDER` for a foreground-only location request and a separate `GnssStatus.Callback`. The native request activates GNSS tracking while diagnostics are observed; its positions are discarded. Expo Location continues to own the location cards through the fused provider. The GNSS hook, types, age rule, and UI live separately in `src/hooks/useGnssStatus.ts`, `src/types/gnss.ts`, `src/utils/gnssDisplay.ts`, and `app/(tabs)/satellites.tsx`. A missing native module leaves Expo Go's location screen usable.

The module removes both its GPS request and status callback on background, listener removal, and app-context destruction. Resume rechecks precise permission and GPS availability, then waits for a new callback. GNSS status is never joined to an Expo location reading by timestamp or provider claim.

## Release packaging

The GitHub Actions manual workflow is the primary Android APK builder. It runs CNG prebuild then `:app:assembleRelease`. `plugins/withNaviraReleaseSigning.js` reconfigures the generated release variant to require the EAS-origin keystore supplied through GitHub Actions secrets. The previous `eas.json` preview profile remains only for credential lookup or a deliberate alternate build; it is not used by the GitHub workflow.

## Offline waypoints

The Waypoints tab and focused save/detail/edit routes own waypoint presentation. A separate guidance route holds detailed distance and bearing so the saved list remains visible. Opening the save form copies the current Expo reading into an immutable `WaypointCapture`; later location updates do not alter it. Submission checks that captured timestamp against the shared 15-second freshness rule.

`useWaypoints` owns loading and write state. It depends on the `WaypointRepository` contract rather than SQLite details. `waypointRepository.ts` is the persistence boundary: it initializes `navira.db`, performs parameterized CRUD, generates UUIDv4 identifiers with Expo Crypto, and validates every loaded row. Invalid rows are counted and left untouched so the UI can report them without data loss. No account, backend, analytics, or network path is involved.

## Milestone 5 lifecycle and guidance

`AppDataProvider` stays mounted above Expo Router tabs and owns one foreground Expo Location subscription and one waypoint store. GNSS monitoring uses the Satellites route as its visibility signal and `useGnssStatus` still stops on app background. Switching tabs does not remount the hook; leaving Satellites stops GNSS monitoring. `straightLineGuidance` uses a local haversine distance and initial great-circle bearing normalized clockwise from true north. UI computes guidance only for fresh receiving location. A coincident pair has no bearing. Destination choice is in memory; SQLite waypoint rows remain unchanged.

## GNSS observation clock

Kotlin emits `observedAtMs` from `System.currentTimeMillis()` and a separate elapsed-realtime value. The bridge preserves both. `stateFromGnssEvent` keeps the native wall-clock observation timestamp in hook state; the UI compares it to the JavaScript wall-clock `now`. A callback slightly newer than the last one-second UI tick displays age zero; an invalid or substantially future timestamp has no valid age and cannot display as receiving. Old native observations become stale after 15 seconds even if their events reach JavaScript late. Lifecycle pauses clear the snapshot.

## Milestone 6 route recording

`useRouteRecording` lives in `AppDataProvider` above all tabs and consumes the existing `useLocationReading` result. It serializes route writes, handles AppState foreground exit, halts on storage failures, and updates visible counters only from confirmed repository results. `routeRepository.ts` owns the typed SQLite schema and atomic point/counter writes in `navira.db`; waypoint tables are untouched. `recordingState.ts` and `routeSampling.ts` contain pure transition and filtering rules. The Routes tab and focused recording/detail routes contain presentation only.

Route rows store active-time checkpoints. Startup recovery changes a still-recording row to paused/interrupted while keeping only committed elapsed time. Pause/resume and observed callback gaps create segment boundaries. `gpx.ts` produces GPX text without horizontal-accuracy HDOP claims; `routeExport.ts` writes a cache file and invokes Expo Sharing. There is no route network, map, or background task.
