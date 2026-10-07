# Device test record

## Milestone 2 — Android preview APK

Reported by the project owner for a Samsung A16. The exact test date, APK build ID, Android version, acquisition times, and accuracy readings were not supplied.

### Conditions and observations

- The installed preview APK launched independently of Expo Go and Metro.
- Airplane mode was enabled, Wi-Fi was off, and Android Location remained enabled.
- Fresh location updates arrived with airplane mode enabled and Wi-Fi off.
- Acquisition time and reported horizontal accuracy varied between observations; no numeric series was supplied.
- After locking and unlocking the phone, reported accuracy sometimes rose to around 100 m.

### Conclusion and limits

Offline operation is physically verified for this Samsung A16 test under the stated conditions. The result does not verify that positions came exclusively from GNSS: Expo Location reads Android location services and does not identify an exclusive source in this app. A reported accuracy value is a platform estimate, not proof of source or a measured positioning error. The final APK manifest has not been independently inspected in this record.

## Milestone 3 — GitHub Actions release APK

Reported by the project owner for a Samsung A16. The APK built by GitHub Actions installed and ran successfully. With airplane mode enabled, Expo Location updates and native Android GNSS status both worked.

A screenshot captured one snapshot with 50 satellite entries reported by Android, 16 marked used in the latest GNSS fix, a displayed age of 0 seconds for both location and GNSS status, and reported horizontal accuracy of 26.9 m. These are observations from one snapshot, not guaranteed acquisition time, accuracy, satellite count, or update rate. The screenshot's exact time and build ID were not supplied.

This verifies native GNSS status and location updates in the reported airplane-mode test. Android's used-in-fix flags describe its latest GNSS fix; they do not establish the source of each separate Expo Location reading. The owner also reported passes for lock/unlock, Location off/on, and precise-permission revoke/restore on this GitHub Actions APK. Zero-satellite behavior and explicit duplicate-registration or cleanup observation remain unreported.

## Milestone 4 — offline saved waypoints

The project owner reported that all requested Samsung A16 device tests passed. The requested checklist covered airplane-mode save, force-close and relaunch persistence, waypoint details and editing, confirmed deletion, stale-location rejection, and displaying high reported inaccuracy without blocking a save. This is a user report; the test date, APK build ID, Android version, individual readings, and screenshots were not supplied.

## Milestone 5 — tabs, guidance, and UX fixes

The project owner reported that milestone 5 and its UX fixes are satisfactory on a Samsung A16. This is user-reported acceptance; individual test steps, measurements, APK build ID, Android version, and test date were not supplied. It does not verify milestone 6 route recording.

## Milestone 6 — foreground route recording

The project owner reports that the milestone 6 app works on a device and accepts its behavior. The owner also reports that location accuracy sometimes degrades. This is user-reported acceptance, not an independent device test. The device model for this milestone, APK build ID, Android version, and numeric accuracy series were not supplied.

### Owner-exported GPX inspection

The owner supplied `ignore/8d7bc6d6-a45b-49d5-87b4-43b07251af2d.gpx`. Local XML parsing found a GPX 1.1 document with creator `Navira`, one named track, one `<trkseg>`, and seven `<trkpt>` elements. Every point has valid latitude/longitude attributes, an elevation element, and a UTC timestamp. Timestamps increase strictly from 2026-10-03 15:48:24.970 UTC to 15:49:51.967 UTC; adjacent intervals range from 11.999 to 17.998 seconds. The straight-line sum of adjacent points within the segment is about 72.1 m, with a largest individual leg of about 12.8 m. This is a calculation from exported positions, not verified travel distance or accuracy.

No pause or gap boundary appears in this file, so it cannot verify multi-segment export behavior. The export has no horizontal-accuracy fields, in line with the current GPX policy; the file alone cannot establish which readings had degraded reported accuracy or whether the recorded movement was real. XML parsing and structural checks were performed; GPX XSD validation and a device-side comparison to the saved route were not performed.

One interval between saved points exceeds 15 seconds. The sampler defines an automatic gap using valid observed callbacks, including callbacks that are not saved, so this interval alone does not establish a missing segment break. Those callbacks are not present in the GPX.

The later policy 2 quality fix for new recordings has not been built or device tested. The owner's acceptance and the inspected GPX above describe the previous recording behavior only.

## Milestone 7 — offline map controls and Kitchen route discrepancy

### Map issue review (source only, 2026-10-04)

