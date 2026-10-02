# Business rules

Current behavior: on mount or retry, request foreground permission, check whether device Location services are enabled, then subscribe to updates. Denial shows an instruction to allow access in app settings. Disabled services show an instruction to enable Location. Startup and watcher failures show an error and retry. The screen shows waiting until the first callback, receiving on updates, and stale after 15 seconds without one. Retry restarts the foreground flow. Missing values say `Unavailable`.

Navira requests no background permission and makes no GNSS-only, satellite-count, or verified-offline claim. Coordinates remain in process memory. Planned enhancements are listed only in ROADMAP.md.

## Milestone 3 GNSS behavior

The diagnostics section starts only after Expo foreground location access enters a usable state and while the app is active. The native module independently requires precise (`ACCESS_FINE_LOCATION`) permission and an enabled GPS provider. It makes a GPS location request solely to activate diagnostics; it discards those positions and never changes the Expo location cards. It removes both the request and status callback when paused, stopped, or unobserved. Permission denial, disabled GPS, unsupported hardware or module, waiting, receiving, stale, and error states are distinct. A zero-satellite callback shows zero, not unavailable. GNSS data is not proof that an Expo reading used GNSS alone.

## Milestone 4 waypoint behavior

- Saving requires a fresh current location and a nonblank name. Notes are optional.
- Opening the form captures a fixed copy of the current location. Submission rechecks that copy against the same 15-second freshness rule and never substitutes a later reading.
- No location, stale data, denied access, disabled services, or an initial storage load disables saving. Reported low accuracy remains visible and does not block saving.
- Success appears only after SQLite confirms the write. Load and write failures remain visible and retryable.
- Saved details preserve nullable altitude and horizontal accuracy. Renaming and note edits never change captured coordinates or capture time.
- Delete requires confirmation. Malformed stored rows are reported and retained rather than silently deleted.
- Waypoints stay in local app storage. There is no account, synchronization, backend, analytics, map, route recording, position averaging, or background tracking.
