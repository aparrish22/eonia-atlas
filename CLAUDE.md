# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:3000
npm run build     # Production build (also type-checks)
npm run lint      # Run ESLint
npm run start     # Run the production build locally
```

There is no test suite. Use `npm run build` to catch TypeScript errors.

## Tech Stack (non-negotiables)

Next.js App Router · TypeScript (strict) · Tailwind CSS 4 · Framer Motion · MDX + gray-matter frontmatter · Vercel deployment

Do not use: Pages Router, CSS-in-JS, unvetted auth/CMS libraries.

## Architecture

**Eonia Atlas** is a cinematic lore encyclopedia for a fantasy world. The architecture is file-first:

- **Encyclopedia content** lives as MDX files in `content/<category>/` with YAML frontmatter (title, cover, music, tags, order, etc.). Parsed by `lib/content.ts` using `gray-matter`; body rendered via `components/MdxRender.tsx` using `marked` (not MDX component rendering — MDX files are treated as Markdown strings).
- **Map pins and cover positions** are stored as JSON in `data/` (world-map-pins.json, cover-positions.json). Admin writes these at runtime via POST API routes — these are ephemeral on Vercel's serverless filesystem (a known limitation; Phase 2 plans a hosted database).
- **Admin access** is cookie-gated (`eonia_admin` cookie). Password checked against `ADMIN_PASSWORD` env var. No session library.

**Routing:**
- `/lore/<category>/<slug>` — lore entry detail (Server Component)
- `/maps/<mapId>` — interactive map viewer (Client Component via `WorldMap.tsx`)
- `/api/world-map-pins` — GET (public) / POST (admin-only)
- `/api/cover-position` — GET/POST for hero image focal points
- `/api/admin/login|logout|status` — auth endpoints

**Component conventions:**
- Default to Server Components. Use `"use client"` only for interactivity.
- `components/WorldMap.tsx` (~900 lines) is the main map Client Component — it owns all map state (pins, camera, admin mode, save state).
- `components/FadeLayout.tsx` and `components/ScrollReveal.tsx` handle Framer Motion transitions.
- Path alias: `@/*` → `src/*`

**Content categories** (subdirs under `content/`): `characters`, `events`, `factions`, `locations`, `lore`

## Documentation

Detailed docs live in `docs/`:
- `docs/architecture.md` — route map, data flow, known gotchas (nested `<main>` issue, serverless write limitations, `.md` vs `.mdx` distinction)
- `docs/content.md` — MDX pipeline, full frontmatter schema, rendering details
- `docs/maps.md` — map registry (`lib/maps.ts`), pin storage, admin save flows, image coordinate math

Outstanding work is tracked in `TODOs.md` (base map rendering, pin clustering, search, spoiler system, responsive design).

## Key Constraints

- MDX files are parsed as Markdown strings via `marked`, not as React component trees. Do not add MDX component imports expecting them to render.
- Map pin coordinates are normalized (0..1) in image space — not pixel values.
- The `content/README.md` has author guidelines for adding new lore entries.
