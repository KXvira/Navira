# Decisions

- Preserve the original Expo Go measurement flow as the app grows. Expo Router now composes tabs and focused routes.
- Isolate Expo Location calls in one service and lifecycle in one hook so subscription cleanup and retry are easy to inspect.
- Request foreground permission only. Waypoints and user-started routes now persist locally; no location coordinates are transmitted.
- Use `Location.Accuracy.High` and a one-second requested interval. These are requests to the platform, not guarantees of update frequency or GNSS provenance.
- Preserve the last reading during stale and failure states, with explicit status and elapsed time.
- `npm audit fix --force` is excluded because it proposes an Expo 44 downgrade.

## Milestone 2 build decisions

- Use EAS internal distribution with `android.buildType: apk` and `developmentClient: false`. This produces a directly installable preview with bundled JavaScript, without a development server.
- Set Android application ID to `ke.co.xvira.navira` because none existed. Set the visible app name to Navira.
- Keep coarse and fine location permissions for Android's foreground location flow. Explicitly disable background and foreground service location and block unused default template permissions in the generated manifest. The final APK manifest still needs inspection after EAS builds it.
- The owner linked the EAS project and built the installed milestone 2 APK. Reuse its signing key for GitHub Actions so Android can install the new APK as an update.
- The 2026-10-02 npm audit lists 12 transitive findings, including `node-forge` and `uuid`. Review SDK-compatible upstream fixes before wider distribution; do not force an Expo 44 downgrade.

## Milestone 3 decisions

- Use an Android-only local Kotlin Expo module and keep Expo Location's fused-provider readings unchanged.
- Registering `GnssStatus.Callback` does not guarantee the GPS receiver will run. Expo Location's high-accuracy fused request can use GNSS but does not guarantee it. Make an explicit `GPS_PROVIDER` request only while the diagnostics listener is active in the foreground; discard its positions and remove it with the callback.
- Require precise foreground permission for GNSS callbacks. Approximate-only access may still allow Expo location readings but cannot power these diagnostics.
- Keep `usedInFix` tied to Android's most recent GNSS fix, never to the latest Expo location reading. Treat zero satellites and zero used flags as real values.
- Build with a manual GitHub Actions Gradle release workflow. CNG prebuild regenerates Android; a config plugin reapplies release signing and fails if release secrets are absent. The key must match the previously installed EAS APK. No Expo token is needed for this workflow.

## Milestone 4 decisions

- Use the SDK 57 compatible `expo-sqlite` module. It persists across restarts, supports parameterized row-level writes, is included in Expo Go, and lets validation isolate malformed records without overwriting or deleting them.
- Put SQLite behind `WaypointRepository`; UI and hooks work with typed waypoint models and never issue queries.
- Use `expo-crypto` UUIDv4 identifiers. IDs remain stable when names and notes change.
- Snapshot the Expo reading when the save form opens, then reuse the location freshness threshold on submission. Report accuracy without introducing a blocking cutoff.
- Keep waypoint CRUD separate from route recording and guidance. Maps and averaging remain outside this milestone.

## Milestone 5 decisions

- Add Expo Router for three bottom tabs and focused waypoint routes. Keep location and waypoint hooks above the router screens to prevent duplicate subscriptions.
- Observe native GNSS only while Satellites is visible and the foreground location flow is usable; its hook and foreground cleanup remain mounted in the shared provider.
- Keep selected destination in memory and calculate straight-line guidance locally. No navigation data is added to SQLite.

## Milestone 6 decisions

- Reuse the existing Expo Location subscription in the root provider; keep route storage behind a separate typed SQLite repository in the existing local database.
- Allow one unfinished route. Persist accepted points and route counters atomically, checkpoint active time every five seconds, and recover an interrupted recording paused with only committed time.
- Use conservative movement and accuracy thresholds plus a speed sanity limit to reduce stationary jitter. Sum distance only within persisted segments; do not imply survey-grade distance.
- Use Expo FileSystem cache and Expo Sharing for a local GPX 1.1 file. Omit reported accuracy from GPX rather than mislabel it as HDOP.

## Route-quality policy 2 decisions

- Apply the new quality rule only to newly created routes. Version the schema and route policy; migrate old rows without changing their points or totals.
- Store sampled observations and their distance status, exclude missing or over-100 m accuracy from distance, and start fresh geometry after quality loss. Count excluded duration only from short observed intervals, without estimating time through callback silence or lifecycle gaps.
- Keep low-quality samples in SQLite for inspection, and omit them from primary GPX geometry so an export cannot connect across an excluded period.
