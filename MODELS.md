# Location model

The hook stores the latest Expo `LocationObject` or `null`, a phase, and an optional error. `coords.latitude` and `coords.longitude` are decimal degrees. `coords.accuracy` is reported horizontal accuracy in metres; `coords.altitude` is metres; `coords.speed` is metres per second and is displayed in kilometres per hour. Optional or non-finite measurements display `Unavailable`; negative reported speed is also unavailable. Zero remains a valid measurement.

`LocationObject.timestamp` is Unix epoch milliseconds. The screen compares it with `Date.now()` once per second and displays a nonnegative whole-second age. A receiving reading becomes stale at 15 seconds without a newer timestamp. The last reading remains visible during stale and error states, with the status explaining its condition. This timestamp is the provider's reading time, not proof of GNSS provenance or offline operation.

## GNSS diagnostics model

A GNSS snapshot is separate from `LocationObject`. It contains Android's reported satellite count, the count of `usedInFix` flags for the most recent GNSS fix, and entries with constellation name, SVID, C/N₀ in dB-Hz, and `usedInFix`. A reported count of zero is a valid snapshot. Missing callback data displays as unavailable. C/N₀ is carrier-to-noise density, not horizontal accuracy.

Android supplies callback wall-clock and elapsed-realtime timestamps. The hook records when JavaScript receives the callback and uses that time for the displayed GNSS status age. Status becomes stale after 15 seconds without a new callback. On background and resume the prior snapshot is cleared and age is unavailable until a fresh callback. GNSS status and Expo location timestamps do not establish a shared fix identity or exclusive source.
