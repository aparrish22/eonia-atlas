/**
 * Character Origins — deterministic tag + region-bonus scoring.
 * Pure functions: no React. Picks primary + 2 alternates from scorable regions only.
 */

import {
  QUIZ_VERSION,
  SCORABLE_REGION_IDS,
  TARKIR_LINK_TAG_THRESHOLD,
  TARKIR_LINK_TAGS,
} from "./constants"
import { effectiveLoreStatus, loreHref, resolveLoreHref } from "./loreLink"
import { getOriginChoiceById, getOriginQuestions } from "./questions"
import { getRegionById, getScorableRegions } from "./regions"
import { mergeTagDeltas } from "./scoring"
import {
  ORIGINS_SCHEMA_VERSION,
  type CharacterOriginsOutcome,
  type OriginAnswerSelection,
  type RankedRegion,
  type RegionSuggestion,
  type ScorableRegionId,
  type SerializedOriginsResult,
  type TagWeights,
} from "./types"

function accumulateTagScores(selections: OriginAnswerSelection[]): TagWeights {
  let scores: TagWeights = {}
  for (const { choiceId } of selections) {
    const choice = getOriginChoiceById(choiceId)
    if (!choice) continue
    scores = mergeTagDeltas(scores, choice.tagDeltas)
  }
  return scores
}

function accumulateRegionBonuses(selections: OriginAnswerSelection[]): Partial<Record<ScorableRegionId, number>> {
  const bonuses: Partial<Record<ScorableRegionId, number>> = {}
  for (const { choiceId } of selections) {
    const choice = getOriginChoiceById(choiceId)
    if (!choice?.regionBonuses) continue
    for (const [regionId, value] of Object.entries(choice.regionBonuses)) {
      const id = regionId as ScorableRegionId
      bonuses[id] = (bonuses[id] ?? 0) + (value ?? 0)
    }
  }
  return bonuses
}

function scoreRegion(
  regionId: ScorableRegionId,
  tagScores: TagWeights,
  regionBonuses: Partial<Record<ScorableRegionId, number>>
): number {
  const region = getRegionById(regionId)
  if (!region || !region.scorable) return 0

  let total = regionBonuses[regionId] ?? 0

  for (const [tag, playerWeight] of Object.entries(tagScores)) {
    if (playerWeight <= 0) continue
    const affinity = region.tagAffinity[tag]
    if (affinity !== undefined && affinity > 0) {
      total += playerWeight * affinity
    }
  }

  return total
}

function rankRegions(
  tagScores: TagWeights,
  regionBonuses: Partial<Record<ScorableRegionId, number>>
): RankedRegion[] {
  const ranked: RankedRegion[] = SCORABLE_REGION_IDS.map((regionId) => ({
    regionId,
    score: scoreRegion(regionId, tagScores, regionBonuses),
  }))

  ranked.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.regionId.localeCompare(b.regionId)
  })

  return ranked
}

function toSuggestion(regionId: ScorableRegionId, score: number): RegionSuggestion {
  const region = getRegionById(regionId)!
  const status = effectiveLoreStatus(region)
  const href =
    status === "missing" ? null : region.loreSlug ? resolveLoreHref(region) : null

  return {
    regionId,
    displayName: region.displayName,
    score,
    fitBullets: region.fitBullets,
    loreCategory: region.loreCategory,
    loreSlug: region.loreSlug,
    loreStatus: status,
    loreHref: href,
  }
}

function shouldSuggestTarkirLink(
  primaryId: ScorableRegionId,
  tagScores: TagWeights
): boolean {
  if (primaryId !== "lucelus") return false
  let sum = 0
  for (const tag of TARKIR_LINK_TAGS) {
    sum += tagScores[tag] ?? 0
  }
  return sum >= TARKIR_LINK_TAG_THRESHOLD
}

export type ResolveOutcomeOptions = {
  /** Defaults to all questions answered in order; validates count when strict. */
  strictCount?: boolean
}

export function resolveOutcome(
  selections: OriginAnswerSelection[],
  options: ResolveOutcomeOptions = {}
): CharacterOriginsOutcome {
  const { strictCount = true } = options
  const expected = getOriginQuestions().length

  if (strictCount && selections.length !== expected) {
    throw new Error(
      `Character Origins requires ${expected} answers; received ${selections.length}.`
    )
  }

  const tagScores = accumulateTagScores(selections)
  const bonuses = accumulateRegionBonuses(selections)
  const ranked = rankRegions(tagScores, bonuses)

  const top = ranked.filter((r) => r.score > 0)
  const pool = top.length >= 3 ? top : ranked

  const primaryRank = pool[0]
  const alternateRanks = pool.slice(1, 3)

  while (alternateRanks.length < 2) {
    const fallback = ranked.find(
      (r) =>
        r.regionId !== primaryRank.regionId &&
        !alternateRanks.some((a) => a.regionId === r.regionId)
    )
    if (!fallback) break
    alternateRanks.push(fallback)
  }

  const primary = toSuggestion(primaryRank.regionId, primaryRank.score)
  const alternates = [
    toSuggestion(alternateRanks[0].regionId, alternateRanks[0].score),
    toSuggestion(alternateRanks[1].regionId, alternateRanks[1].score),
  ] as [RegionSuggestion, RegionSuggestion]

  const suggestTarkirLink = shouldSuggestTarkirLink(primary.regionId, tagScores)
  const tarkir = getRegionById("tarkir")
  const tarkirLoreHref =
    suggestTarkirLink && tarkir?.loreSlug
      ? loreHref(tarkir.loreCategory, tarkir.loreSlug)
      : null

  return {
    schemaVersion: ORIGINS_SCHEMA_VERSION,
    quizVersion: QUIZ_VERSION,
    tagScores,
    ranked: ranked as RankedRegion[],
    primary,
    alternates,
    suggestTarkirLink,
    tarkirLoreHref,
  }
}

export function serializeOriginsResult(
  selections: OriginAnswerSelection[],
  outcome: CharacterOriginsOutcome
): SerializedOriginsResult {
  return {
    schemaVersion: ORIGINS_SCHEMA_VERSION,
    quizVersion: QUIZ_VERSION,
    completedAt: new Date().toISOString(),
    selections,
    outcome,
  }
}

/** Build selections from ordered choice ids (one per question, same order as ORIGIN_QUESTIONS). */
export function selectionsFromChoiceIds(choiceIds: string[]): OriginAnswerSelection[] {
  const questions = getOriginQuestions()
  if (choiceIds.length !== questions.length) {
    throw new Error(`Expected ${questions.length} choice ids.`)
  }
  return questions.map((q, i) => ({
    questionId: q.id,
    choiceId: choiceIds[i]!,
  }))
}
