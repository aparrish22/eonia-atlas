# Maps

## Purpose

Document how map images are registered, how users open the gallery and viewer, how pins link to lore entries, and how admin save flows work—grounded in the current implementation.

## Where the code lives

| Concern | Path |
| --- | --- |
| Map catalog (ids, labels, image URLs) | `lib/maps.ts` |
| Map PNG assets | `public/maps/` (`world-map-current.png`, `world-map-state.png`, `world-map-height.png`, `world-map-biome.png`) |
| Gallery grid | `src/app/maps/page.tsx` |
| Viewer route (selected map by id) | `src/app/maps/[mapId]/page.tsx` |
| Alternate entry using default map | `src/app/world-map/page.tsx` |
| Client map shell (pan, zoom, pins, admin UI) | `components/WorldMap.tsx` |
| Viewport / pins / modals / editor panel | `components/map-viewer/` |
| Pin read/write + validation | `lib/worldMapPins.ts` |
| Pins HTTP API | `src/app/api/world-map-pins/route.ts` (GET public read; POST requires admin cookie) |
| Entry titles for pin linking pickers | `getAllEntrySummaries()` from `lib/content.ts` |

## Key concepts / data model

- **Map registry:** `WORLD_MAPS` in `lib/maps.ts` is the source of truth for `id`, human `label`, and `src` (public URL path). `getMapById` resolves `/maps/[mapId]`; unknown ids → 404.
- **Pins:** `WorldMapPin` in `lib/worldMapPins.ts` includes normalized `x`/`y` in **0–1** image space, `title`, optional `subtitle`/`description`, and optional `mdxCategory` + `mdxSlug` for linking to `/lore/<category>/<slug>`.
- **Persistence:** Pins are stored as JSON in `data/world-map-pins.json` (array or `{ "pins": [...] }` supported on read). `ensureStore()` creates `data/` and an empty file if missing.
- **Viewer props:** `src/app/maps/[mapId]/page.tsx` loads pins once, passes `WORLD_MAPS`, `defaultMapId`, `initialPins`, and `entrySummaries` into `WorldMap`.
- **Admin saves:** POST `/api/world-map-pins` replaces the pin list after validating JSON body `{ "pins": [...] }`. Requires admin session cookie set via `src/app/api/admin/login/route.ts` (see `components/WorldMap.tsx` for client usage).

**Planned:** Broader map types beyond the current world PNG set, or server-backed pin storage for durable production editing—only adopt when you intentionally change persistence.

## How to run and test (checklist)

1. `npm run dev`
2. Visit `/maps` and confirm all four cards render thumbnails from `public/maps/`.
3. Open `/maps/world-current` (or another id from `lib/maps.ts`).
4. Pan, zoom, select pins, and (if logged in as admin) create/move/save pins; reload to confirm read path.
5. `GET /api/world-map-pins` should return JSON without auth.
6. `npm run build` before release.

## Common gotchas

- **Image sizing math:** `WorldMap.tsx` comments note `mapWidth`/`mapHeight` props are legacy hints; live layout uses measured `imgSize` from the loaded image for camera math—keep that distinction when debugging pan/zoom.
- **Production writes:** Same as lore admin data—writes to `data/world-map-pins.json` on serverless hosts may not persist across deployments; plan external storage if editors rely on production.
- **Two routes:** `/world-map` and `/maps/<id>` both embed `WorldMap` but differ in how the default map is chosen; do not assume a single URL is the only entry point.
- **Home links to maps:** `src/app/page.tsx` contains commented-out links to `/world-map` and `/maps`; users may need direct URLs until navigation is re-enabled.
- **GET vs POST pins:** Public read is open; mutating pins always requires the admin cookie—expect `401` from POST when not logged in.
