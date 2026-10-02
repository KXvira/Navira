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

This verifies native GNSS status and location updates in the reported airplane-mode test. Android's used-in-fix flags describe its latest GNSS fix; they do not establish the source of each separate Expo Location reading. The new APK's lock/unlock behavior, permission changes, disabled Location behavior, zero-satellite state, and callback cleanup remain to be tested. Milestone 1 location lifecycle tests and the milestone 2 lock/unlock accuracy observation are recorded above; they do not verify the new native GNSS lifecycle.
