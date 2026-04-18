# Content (MDX + lore)

## Purpose

Describe how encyclopedia entries are authored, stored, discovered, and rendered—so you can add or edit lore without guessing how the app loads files.

## Where the code lives

| Concern | Path |
| --- | --- |
| Read and parse MDX/Markdown from disk | `lib/content.ts` |
| Lore category index | `src/app/lore/[category]/page.tsx` |
| Lore entry page (hero, nav, body) | `src/app/lore/[category]/[slug]/page.tsx` |
| MDX/markdown rendering | `components/MdxRender.tsx` |
| Hero, music, cover drag UI | `components/LoreHero.tsx`, `components/MusicPlayer.tsx` |
| Prev/next style nav | `components/LoreNav.tsx` |
| Tags UI | `components/Badge.tsx` |
| Cover position persistence | `lib/coverPositions.ts`, `src/app/api/cover-position/route.ts` |
| Example entries | `content/characters/`, `content/factions/`, `content/locations/`, `content/lore/`; author notes in `content/README.md` |

## Key concepts / data model

- **Categories:** Top-level folders under `content/` (e.g. `locations`, `characters`). `getAllCategories()` returns their directory names.
- **Slug:** Filename without extension. URLs use `/lore/<category>/<slug>`.
- **Frontmatter:** Parsed into the `Frontmatter` type in `lib/content.ts`—notably `title` (required), optional `type`, `region`, `order`, `cover`, `music`, `tags`, `excerpt`. `order` controls sort order within a category (lower first; missing defaults to `999` in sorting).
- **Body:** Everything after frontmatter is the `content` string passed into `MdxRender`.
- **Rendering behavior:** `components/MdxRender.tsx` uses `marked` to turn **string** sources into HTML for the common path. If a pre-serialized MDX object were passed, `next-mdx-remote` (`MDXRemote`) would render it instead—today’s lore pipeline passes a raw string from `gray-matter`, so treat entry bodies as Markdown-first unless you change that wiring.

**Planned:** Rich MDX shortcodes (custom React components in prose), including a **spoiler** system with levels and click-to-reveal. Not present in `MdxRender` today beyond generic Markdown HTML output.

## How to run and test (checklist)

1. Add or edit a file under `content/<category>/<slug>.mdx` with valid YAML frontmatter (`title` required).
2. Run `npm run dev`.
3. From `/`, click a category or go to `/lore/<category>` and open the entry.
4. Confirm hero image/music if set, tags strip, and body renders.
5. Run `npm run build` before merging to catch type and build errors.

## Common gotchas

- **`.md` vs `.mdx` on detail pages:** Listing includes `.md`, but `getEntry` only loads `.mdx` (see `lib/content.ts`). Prefer `.mdx` for lore pages to avoid 404s.
- **Cover paths:** `cover` and `music` in frontmatter should point at files under `public/` (e.g. `/images/...`, `/music/...`).
- **Cover position API:** Adjusting hero focal point in admin persists to `data/cover-positions.json`; same serverless persistence caveats as map pins apply on Vercel.
- **Markdown vs MDX components:** Authors may expect JSX in MDX; with the current string + `marked` path, JSX-like syntax will not run as React—coordinate with code changes if you need components in-body.
- **Tag pages:** `src/app/lore/[category]/[slug]/page.tsx` notes tags in UI; dedicated tag routes are not implemented (comments in file).
