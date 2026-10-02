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

## Milestone 5 guidance

- A saved waypoint may be selected as an in-memory destination. Selection does not mutate its SQLite record.
- Distance is straight-line geographic distance. Bearing is the initial great-circle course clockwise from true north, with an eight-point cardinal label. It is not phone-relative and supplies no road or walking route.
- Guidance is shown only with a fresh current Expo reading; stale, unavailable, denied, and disabled states show a paused message. Coincident positions have no bearing.
- Current and saved horizontal accuracies remain visible as reported estimates. No exact arrival threshold is claimed.

## Milestone 5 UI and GNSS freshness

- Location update age and reported horizontal accuracy are independent. A fresh update above 100 m reported accuracy is labelled low precision and shown in amber; the reading and waypoint save eligibility are unchanged.
- GNSS age and stale phase use Android's emitted wall-clock observation timestamp. A small UI tick offset is displayed as zero seconds; an invalid or old observation cannot be presented as live.
- The Waypoints tab uses a compact destination summary. Full guidance and waypoint editing use separate routes.

## Milestone 6 route recording

- Starting and resuming require a fresh foreground Expo location and explicit user action. The shared location subscription supplies all samples; no route watcher or background service is created.
- App backgrounding or locking halts sampling immediately and persists a pause. On return, explicit resume is required. A failed pause write blocks further sampling and shows an error; restart recovery pauses a recording left active in SQLite.
- Only valid coordinate/timestamp samples newer than the last saved point and less than 15 seconds old are candidates. Samples at least two seconds apart must move at least 10 m and at least the larger reported horizontal accuracy; a same-segment implied speed above 70 m/s is rejected. These thresholds reduce stationary jitter, not measure true travel distance.
- A gap of at least 15 seconds between valid observed callbacks, manual pause/resume, and foreground exit start new segments. No distance is added across segment boundaries. Distance sums straight-line distances between accepted points within each segment only.
- Accepted points are written incrementally in SQLite. Unsaved or rejected callbacks do not increase displayed saved counts or distance. Storage failures are visible and halt recording until a pause is persisted and the user explicitly resumes.
- Stop freezes the route; the user names and saves it explicitly. Unfinished routes can be resumed, stopped, saved, or discarded with confirmation. Saved routes can be deleted with confirmation.
- GPX 1.1 export writes a temporary local file and opens the platform share sheet. It preserves segments and UTC timestamps and includes elevation when available. Reported horizontal accuracy is omitted because it is not GPX HDOP. No app network request is made.
