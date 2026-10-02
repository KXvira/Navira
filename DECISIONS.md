# Decisions

- Keep the existing single-screen entry point and working Expo Go measurement flow. Expo Router is deferred until there is navigation to implement.
- Isolate Expo Location calls in one service and lifecycle in one hook so subscription cleanup and retry are easy to inspect.
- Request foreground permission only. No background task, network transfer, or persistence is needed for this milestone.
- Use `Location.Accuracy.High` and a one-second requested interval. These are requests to the platform, not guarantees of update frequency or GNSS provenance.
- Preserve the last reading during stale and failure states, with explicit status and elapsed time.
- Keep dependencies unchanged. `npm audit fix --force` is excluded because it proposes an Expo 44 downgrade.

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
