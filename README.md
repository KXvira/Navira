# Navira — Offline GNSS Lab

Navira displays foreground location readings from Expo Location and, in a rebuilt Android APK, separate native GNSS diagnostics. The location screen passed owner testing on a Samsung A16. The owner also verified fresh location updates in airplane mode with Wi-Fi off in a milestone 2 preview APK; see [DEVICE_TEST_RECORD.md](DEVICE_TEST_RECORD.md). The GitHub-built APK and native GNSS diagnostics passed the owner-reported Samsung A16 tests documented in the device record. Satellite status cannot prove that an Expo location reading came exclusively from GNSS.

## Development

Use Node 22.13 or newer with the checked-in npm lockfile.

```bash
npm ci
npx expo start --tunnel
```

Expo Go can run the JavaScript location, waypoint, and route screens, but the Satellites tab shows that the custom native module is unavailable. The local map also requires a rebuilt native binary with MapLibre. Native module changes require a new Android binary; Metro reloads JavaScript only. Local checks: `npx expo lint`, `npx tsc --noEmit`, and `npx expo-doctor`.

## Android release APK: GitHub Actions

[`.github/workflows/android-preview.yml`](.github/workflows/android-preview.yml) is the primary builder. It runs manually on `ubuntu-24.04` with Node 22.13.1, Java 17, and Android SDK 36. It runs `npm ci` and project checks, generates Android with Expo prebuild, confirms the local GNSS module is linked, runs `:app:assembleRelease`, checks the signed APK and embedded JavaScript bundle, and uploads `navira-preview-apk` for three days. The Android package remains `ke.co.xvira.navira`. Generated `android/` is ignored; the signing config is reapplied by `plugins/withNaviraReleaseSigning.js` on every prebuild. The workflow needs no Expo token.

A Git remote was not configured when this workflow was prepared. After adding and pushing to your GitHub repository's default branch, configure these repository Actions secrets under **Settings → Secrets and variables → Actions**:

| Secret | Value |
| --- | --- |
| `NAVIRA_KEYSTORE_BASE64` | Base64 of the existing EAS Android keystore file |
| `NAVIRA_KEYSTORE_PASSWORD` | That keystore's store password |
| `NAVIRA_KEY_ALIAS` | Its key alias |
| `NAVIRA_KEY_PASSWORD` | Its key password |

