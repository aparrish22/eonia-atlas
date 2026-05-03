# Search

## Purpose

Search lets readers jump from the global navbar to matching lore entries across the file-backed encyclopedia.

## Where The Code Lives

| Concern | Path |
| --- | --- |
| Navbar search form | `components/Navbar.tsx` |
| Search results route | `src/app/search/page.tsx` |
| Search scoring and snippets | `lib/search.ts` |
| Content source | `content/<category>/*.mdx` and `content/<category>/*.md` |

## Behavior

- The navbar submits a GET request to `/search?q=<term>`.
- Search runs server-side against entries returned by `getAllEntries()` in `lib/content.ts`.
- Matching checks title, excerpt, tags, category, type, region, and body content.
- Ranking favors exact/title matches first, then metadata matches, then body matches.
- Result cards link to `/lore/<category>/<slug>` and show a label, excerpt or generated snippet, and tags when present.

## How To Test

1. Run `npm run dev`.
2. Use the navbar search from `/`, a category page, and a lore entry page.
3. Search for a title, such as `Reyna`.
4. Search for a tag or metadata value, such as `magic` or `Azuria`.
5. Search for body text that does not appear in frontmatter.
6. Confirm `/search` handles an empty query and no-result query cleanly.
7. Run `npm run lint` and `npm run build` before merging.

## Gotchas

- Search is intentionally dependency-free and server-rendered for the current content volume.
- Because results use the existing content loader, `.md` files can appear in results even though `getEntry()` currently resolves detail pages only as `.mdx`.
- The query is normalized and capped before matching to keep accidental long inputs predictable.
