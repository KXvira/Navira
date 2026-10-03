# Business rules

Current behavior: on mount or retry, request foreground permission, check whether device Location services are enabled, then subscribe to updates. Denial shows an instruction to allow access in app settings. Disabled services show an instruction to enable Location. Startup and watcher failures show an error and retry. The screen shows waiting until the first callback, receiving on updates, and stale after 15 seconds without one. Retry restarts the foreground flow. Missing values say `Unavailable`.

Navira requests no background permission. Live coordinates remain in memory unless the user saves a waypoint or starts a foreground route recording; those records stay in local SQLite. Native Android satellite diagnostics exist but remain separate from Expo Location readings. Owner-reported offline operation applies only to the recorded airplane-mode device conditions; it does not prove GNSS-only location sources. Maps are planned, not implemented.

## Milestone 3 GNSS behavior

The diagnostics section starts only after Expo foreground location access enters a usable state and while the app is active. The native module independently requires precise (`ACCESS_FINE_LOCATION`) permission and an enabled GPS provider. It makes a GPS location request solely to activate diagnostics; it discards those positions and never changes the Expo location cards. It removes both the request and status callback when paused, stopped, or unobserved. Permission denial, disabled GPS, unsupported hardware or module, waiting, receiving, stale, and error states are distinct. A zero-satellite callback shows zero, not unavailable. GNSS data is not proof that an Expo reading used GNSS alone.

## Milestone 4 waypoint behavior

- Saving requires a fresh current location and a nonblank name. Notes are optional.
- Opening the form captures a fixed copy of the current location. Submission rechecks that copy against the same 15-second freshness rule and never substitutes a later reading.
- No location, stale data, denied access, disabled services, or an initial storage load disables saving. Reported low accuracy remains visible and does not block saving.
- Success appears only after SQLite confirms the write. Load and write failures remain visible and retryable.
- Saved details preserve nullable altitude and horizontal accuracy. Renaming and note edits never change captured coordinates or capture time.
- Delete requires confirmation. Malformed stored rows are reported and retained rather than silently deleted.
- Waypoints stay in local app storage. There is no account, synchronization, backend, analytics, map, position averaging, or background tracking. Foreground route recording exists separately.

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
- SQLite schema version 2 adds `policy_version`, `distance_point_count`, `excluded_duration_ms`, observed-callback state, and each point's `distance_status`. Existing route rows remain policy 1 with unchanged points, distances, and nullable distance-point counts. New routes use the named `ROUTE_QUALITY_POLICY_V2` policy. Old unfinished routes continue their original sampling rule.
- Policy 2 rejects invalid coordinates, altitude, accuracy, or timestamps; readings 15 seconds old or older; and out-of-order timestamps. These do not advance observation time or counters. Valid fresh observations update the committed observation clock; at most one sample every two seconds is stored. Every stored sample keeps its reported horizontal accuracy and a distance status: anchor, counted, stationary, spike, missing accuracy, or low precision.
- Missing accuracy or reported horizontal accuracy **above** 100 m excludes the sample from distance. Exactly 100 m remains eligible. This cutoff is a policy decision, not a guarantee of reliable positioning below it. An unsuitable observation severs the preceding distance segment even when cadence prevents storing that observation. When accuracy becomes suitable again, the first stored point anchors a new distance segment and adds no bridging distance.
- For suitable samples within one segment, movement below the larger of 10 m and the two endpoint accuracy estimates is stored as stationary with no distance. Implied speed above 70 m/s is stored as a spike with no distance and severs geometry. Other movement adds straight-line distance from the last geometry point. No smoothing or uncertain-distance total is calculated.
- A gap of at least 15 seconds between valid observed callbacks, manual pause/resume, foreground exit, and interrupted recovery prevents connection to the previous segment. A pause or recovery resets the observation clock. The next stored suitable point anchors a new segment. No distance or excluded duration crosses these boundaries.
- Excluded duration counts only an interval between two consecutive valid unsuitable-accuracy observations at most three seconds apart. An invalid or stale callback cuts duration continuity; an out-of-order duplicate does not advance it. The entry and exit intervals, longer callback silence, pauses, background time, and app closure add no duration. The displayed duration is conservative and may undercount a real low-precision period.
- Stored sample count and distance-contributing point count are separate, and update only after SQLite confirms the transaction. Storage failures halt recording until a pause is persisted and the user explicitly resumes.
- Stop freezes the route; the user names and saves it explicitly. Unfinished routes can be resumed, stopped, saved, or discarded with confirmation. Saved routes can be deleted with confirmation.
- GPX 1.1 export writes a temporary local file and opens the share sheet. It includes legacy points and policy 2 anchors/counted points only, preserving their segment breaks and UTC timestamps. Excluded policy 2 samples stay in SQLite but are omitted from GPX track geometry. Empty excluded segments are omitted. Elevation appears when available; horizontal accuracy is omitted because it is not GPX HDOP. No app network request is made.
