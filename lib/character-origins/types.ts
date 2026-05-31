/**
 * Character Origins — shared types for the region-matching quiz.
 * Pure data + resolver; UI lives under components/character-origins and src/app/character-origins.
 */

export const ORIGINS_SCHEMA_VERSION = 1 as const

export type OriginsSchemaVersion = typeof ORIGINS_SCHEMA_VERSION

/** Stable registry id (kebab-case). Used in outcomes and saves. */
export type RegionId =
  | "astia"
  | "blythgon-vale"
  | "duris"
  | "edezia"
  | "eldora"
  | "ikara"
  | "kipuan-islands"
  | "kircia"
  | "lucia"
  | "lucelus"
  | "reth"
  | "suiren-vale"
  | "tarkir"

export type ScorableRegionId = Exclude<RegionId, "tarkir">

export type LoreStatus = "missing" | "wip" | "published"

export type LoreCategory = "locations" | "characters" | "factions" | "lore"

export type ChoiceLetter = "a" | "b" | "c"

export type TagWeights = Record<string, number>

export type RegionBonuses = Partial<Record<ScorableRegionId, number>>

export type RegionDefinition = {
  id: RegionId
  displayName: string
  /** Tags from author region cards; used for affinity scoring. */
  tags: readonly string[]
  /** Per-tag multiplier when player accumulates that tag (default 2 if tag in `tags`). */
  tagAffinity: TagWeights
  loreCategory: LoreCategory
  loreSlug: string | null
  loreStatus: LoreStatus
  /** Player-safe fit lines for results UI (from author cards / MDX). */
  fitBullets: readonly string[]
  /** Optional map note for future deep-link. */
  mapNote?: string
  /** If true, excluded from primary/alternate region outcomes (e.g. Tarkir city). */
  scorable: boolean
  /** Optional lore link when primary is another region (Tarkir under Lucelus). */
  supplementalLoreSlug?: string
  supplementalLoreLabel?: string
}

export type OriginChoice = {
  id: string
  letter: ChoiceLetter
  label: string
  shortLabel: string
  tagDeltas: TagWeights
  regionBonuses?: RegionBonuses
}

export type OriginQuestion = {
  id: string
  order: number
  prompt: string
  choices: readonly [OriginChoice, OriginChoice, OriginChoice]
}

export type OriginAnswerSelection = {
  questionId: string
  choiceId: string
}

export type RankedRegion = {
  regionId: ScorableRegionId
  score: number
}

export type RegionSuggestion = {
  regionId: ScorableRegionId
  displayName: string
  score: number
  fitBullets: readonly string[]
  loreCategory: LoreCategory
  loreSlug: string | null
  loreStatus: LoreStatus
  loreHref: string | null
}

export type CharacterOriginsOutcome = {
  schemaVersion: OriginsSchemaVersion
  quizVersion: string
  tagScores: TagWeights
  ranked: RankedRegion[]
  primary: RegionSuggestion
  alternates: [RegionSuggestion, RegionSuggestion]
  /** When primary is Lucelus and desert/expedition tags are strong. */
  suggestTarkirLink: boolean
  tarkirLoreHref: string | null
}

export type SerializedOriginsResult = {
  schemaVersion: OriginsSchemaVersion
  quizVersion: string
  completedAt: string
  selections: OriginAnswerSelection[]
  outcome: CharacterOriginsOutcome
}