The owner supplied two screenshots of the same map framing: Line mode shows many separate S/F labels along a diagonal path; Points mode shows many closely spaced cyan samples along that path. The screenshots establish the visible difference but contain no stored segment IDs, distance statuses, or policy version. The owner has only the screenshots, so this specific route's database rows remain unverified. The source shows that the prior map converter split at every excluded row, whereas policy 2 leaves `stationary` rows in the same segment and GPX omits them without a split. This is a confirmed conversion defect and a plausible explanation for the screenshot pattern. If the route instead contains mostly distinct stored segment IDs after quality loss or spikes, those isolated points must remain disconnected. The revised Line mode uses small dots for isolated eligible samples, and Points mode uses smaller dots with one selected sample highlighted.

The numbered cyan squares were ordinal labels for *displayed eligible stretches*, not stored `segment_index` values. The prior map converter ended a stretch at every excluded sample, including stationary rows that retain the same stored segment. This was a conversion defect. The corrected converter omits those rows and ends stretches at stored segment changes, matching GPX grouping. Thus labels 13 and 5 do not establish 13 or 5 route starts, nor that separate routes were merged. The supplied Kitchen GPX establishes one exported segment with seven eligible points, but cannot identify the phone screenshot's other route rows. The phone database rows and APK were not available for inspection. The map now shows compact endpoints for continuous lines, small tappable dots for isolated eligible samples, and smaller inspectable samples in Points mode. Source regression checks cover stationary rows within one segment, and quality exclusions in a new segment without a connecting line.

The SQLite error is still under investigation. Installed `expo-sqlite` 57.0.3 JavaScript creates a `NativeStatement` object for `prepareAsync`; its Android source also expects that object. The exception reports an integer where that native object is expected, which is consistent with a JS/native binary mismatch, but no installed APK module version or runtime trace was available to confirm this. Route and waypoint repositories each open `navira.db` and retain a handle; neither closes it during map navigation. Route initialization is promise-shared within its repository; waypoint initialization repeats its table setup on each call. Map reads saved routes concurrently and cancels only React state updates on navigation, not SQLite work. No database reset, row deletion, or recording change was made. The map now shows a concise error and Retry; the original exception is logged locally through `console.error`.

Device check on a newly built APK: record the APK build ID and bundled `expo-sqlite` version, verify the final manifest, and keep a backup of the app data before testing. Open/close the map from the tab, a route detail, and a waypoint detail at least 20 times each; repeat after force-close/relaunch and while a saved route has many points. If an error appears, capture local diagnostic logs and try Retry without leaving the map; verify saved routes, waypoints, totals, and GPX still match before and after. For the 13/5 screenshot, inspect the corresponding route detail sample rows (point ID, stored segment, status, timestamp) and compare Line and Points modes. Confirm isolated dots with tap details, a visible selected-point highlight, no connection across quality exclusions or genuine gaps, and distinct W and You markers. These are pending physical-device checks, not completed results.

The owner reports that all map controls work offline on a Samsung A16. This accepts the controls under the owner's test conditions; the APK build ID and exact network settings for this map test were not supplied.

The owner reports that the Kitchen route appears as a long cyan line plus a separate short cyan line. The supplied Kitchen GPX has one track segment and seven points. GPX export groups eligible stored points by `segment_index`; map GeoJSON also groups eligible points by `segmentIndex` and does not split on elapsed time. Legacy policy 1 points migrate with `distance_status = 'legacy'`, which both paths include. The 17.998-second interval between two exported points therefore does not itself explain a map-only break.

Code inspection found that a route-specific map previously rendered every saved route, while using the selected route only for camera fitting. The map now limits displayed route geometry to the selected route when opened from route details. This is a confirmed route-selection defect and a possible explanation for the separate short line, but the device's Kitchen point rows and other saved routes have not been inspected. Route-rendering correctness remains pending until the owner checks this build on the phone or supplies a diagnostic of the saved route rows. No route rows or totals were modified.

Minimal device check: open Kitchen's route details and capture the header showing legacy/policy status and segment count, then capture all seven saved-point rows showing their segment numbers and statuses. Open Kitchen via **View on map** on a build containing the route-selection fix. If the short line remains, a local diagnostic export containing only the Kitchen route's policy version and ordered point IDs, segment IDs, timestamps, distance statuses, and coordinates is needed; do not send the full database or unrelated routes.

### Milestone 7A closure — owner report, 2026-10-07

The owner reports that the rebuilt APK passes their device checks and accepts the latest map fixes. Individual observations, APK build ID, Android version, and exact test conditions were not supplied for this report; the earlier checklist must not be treated as a list of separately confirmed results. The intermittent location behavior and SQLite exception remain unresolved, with unknown causes. The route-specific display discrepancy has no supplied database-row comparison, so its cause on the device is also unconfirmed. This report does not verify milestone 7B offline basemap rendering.
