# Business rules

Current behavior: on mount or retry, request foreground permission, check whether device Location services are enabled, then subscribe to updates. Denial shows an instruction to allow access in app settings. Disabled services show an instruction to enable Location. Startup and watcher failures show an error and retry. The screen shows waiting until the first callback, receiving on updates, and stale after 15 seconds without one. Retry restarts the foreground flow. Missing values say `Unavailable`.

Navira requests no background permission and makes no GNSS-only, satellite-count, or verified-offline claim. Coordinates remain in process memory. Planned enhancements are listed only in ROADMAP.md.

## Milestone 3 GNSS behavior

The diagnostics section starts only after Expo foreground location access enters a usable state and while the app is active. The native module independently requires precise (`ACCESS_FINE_LOCATION`) permission and an enabled GPS provider. It makes a GPS location request solely to activate diagnostics; it discards those positions and never changes the Expo location cards. It removes both the request and status callback when paused, stopped, or unobserved. Permission denial, disabled GPS, unsupported hardware or module, waiting, receiving, stale, and error states are distinct. A zero-satellite callback shows zero, not unavailable. GNSS data is not proof that an Expo reading used GNSS alone.
