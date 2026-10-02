# Roadmap

## Milestone 1 — foreground location screen (device verified)

The five measurement cards, update age, waiting/receiving/stale/error states, permission denial, disabled Location, retry, and leaving/returning to the app passed owner testing on a Samsung A16. TypeScript, lint, and Expo Doctor also passed in the implementation session.

## Milestone 2 — installable offline preview (device verified)

The owner installed a preview APK on a Samsung A16 and launched it independently of Expo Go and Metro. With airplane mode enabled, Wi-Fi off, and Android Location enabled, fresh updates arrived. Acquisition time and reported accuracy varied; after locking and unlocking, reported accuracy sometimes rose to around 100 m. This verifies offline operation for the reported test conditions. Exact timing values, accuracy series, build ID, and final APK manifest inspection are not recorded. See [DEVICE_TEST_RECORD.md](DEVICE_TEST_RECORD.md). GNSS-only positioning remains unverified.

## Milestone 3 — native Android GNSS diagnostics (implemented; build and device validation pending)

A local Kotlin Expo module, separate GNSS status UI, and manual GitHub Actions signed APK workflow are in source. Acceptance requires a successful `:app:assembleRelease` with the existing signing key, a verified embedded JavaScript bundle and local module, then Samsung A16 tests of satellite fields, zero counts, freshness, permission and provider states, pause/resume cleanup, and continued offline Expo location updates. No new APK or GNSS device result has been reported. Satellite status does not prove an Expo reading came exclusively from GNSS.

## Milestone 4 — offline tools

Design local maps or exports with explicit storage, privacy, and battery behavior. No implementation is committed yet.
