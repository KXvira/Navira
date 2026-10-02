# UI conventions

Current UI uses a dark navy canvas (`#08131f`), white primary text, muted blue labels, green for receiving, and amber for nonreceiving status. The title is 40 pt; reading values are 26 pt with clear labels. `Reading` is the reusable measurement card; `LocationStatus` owns status text, age, and retry. Use a scrollable single-column layout and a labelled, accessible retry button.

Always show waiting, receiving, stale, permission-denied, services-disabled, and error as distinct text states. Keep the last values visible with age when updates stop, so users can see they are old. Use `Unavailable` for absent measurements.

The Android GNSS diagnostics panel sits below the existing location cards. Its status, counts, per-satellite rows, and freshness are independent of the location status card. The panel explains that C/N₀ is signal strength density, not accuracy, and that GNSS status does not identify the source of the Expo reading. Expo Go shows a native-module-unavailable message without affecting the location cards.
