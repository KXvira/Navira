# UI conventions

Current UI uses a dark navy canvas (`#08131f`), white primary text, muted blue labels, green for receiving, and amber for nonreceiving status. The title is 40 pt; reading values are 26 pt with clear labels. `Reading` is the reusable measurement card; `LocationStatus` owns status text, age, and retry. Use a scrollable single-column Location layout and a labelled, accessible retry button.

Always show waiting, receiving, stale, permission-denied, services-disabled, and error as distinct text states. Keep the last values visible with age when updates stop, so users can see they are old. Use `Unavailable` for absent measurements.

The Android GNSS diagnostics view is on the Satellites tab. Its status, counts, per-satellite rows, and freshness are independent of the location status card. The panel explains that C/N₀ is signal strength density, not accuracy, and that GNSS status does not identify the source of the Expo reading. Expo Go shows a native-module-unavailable message without affecting the location cards.

The waypoint views use the existing navy panels, white primary text, muted blue supporting text, green success, amber availability warnings, and light red errors/destructive actions. Forms label required and optional fields. A captured location shows its age and reported accuracy before save. Disabled actions use reduced opacity and explanatory text. Stored waypoint rows open details and editing; deletion always uses a platform confirmation alert.

## Milestone 5 navigation

The main views are Location, Waypoints, and Satellites bottom tabs. The tab shell keeps shared lifecycle state above screens. Waypoint and satellite rows use virtualized FlatLists. Waypoint save and detail/edit open focused stack routes. Safe area insets protect content, and primary actions have accessible labels and at least 44 pt height. Guidance is explicitly straight-line and shows current/saved accuracy.
