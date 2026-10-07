# Graph Report - navira  (2026-10-07)

## Corpus Check
- 86 files · ~34,518 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 588 nodes · 1094 edges · 30 communities (24 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5800b0d6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- RecordedRoute
- waypointValidation.ts
- AppData.tsx
- dependencies
- routeQualityPolicy.test.ts
- expo
- Navira — Offline GNSS Lab
- render-brand.js
- scripts
- satellites.tsx
- map.tsx
- useLocationReading.ts
- RouteRepository
- NaviraGnssModule
- Architecture
- Decisions
- Business rules
- Location model
- tsconfig.json
- offlineMapRepository.ts
- eslint.config.js
- AGENTS.md
- withNaviraReleaseSigning.js
- UI conventions
- maps/README.md
- route.ts
- routeRepository.ts
- routeRecording.test.ts
- routeQualityPolicy.ts

## God Nodes (most connected - your core abstractions)
1. `useAppData()` - 25 edges
2. `formatMeasurement()` - 20 edges
3. `RoutePoint` - 17 edges
4. `RecordedRoute` - 16 edges
5. `RouteRepository` - 14 edges
6. `expo` - 13 edges
7. `expo-router` - 13 edges
8. `SQLiteRouteRepository` - 13 edges
9. `scripts` - 12 edges
10. `db()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `guidance()` --calls--> `straightLineGuidance()`  [EXTRACTED]
  tests/guidance.test.ts → src/utils/guidance.ts
- `SatellitesScreen()` --calls--> `useAppData()`  [EXTRACTED]
  app/(tabs)/satellites.tsx → src/hooks/AppData.tsx
- `WaypointsScreen()` --calls--> `straightLineGuidance()`  [EXTRACTED]
  app/(tabs)/waypoints.tsx → src/utils/guidance.ts
- `WaypointsScreen()` --calls--> `captureLocationSnapshot()`  [EXTRACTED]
  app/(tabs)/waypoints.tsx → src/utils/waypointValidation.ts
- `GuidanceScreen()` --calls--> `straightLineGuidance()`  [EXTRACTED]
  app/guidance.tsx → src/utils/guidance.ts

## Import Cycles
- None detected.

## Communities (30 total, 6 thin omitted)

### Community 0 - "RecordedRoute"
Cohesion: 0.26
Nodes (9): db(), finite(), nullableFinite(), one(), parsePoint(), parseRoute(), SQLiteRouteRepository, RecordedRoute (+1 more)

### Community 1 - "waypointValidation.ts"
Cohesion: 0.11
Nodes (26): EditForm(), save(), NewWaypointScreen(), save(), initializeDatabase(), requireDraft(), SQLiteWaypointRepository, waypointRepository (+18 more)

### Community 2 - "AppData.tsx"
Cohesion: 0.06
Nodes (50): GuidanceScreen(), styles, formatElapsed(), RecordingScreen(), styles, RouteDetailsScreen(), styles, RoutesScreen() (+42 more)

### Community 3 - "dependencies"
Cohesion: 0.05
Nodes (43): expo, expo-constants, expo-crypto, expo-document-picker, expo-file-system, expo-linking, expo-location, expo-router (+35 more)

### Community 4 - "routeQualityPolicy.test.ts"
Cohesion: 0.09
Nodes (21): evaluateQualitySample(), afterInvalid, afterLongGap, afterSpike, anchor, base, boundary, counted (+13 more)

### Community 5 - "expo"
Cohesion: 0.05
Nodes (39): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, blockedPermissions, package, permissions (+31 more)

### Community 6 - "Navira — Offline GNSS Lab"
Cohesion: 0.05
Nodes (39): Conclusion and limits, Conditions and observations, Device test record, Map issue review (source only, 2026-10-04), Milestone 2 — Android preview APK, Milestone 3 — GitHub Actions release APK, Milestone 4 — offline saved waypoints, Milestone 5 — tabs, guidance, and UX fixes (+31 more)

### Community 7 - "render-brand.js"
Cohesion: 0.08
Nodes (24): adaptive, colorAt(), cyan, facet, favicon, foreground, fs, icon (+16 more)

### Community 8 - "scripts"
Cohesion: 0.07
Nodes (27): eslint, eslint-config-expo, devDependencies, eslint, eslint-config-expo, @types/geojson, @types/react, typescript (+19 more)

### Community 9 - "satellites.tsx"
Cohesion: 0.15
Nodes (19): messages, SatellitesScreen(), styles, GnssModuleEvents, NaviraGnssModule, initialState, useGnssStatus(), GnssEvent (+11 more)

### Community 10 - "map.tsx"
Cohesion: 0.12
Nodes (25): MapScreen(), styles, Cue, LOCAL_STYLE, SpatialMap(), SpatialMapControls, styles, useSpatialRoutes() (+17 more)

### Community 11 - "useLocationReading.ts"
Cohesion: 0.22
Nodes (13): useAppDataValue(), initialState, useLocationReading(), start(), useWaypoints(), create(), remove(), runWrite() (+5 more)

### Community 13 - "NaviraGnssModule"
Cohesion: 0.33
Nodes (3): LocationManager, Module, NaviraGnssModule

### Community 14 - "Architecture"
Cohesion: 0.18
Nodes (10): Android preview packaging, Architecture, GNSS observation clock, Milestone 5 lifecycle and guidance, Milestone 6 route recording, Milestone 7A local spatial view, Milestone 7B local basemap prototype, Native GNSS diagnostics (+2 more)

### Community 15 - "Decisions"
Cohesion: 0.25
Nodes (7): Decisions, Milestone 2 build decisions, Milestone 3 decisions, Milestone 4 decisions, Milestone 5 decisions, Milestone 6 decisions, Route-quality policy 2 decisions

### Community 16 - "Business rules"
Cohesion: 0.29
Nodes (6): Business rules, Milestone 3 GNSS behavior, Milestone 4 waypoint behavior, Milestone 5 guidance, Milestone 5 UI and GNSS freshness, Milestone 6 route recording

### Community 17 - "Location model"
Cohesion: 0.40
Nodes (4): GNSS diagnostics model, Location model, Route model, Waypoint model

### Community 18 - "tsconfig.json"
Cohesion: 0.40
Nodes (4): expo/tsconfig.base, compilerOptions, strict, extends

### Community 19 - "offlineMapRepository.ts"
Cohesion: 0.18
Nodes (21): OfflineMapPanel(), State, styles, useOfflineMaps(), pickOfflineMapPackage(), installBundledKabarakMap(), installOfflineMap(), listOfflineMaps() (+13 more)

### Community 26 - "route.ts"
Cohesion: 0.15
Nodes (16): errorMessage(), useRouteRecording(), enqueue(), run(), shareRouteGpx(), RoutePoint, RouteSample, escapeXml() (+8 more)

### Community 27 - "routeRepository.ts"
Cohesion: 0.18
Nodes (14): ROUTE_MIGRATION_2, PointRow, routeRepository, RouteRow, validDistanceStatuses, validReasons, validStatuses, PauseReason (+6 more)

### Community 28 - "routeRecording.test.ts"
Cohesion: 0.14
Nodes (12): accepted, first, gap, last, manualBreak, moved, paused, recovered (+4 more)

### Community 29 - "routeQualityPolicy.ts"
Cohesion: 0.23
Nodes (11): DistanceStatus, straightLineGuidance(), QualityDecision, QualityState, ROUTE_QUALITY_POLICY_V2, evaluateRouteSample(), MAX_PLAUSIBLE_SPEED_MPS, MIN_MOVEMENT_METERS (+3 more)

## Knowledge Gaps
- **251 isolated node(s):** `name`, `slug`, `version`, `orientation`, `icon` (+246 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `plugins` connect `expo` to `AppData.tsx`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `expo-router` connect `AppData.tsx` to `map.tsx`, `expo`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **What connects `name`, `slug`, `version` to the rest of the system?**
  _251 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `waypointValidation.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11025641025641025 - nodes in this community are weakly interconnected._
- **Should `AppData.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05864197530864197 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._
- **Should `routeQualityPolicy.test.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._