Use the **same key** as the APK already installed on the Samsung A16, or Android will reject an update under the same application ID. To retrieve it yourself, run `npx eas-cli@latest credentials -p android` in this project, select the Android build profile used for the installed APK, then choose **credentials.json: Upload/Download credentials between EAS servers and your local json → Download credentials from EAS to credentials.json**. Read that downloaded file for the keystore path and three signing values; encode the keystore file as one-line Base64 before adding the four GitHub secrets. Do not commit `credentials.json` or the keystore, and do not share their contents in chat. `credentials.json` and `*.jks` are ignored by Git. [Expo credential download instructions](https://docs.expo.dev/app-signing/syncing-credentials/)

Once the workflow file is on the default branch, open **Actions → Android preview APK → Run workflow**. Download the `navira-preview-apk` artifact from that run. Missing signing secrets cause an explicit failure; the workflow never falls back to the debug key. Compare the signing certificate fingerprint with the installed APK before installing over it. Each build checks that the final APK has foreground location permissions and no INTERNET, background location, or foreground service permission.

## Milestone 7A local map acceptance

The local MapLibre style has a plain background and no street/terrain basemap, tiles, remote style, glyph, or sprite. On a rebuilt signed APK, open a saved waypoint and a saved route through **View on map**. In airplane mode with Wi-Fi off, confirm waypoint pins and tap through to details, thin eligible route lines with compact endpoints, isolated route dots, Points mode selection, and line breaks at stored segment changes, pan/pinch zoom, the changing distance scale, Fit route, and Recenter. Tap overlapping markers and confirm each item is reachable in the marker card. Confirm the fresh blue marker, age, and reported accuracy; when the reading becomes stale, confirm the marker and uncertainty circle disappear, stale accuracy is shown as unavailable, and Recenter disables. Compare a fresh reported 100 m accuracy circle at two zoom levels; its geographic size should remain 100 m. Test a one-point route segment, relaunch and reopen the map, then check route totals and GPX remain unchanged. Record actual device observations in `DEVICE_TEST_RECORD.md`; source checks and the native build alone do not establish device behavior. Coverage packs and provider tiles belong to the later map phase; see `MILESTONE_7_MAP_PLAN.md`.

The owner accepted the rebuilt 7A APK's latest map fixes without supplying individual checklist results. For the 7B feasibility APK, open Map and choose **Load Kabarak sample**, then **Fit coverage**. The sample file is `assets/maps/kabarak-prototype.navmap.json`; **Import local JSON** can select the same file copied to the device. In airplane mode with Wi-Fi off, confirm roads and building shapes appear around Kabarak, attribution remains visible, map gestures and route/waypoint overlays still work, and a position outside the package shows the outside-coverage message. Relaunch and repeat the load; the prototype intentionally does not retain imported packages. Report the APK workflow run and actual observations before coverage management begins.

## Device checks for the new APK

1. Install the signed APK; confirm the existing location cards still update and that Android GNSS diagnostics appear separately.
2. Outdoors with precise foreground location, wait for a fresh GNSS status. Check reported count, used-in-fix count, constellation/SVID, C/N₀ in dB-Hz, and status age. Zero satellites must show as zero if Android reports an empty status.
3. Turn Location off, deny or reduce to approximate permission, then restore precise access; check the separate GNSS availability messages.
4. Lock and unlock the phone; old GNSS status must clear or become stale until a new callback arrives. Repeat to check for duplicate callbacks or excess battery use.
5. Repeat the airplane-mode, Wi-Fi-off location test. Record whether the previous offline behavior survives this new APK. GNSS status and C/N₀ do not measure positioning accuracy or prove the Expo reading's source.

## Dependency audit

On 2026-10-02, npm installation reported 16 dependency findings (12 moderate, 4 high), including `node-forge` (high) and `uuid` (moderate) through the Expo dependency tree. No forced audit fix was applied: `npm audit fix --force` proposes downgrading Expo to 44. Recheck advisories and SDK-compatible updates before broader distribution.

## Offline waypoint device checklist

Milestone 4 adds local SQLite storage through the SDK 57 compatible `expo-sqlite` module and UUIDv4 IDs through `expo-crypto`. Both modules are included in Expo Go, but the release APK must be rebuilt to include and validate the milestone with the project's native configuration.

1. Enable airplane mode with Wi-Fi off, keep Android Location on, wait for a fresh reading, and save a named waypoint. Confirm capture age and reported accuracy are shown before saving.
2. Force-close and relaunch Navira. Confirm the waypoint and all captured measurements persist.
3. Open details, rename it, edit the optional note, save, and restart again to confirm the edits persist without changing its coordinates or capture time.
4. Delete it, cancel the first confirmation to verify it remains, then confirm deletion and restart to verify it stays deleted.
5. Open the save form on a fresh reading, wait at least 15 seconds without a new reading or disable Location, and confirm saving is rejected without substituting newer coordinates.
6. Repeat with a high reported accuracy value and confirm the value is visible but does not block saving.

The owner reports all requested milestone 4 Samsung A16 checks passed. See [DEVICE_TEST_RECORD.md](DEVICE_TEST_RECORD.md).

## Milestone 5 device checklist

On a rebuilt Samsung A16 APK, check switching among Location, Waypoints, and Satellites, back navigation from waypoint save/details, and that repeated tab switches do not duplicate location or GNSS updates. In airplane mode with Wi-Fi off and Location on, select a saved destination and confirm distance and true-north bearing update as the current location changes; compare with a known coordinate pair where practical. Confirm stale or unavailable location pauses guidance, coincident positions show no bearing, and reported accuracies remain visible. Force-close and relaunch to confirm waypoint persistence. Lock and unlock, then check fresh location and GNSS status return on their respective tabs. The owner later reported milestone 5 and its UX fixes satisfactory on a Samsung A16; individual checklist results were not supplied.

## Milestone 5 UX follow-up checks

On a rebuilt APK, verify text-only bottom tabs and single headers, compact measurements and satellite rows, direct access to the saved list, focused guidance and edit routes, and Info actions. Confirm a fresh 800 m accuracy reading is labelled low precision without changing the reported value or blocking a waypoint save. Check GNSS age during frequent callbacks, after lock/unlock, and after a stale callback; old counts must not appear live. The owner reported the milestone 5 UX satisfactory on a Samsung A16; individual checks above were not supplied.

## Milestone 6 build requirements and device checklist

A new APK is required for the SDK 57 compatible `expo-file-system` and `expo-sharing` modules. Use the existing manual GitHub Actions release workflow and the owner's current signing credentials; no workflow or build was triggered here. The generated APK manifest must be checked for foreground location only and no background or foreground-service location permission.

For the focused policy 2 device check, use a newly created route. With airplane mode enabled and Wi-Fi off, confirm fresh foreground readings, stored sample count, distance-contributing count, and the displayed current/last-saved accuracy. Observe a missing or over-100 m accuracy period if the device produces one: samples should retain an exclusion reason, distance should stop, and observed low-precision duration should grow only while consecutive callbacks arrive. When accuracy recovers, the first eligible point should start a new segment with no bridging distance. At or below 100 m is eligible under the policy but does not prove true position accuracy.

Pause/resume, lock/unlock, background/return, callback silence, and force-close/relaunch should preserve saved samples, require explicit resume, and add neither closed-time duration nor bridging distance. Export a route with a real quality or pause break through the share sheet while offline; inspect UTC times, separate `<trkseg>` elements, and absence of excluded samples from primary track geometry. Reopen a pre-migration saved route and confirm its original point count, distance, and GPX still match. Recheck waypoint, guidance, location-card, and GNSS-status behavior separately. The owner previously accepted milestone 6 and supplied a one-segment GPX; **this policy 2 change has not been device verified**, and no build was triggered.
