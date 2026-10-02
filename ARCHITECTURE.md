# Architecture

Current one-screen flow: `App.tsx` composes `LocationScreen`. `useLocationReading` owns foreground permission, service check, subscription lifecycle, errors, and retry. `locationService` is the only code calling Expo Location. The screen derives age and stale status with pure functions from `locationDisplay`, then renders `LocationStatus` and `Reading` cards.

The subscription is removed on effect cleanup and after reported watcher errors. A retry restarts the effect and requests foreground access again. A late subscription returned after cleanup is removed immediately. State is in memory only; readings are neither persisted nor transmitted.

Future navigation, maps, or platform GNSS details require separate design and implementation. They are not part of this data flow.

## Android preview packaging

`app.json` holds the native app identity and foreground-only permission configuration. `eas.json` retains the earlier internal preview APK profile used for the installed milestone 2 build. The EAS project is linked in `app.json`; the owner controls its credentials. The location screen and Expo Location data flow remain unchanged.

## Native GNSS diagnostics

The local Android module in `modules/navira-gnss` uses `LocationManager.GPS_PROVIDER` for a foreground-only location request and a separate `GnssStatus.Callback`. The native request activates GNSS tracking while diagnostics are observed; its positions are discarded. Expo Location continues to own the location cards through the fused provider. The GNSS hook, types, age rule, and UI live separately in `src/hooks/useGnssStatus.ts`, `src/types/gnss.ts`, `src/utils/gnssDisplay.ts`, and `src/components/GnssDiagnostics.tsx`. A missing native module leaves Expo Go's location screen usable.

The module removes both its GPS request and status callback on background, listener removal, and app-context destruction. Resume rechecks precise permission and GPS availability, then waits for a new callback. GNSS status is never joined to an Expo location reading by timestamp or provider claim.

## Release packaging

The GitHub Actions manual workflow is the primary Android APK builder. It runs CNG prebuild then `:app:assembleRelease`. `plugins/withNaviraReleaseSigning.js` reconfigures the generated release variant to require the EAS-origin keystore supplied through GitHub Actions secrets. The previous `eas.json` preview profile remains only for credential lookup or a deliberate alternate build; it is not used by the GitHub workflow.
