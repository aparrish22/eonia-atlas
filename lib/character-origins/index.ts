/**
 * Character Origins — public API for registry, quiz data, and scoring.
 */

export {
  ORIGINS_SCHEMA_VERSION,
  type CharacterOriginsOutcome,
  type ChoiceLetter,
  type LoreCategory,
  type LoreStatus,
  type OriginAnswerSelection,
  type OriginChoice,
  type OriginQuestion,
  type RankedRegion,
  type RegionBonuses,
  type RegionDefinition,
  type RegionId,
  type RegionSuggestion,
  type ScorableRegionId,
  type SerializedOriginsResult,
  type TagWeights,
} from "./types"

export {
  QUIZ_VERSION,
  SCORABLE_REGION_IDS,
  TARKIR_LINK_TAG_THRESHOLD,
  TARKIR_LINK_TAGS,
  TARKIR_REGION_ID,
} from "./constants"

export {
  REGION_REGISTRY,
  getRegionById,
  getScorableRegions,
  isScorableRegionId,
} from "./regions"

export {
  ORIGIN_QUESTIONS,
  getExpectedQuestionCount,
  getOriginChoiceById,
  getOriginQuestionById,
  getOriginQuestions,
} from "./questions"

export {
  effectiveLoreStatus,
  loreEntryExists,
  loreHref,
  resolveLoreHref,
} from "./loreLink"

export {
  affinityFromTags,
  mergeTagDeltas,
  regionBonuses,
  tagDeltas,
} from "./scoring"

export {
  resolveOutcome,
  selectionsFromChoiceIds,
  serializeOriginsResult,
  type ResolveOutcomeOptions,
} from "./resolver"
