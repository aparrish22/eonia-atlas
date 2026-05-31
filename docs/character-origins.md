# Character Origins

## Purpose

Interactive mini-game: players answer **10 questions** (3 choices each) and receive a **primary region** plus **2 alternates**, grounded in the author region registry and tag scoring—not LLM-invented lore.

## Routes

| Route | Status |
| --- | --- |
| `/character-origins` | **Live** (Sprint 2 shell: intro + start; Sprint 3 quiz UI) |

Navbar: **Character Origins** link in `components/Navbar.tsx`.

### UI modules (Sprint 2)

| Component | Path |
| --- | --- |
| Page shell | `src/app/character-origins/page.tsx` |
| Intro + phase state | `components/character-origins/CharacterOriginsShell.tsx` |
| Quiz slot (placeholder) | `components/character-origins/CharacterOriginsQuizPlaceholder.tsx` |

## Data layer (Sprint 1 — implemented)

| Module | Path |
| --- | --- |
| Types & version | `lib/character-origins/types.ts`, `constants.ts` |
| Region registry (13 regions, 12 scorable) | `lib/character-origins/regions.ts` |
| Questions (`origins-v1-10x3`) | `lib/character-origins/questions.ts` |
| Resolver | `lib/character-origins/resolver.ts` |
| Public API | `lib/character-origins/index.ts` (server-oriented) |

**Client Components:** import from leaf modules (`constants`, `questions`, `resolver`) — not the barrel — so `lib/content` / `fs` is not bundled.

### Scorable regions

All registry ids except **`tarkir`**. Lucelus may suggest an optional link to **Tarkir** (`/lore/locations/tarkir-city`) when expedition/desert tags are high enough.

### Scoring

1. Each answer adds **tag deltas** and optional **region bonuses** (e.g. question 8: Astia/Reth, Ikara, Kircia/Lucia).
2. Player tag totals are multiplied by each region’s **tagAffinity** and summed.
3. Regions are sorted by score; ties break by **region id** (ascending).
4. Top entry = primary; next two distinct = alternates.

### Versions

- `schemaVersion`: `1`
- `quizVersion`: `origins-v1-10x3`

### Example (Node / script)

```ts
import {
  resolveOutcome,
  selectionsFromChoiceIds,
} from "@/lib/character-origins"

const selections = selectionsFromChoiceIds([
  "q01-duty-a",
  "q02-intrigue-c",
  "q03-peace-c",
  "q04-trade-a",
  "q05-arcane-b",
  "q06-wilds-b",
  "q07-sea-b",
  "q08-ally-a",
  "q09-memory-b",
  "q10-faith-b",
])

const outcome = resolveOutcome(selections)
console.log(outcome.primary.displayName, outcome.alternates.map((a) => a.displayName))
```

## Lore pages

Region entries live under `content/locations/*`. Registry `loreSlug` + `loreStatus` (`missing` | `wip` | `published`) drive results UI badges (Sprint 4).

## How to test (Sprint 1)

1. `npm run build` — TypeScript must pass.
2. In a temporary script or dev REPL, call `resolveOutcome` with 10 valid choice ids (see example above).
3. Confirm `outcome.primary.regionId` is never `tarkir`.
4. Confirm Kircia-heavy choices (q02-c, q04-a, q08-c) rank `kircia` highly.

## How to test (Sprint 2)

1. `npm run dev` → open `http://localhost:3000/character-origins`
2. Navbar shows **Character Origins**; link reaches the page.
3. Intro shows “Find a region that fits your character idea.”
4. **Yes, begin** → questionnaire placeholder with `0 / 10` and **Back to intro**.
5. **Not now** → home page.
6. Resize to mobile: buttons wrap; no horizontal overflow.

## Future

- Sprint 3: client quiz UI (replace placeholder)
- Sprint 4: results panel, WIP badges, optional `localStorage`
- Accounts: persist `SerializedOriginsResult` JSON
- Spoiler filter on Lucelus campaign content in quiz copy
