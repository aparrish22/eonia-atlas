# Architecture

## Purpose

Explain how Eonia Atlas is structured as a Next.js app: where routes live, how file-based content and JSON stores fit together, and which parts are server-only versus client-heavy. Use this when onboarding or deciding where a feature belongs.

## Where the code lives

| Area | Path |
| --- | --- |
| App Router (pages, layouts, API routes) | `src/app/` |
| Global layout, metadata, styles entry | `src/app/layout.tsx`, `src/app/globals.css` |
| Home | `src/app/page.tsx` |
| Lore (category list + entry) | `src/app/lore/[category]/page.tsx`, `src/app/lore/[category]/[slug]/page.tsx` |
| Maps gallery + per-map viewer | `src/app/maps/page.tsx`, `src/app/maps/[mapId]/page.tsx` |
| Legacy-style world map route (default map) | `src/app/world-map/page.tsx` |
| REST handlers | `src/app/api/cover-position/route.ts`, `src/app/api/world-map-pins/route.ts`, `src/app/api/admin/login/route.ts`, `src/app/api/admin/logout/route.ts`, `src/app/api/admin/status/route.ts` |
| Shared React components | `components/` (e.g. `components/FadeLayout.tsx`, `components/Navbar.jsx`, lore and map subfolders) |
| Map viewer UI | `components/map-viewer/` (`MapViewport.tsx`, `PinsOverlay.tsx`, `PinEditorPanel.tsx`, `DeletePinModal.tsx`, `NavigateModal.tsx`) |
| Content + pins + cover helpers | `lib/content.ts`, `lib/worldMapPins.ts`, `lib/coverPositions.ts`, `lib/maps.ts` |
| MDX source files | `content/<category>/*.mdx` (and `.md` where used; verify per file) |
| Writable JSON stores (pins, cover positions) | `data/world-map-pins.json`, `data/cover-positions.json` (created at runtime by `lib/` if missing) |
| Static assets (images, map PNGs) | `public/images/`, `public/maps/` |

Path alias: `@/*` resolves to `./src/*` and `./*` (see `tsconfig.json`).

## Key concepts

- **Next.js App Router:** `src/app/` defines URLs. Server Components are the default; interactive surfaces (map, motion) use Client Components (`"use client"`).
- **File-based encyclopedia:** Categories are subfolders of `content/`. `lib/content.ts` scans those folders at request/build time and parses frontmatter with `gray-matter`.
- **Lore URLs:** `/lore/<category>/<slug>` maps to `content/<category>/<slug>.mdx` (see gotchas for `.md` vs `.mdx`).
- **Mutable admin data:** Pin coordinates and optional MDX links live in `data/world-map-pins.json`. Cover image focal positions live in `data/cover-positions.json`. Writes go through API routes that check an admin cookie (`eonia_admin` in `src/app/api/` handlers).
- **Motion shell:** `components/FadeLayout.tsx` wraps page content from the root layout for route transitions.

**Planned (not implemented in code yet):** MDX-native spoiler blocks (for example `<Spoiler level="…">`) with blur/reveal and labeled levels. Until those components exist, treat spoiler UX as a design goal only.

## How to run and test (checklist)

1. Install dependencies: `npm install`
2. Dev server: `npm run dev` — open `http://localhost:3000`
3. Smoke-test lore: home → category → an entry under `/lore/...`
4. Smoke-test maps: `/maps` → a map card → `/maps/<mapId>` (IDs defined in `lib/maps.ts`)
5. Production build: `npm run build` (also catches TypeScript issues)

## Common gotchas

- **Nested `<main>` elements:** `src/app/layout.tsx` wraps `{children}` in `<main>`. Some pages (e.g. `src/app/page.tsx`, lore entry page) also render a `<main>`, which duplicates the landmark. Prefer fixing in one place when you touch layout structure.
- **Serverless filesystem writes:** Pin and cover-position APIs write under `data/`. On Vercel, local disk is ephemeral; treat Git-backed or hosted storage as the long-term source of truth for production edits (see project outline / future phases).
- **`getEntry` vs listing:** `getAllEntries()` in `lib/content.ts` includes both `.mdx` and `.md` files; `getEntry()` only resolves `content/<category>/<slug>.mdx`. A `.md`-only slug can appear in lists but return 404 on the detail route unless you align extensions.
- **Lore page dynamics:** `src/app/lore/[category]/[slug]/page.tsx` sets `export const dynamic = "force-dynamic"` so fresh reads from disk during development; understand the tradeoff for caching before changing it.
- **Admin cookie is simple gatekeeping:** Login/logout routes set a cookie checked by mutating APIs; this is not a full auth product—do not assume role-based multi-editor security without hardening.
