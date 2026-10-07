# Graph Report - navira  (2026-10-07)

## Corpus Check
- 82 files · ~32,752 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 563 nodes · 1029 edges · 26 communities (20 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d9a1c795`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- routeRepository.ts
- LocationScreen.tsx
- AppData.tsx
- dependencies
- routeQualityPolicy.test.ts
- expo
- Navira — Offline GNSS Lab
- render-brand.js
- scripts
- satellites.tsx
- map.tsx
- LocationStatus.tsx
- RouteRepository
- NaviraGnssModule
- Architecture
- Decisions
- Business rules
- Location model
- tsconfig.json
- useWaypoints
- eslint.config.js
- AGENTS.md
- withNaviraReleaseSigning.js
- UI conventions
- maps/README.md

## God Nodes (most connected - your core abstractions)
1. `useAppData()` - 25 edges
2. `formatMeasurement()` - 20 edges
3. `RoutePoint` - 17 edges
4. `RecordedRoute` - 16 edges
5. `RouteRepository` - 14 edges
6. `expo` - 13 edges
7. `expo-router` - 13 edges
8. `SQLiteRouteRepository` - 13 edges
9. `db()` - 12 edges
10. `straightLineGuidance()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `SatellitesScreen()` --calls--> `useAppData()`  [EXTRACTED]
  app/(tabs)/satellites.tsx → src/hooks/AppData.tsx
- `WaypointsScreen()` --calls--> `straightLineGuidance()`  [EXTRACTED]
  app/(tabs)/waypoints.tsx → src/utils/guidance.ts
- `GuidanceScreen()` --calls--> `straightLineGuidance()`  [EXTRACTED]
  app/guidance.tsx → src/utils/guidance.ts
- `MapScreen()` --calls--> `useAppData()`  [EXTRACTED]
  app/map.tsx → src/hooks/AppData.tsx
- `MapScreen()` --calls--> `formatMeasurement()`  [EXTRACTED]
  app/map.tsx → src/utils/locationDisplay.ts

## Import Cycles
- None detected.

## Communities (26 total, 6 thin omitted)

### Community 0 - "routeRepository.ts"
Cohesion: 0.07
Nodes (40): errorMessage(), useRouteRecording(), enqueue(), run(), shareRouteGpx(), ROUTE_MIGRATION_2, db(), finite() (+32 more)

### Community 1 - "LocationScreen.tsx"
Cohesion: 0.23
Nodes (9): InfoButton(), styles, Reading(), styles, formatTime(), LocationScreen(), styles, formatSpeed() (+1 more)

### Community 2 - "AppData.tsx"
Cohesion: 0.06
Nodes (58): GuidanceScreen(), styles, formatElapsed(), RecordingScreen(), styles, RouteDetailsScreen(), styles, RoutesScreen() (+50 more)

### Community 3 - "dependencies"
Cohesion: 0.05
Nodes (43): expo, expo-constants, expo-crypto, expo-document-picker, expo-file-system, expo-linking, expo-location, expo-router (+35 more)

### Community 4 - "routeQualityPolicy.test.ts"
Cohesion: 0.06
Nodes (38): DistanceStatus, RouteSample, radians(), straightLineGuidance(), evaluateQualitySample(), QualityDecision, QualityState, ROUTE_QUALITY_POLICY_V2 (+30 more)

### Community 5 - "expo"
Cohesion: 0.05
Nodes (39): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, blockedPermissions, package, permissions (+31 more)

### Community 6 - "Navira — Offline GNSS Lab"
Cohesion: 0.05
Nodes (38): Conclusion and limits, Conditions and observations, Device test record, Map issue review (source only, 2026-10-04), Milestone 2 — Android preview APK, Milestone 3 — GitHub Actions release APK, Milestone 4 — offline saved waypoints, Milestone 5 — tabs, guidance, and UX fixes (+30 more)

### Community 7 - "render-brand.js"
Cohesion: 0.08
Nodes (24): adaptive, colorAt(), cyan, facet, favicon, foreground, fs, icon (+16 more)

### Community 8 - "scripts"
Cohesion: 0.07
Nodes (26): eslint, eslint-config-expo, devDependencies, eslint, eslint-config-expo, @types/geojson, @types/react, typescript (+18 more)

### Community 9 - "satellites.tsx"
Cohesion: 0.15
Nodes (19): messages, SatellitesScreen(), styles, GnssModuleEvents, NaviraGnssModule, initialState, useGnssStatus(), GnssEvent (+11 more)

### Community 10 - "map.tsx"
Cohesion: 0.09
Nodes (38): MapScreen(), styles, Cue, LOCAL_STYLE, SpatialMap(), SpatialMapControls, styles, useSpatialRoutes() (+30 more)

### Community 11 - "LocationStatus.tsx"
Cohesion: 0.17
Nodes (13): LocationStatus(), messages, styles, initialState, useLocationReading(), start(), areLocationServicesEnabled(), requestForegroundAccess() (+5 more)

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

### Community 19 - "useWaypoints"
Cohesion: 0.70
Nodes (5): useWaypoints(), create(), remove(), runWrite(), update()

## Knowledge Gaps
- **245 isolated node(s):** `name`, `slug`, `version`, `orientation`, `icon` (+240 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `plugins` connect `expo` to `AppData.tsx`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **Why does `expo-router` connect `AppData.tsx` to `map.tsx`, `expo`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **What connects `name`, `slug`, `version` to the rest of the system?**
  _245 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `routeRepository.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07481005260081823 - nodes in this community are weakly interconnected._
- **Should `AppData.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05742393045069778 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._
- **Should `routeQualityPolicy.test.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06423034330011074 - nodes in this community are weakly interconnected._