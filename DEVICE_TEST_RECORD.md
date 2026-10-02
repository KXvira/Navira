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

The project owner reported that all requested Samsung A16 device tests passed. The requested checklist covered airplane-mode save, force-close and relaunch persistence, waypoint details and editing, confirmed deletion, stale-location rejection, and displaying high reported inaccuracy without blocking a save. This is a user report; the test date, APK build ID, Android version, individual readings, and screenshots were not supplied. Milestone 5 has not been physically tested.
