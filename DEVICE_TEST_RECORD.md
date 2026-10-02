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
