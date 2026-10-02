# Navira working conventions

Navira is an Expo SDK 57, React Native, TypeScript location app. Keep changes mobile-first, cross-platform, and small. Expo Router composes the app; put screen UI in `src/screens`, reusable views in `src/components`, lifecycle state in `src/hooks`, Expo calls in `src/services`, models in `src/types`, and pure display rules in `src/utils`.

Before changing Expo, EAS, or React Native APIs, check the installed Expo major version and the matching versioned docs at https://docs.expo.dev/versions/v57.0.0/ and follow links from https://docs.expo.dev/llms.txt. Use `npx expo install` for Expo-compatible packages; this project has `package-lock.json`, not Bun. Do not hand-edit generated native directories. Use the installed Expo Router for navigation; the current app has bottom tabs and focused routes.

Keep foreground location only. Do not send coordinates. Persist coordinates only when the user explicitly saves a waypoint or starts a foreground route recording, using the respective local repository. Distinguish missing measurements from zero and GNSS claims from Android location service readings. Preserve the location cards and subscription flow already tested on a Samsung A16.

Before finishing code changes, run `npx tsc --noEmit`, `npx expo lint`, and `npx expo-doctor`. If a lint command requires new tooling, report that clearly. Do not use `npm audit fix --force`; its proposed Expo downgrade is incompatible with this project. Document what needs physical-device testing without claiming device tests you did not perform.

Milestone 1's modular app behavior passed owner testing on a Samsung A16. Preserve its UI and location lifecycle during build work. The milestone 2 preview profile is in `eas.json` and its APK passed device testing; the EAS project is linked in `app.json`. The owner controls EAS signing credentials. Run Expo config introspection to check permissions and verify the final APK manifest when available. The owner reported that the preview APK produced fresh updates on a Samsung A16 with airplane mode enabled and Wi-Fi off; see DEVICE_TEST_RECORD.md. Treat offline operation as verified for those conditions only. The test cannot establish GNSS-only provenance.

Milestone 3 uses `modules/navira-gnss` and a manual GitHub Actions Gradle workflow. Keep GNSS status independent of Expo location readings. Android release signing is defined in `plugins/withNaviraReleaseSigning.js`; never edit generated `android/` by hand or allow debug signing for release. GitHub Actions secrets hold the existing EAS keystore and signing values. Do not commit or print credentials. The Git remote was unset when the workflow was added; do not push or trigger it without user direction.

Milestone 4 stores user-created waypoints in SQLite through `src/services/waypointRepository.ts`. Keep storage access out of UI and hooks, preserve malformed rows, reuse the shared location freshness rule, and never replace a form's captured coordinates with a later reading.

Milestone 6 records routes through `useRouteRecording` and `routeRepository.ts` using the shared Expo Location subscription. Keep route recording foreground only, preserve segment breaks and interrupted recovery, and never claim uncommitted points or time were saved. GPX export uses a local cache file and the share sheet; do not add network or background permissions.
