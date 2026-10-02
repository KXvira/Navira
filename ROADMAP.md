# Roadmap

## Milestone 1 — foreground location screen (device verified)

The five measurement cards, update age, waiting/receiving/stale/error states, permission denial, disabled Location, retry, and leaving/returning to the app passed owner testing on a Samsung A16. TypeScript, lint, and Expo Doctor also passed in the implementation session.

## Milestone 2 — installable offline preview (device verified)

The owner installed a preview APK on a Samsung A16 and launched it independently of Expo Go and Metro. With airplane mode enabled, Wi-Fi off, and Android Location enabled, fresh updates arrived. Acquisition time and reported accuracy varied; after locking and unlocking, reported accuracy sometimes rose to around 100 m. This verifies offline operation for the reported test conditions. Exact timing values, accuracy series, build ID, and final APK manifest inspection are not recorded. See [DEVICE_TEST_RECORD.md](DEVICE_TEST_RECORD.md). GNSS-only positioning remains unverified.

## Milestone 3 — native Android GNSS diagnostics (APK and core behavior device verified; lifecycle checks pending)

The owner installed a GitHub Actions release APK on a Samsung A16. In airplane mode, Expo Location updates and native GNSS status worked. One screenshot showed 50 satellite entries reported, 16 used in Android's latest GNSS fix, both displayed ages at 0 seconds, and reported horizontal accuracy of 26.9 m. These values are observations, not guaranteed performance. See [DEVICE_TEST_RECORD.md](DEVICE_TEST_RECORD.md).

Remaining acceptance checks for this APK: lock/unlock and resume freshness, permission changes, disabled Location, zero satellites, duplicate registration and cleanup behavior. The earlier location lifecycle tests do not cover the new GNSS module. Android GNSS status confirms satellite use for its latest GNSS fix; it does not establish the source of each separate Expo Location reading.

## Milestone 4 — offline tools

Design local maps or exports with explicit storage, privacy, and battery behavior. No implementation is committed yet.
