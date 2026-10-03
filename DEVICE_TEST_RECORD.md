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
