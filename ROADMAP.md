# Roadmap

## Milestone 1 — foreground location screen (device verified)

The five measurement cards, update age, waiting/receiving/stale/error states, permission denial, disabled Location, retry, and leaving/returning to the app passed owner testing on a Samsung A16. TypeScript, lint, and Expo Doctor also passed in the implementation session.

## Milestone 2 — installable offline preview (device verified)

The owner installed a preview APK on a Samsung A16 and launched it independently of Expo Go and Metro. With airplane mode enabled, Wi-Fi off, and Android Location enabled, fresh updates arrived. Acquisition time and reported accuracy varied; after locking and unlocking, reported accuracy sometimes rose to around 100 m. This verifies offline operation for the reported test conditions. Exact timing values, accuracy series, build ID, and final APK manifest inspection are not recorded. See [DEVICE_TEST_RECORD.md](DEVICE_TEST_RECORD.md). GNSS-only positioning remains unverified.

## Milestone 3 — native Android GNSS diagnostics (device verified)

The owner installed a GitHub Actions release APK on a Samsung A16. In airplane mode, Expo Location updates and native GNSS status worked. One screenshot showed 50 satellite entries reported, 16 used in Android's latest GNSS fix, both displayed ages at 0 seconds, and reported horizontal accuracy of 26.9 m. These values are observations, not guaranteed performance. See [DEVICE_TEST_RECORD.md](DEVICE_TEST_RECORD.md).

The owner also reported passing lock/unlock, Location off/on, and precise-permission revoke/restore checks on this APK. Zero-satellite and explicit duplicate-registration/cleanup observations remain unreported. Android GNSS status confirms satellite use for its latest GNSS fix; it does not establish the source of each separate Expo Location reading.

## Milestone 4 — offline saved waypoints (device verified by owner report)

The app can capture a named immutable snapshot from a fresh Expo location, persist it locally in SQLite, list and show details, edit its name and note, and delete it after confirmation. The UI reports storage failures and retained malformed rows; low reported accuracy remains visible without blocking saves.

The owner reports that all requested Samsung A16 checks passed: airplane-mode save, restart persistence, details and editing, confirmed deletion, and stale-location rejection. See [DEVICE_TEST_RECORD.md](DEVICE_TEST_RECORD.md).

## Milestone 5 — local straight-line waypoint guidance and tabs (accepted by owner report)

Location, Waypoints, and Satellites are separate tabs. Waypoint save and detail/edit use focused routes. Selecting a destination shows local straight-line distance and initial true-north bearing only while the current location is fresh. No map, compass alignment, background tracking, or position averaging is included. The owner reported milestone 5 and its UX fixes satisfactory on a Samsung A16 without individual test measurements; see [DEVICE_TEST_RECORD.md](DEVICE_TEST_RECORD.md).

## Milestone 6 — offline foreground route recording (accepted by owner report)

The app records accepted foreground location samples in SQLite, pauses across background/lock, preserves segment breaks, recovers interrupted work paused, and exports named saved routes as local GPX through the share sheet. The owner reports that the app works on a device, with occasional degraded location accuracy. An owner-exported GPX and final APK manifest have not been inspected. See [DEVICE_TEST_RECORD.md](DEVICE_TEST_RECORD.md).
