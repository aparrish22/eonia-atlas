/**
 * Character Origins — helpers to build tag/region weights for question choices.
 */

import type { RegionBonuses, TagWeights } from "./types"

export function tagDeltas(weights: TagWeights): TagWeights {
  return { ...weights }
}

export function mergeTagDeltas(...parts: TagWeights[]): TagWeights {
  const out: TagWeights = {}
  for (const part of parts) {
    for (const [tag, value] of Object.entries(part)) {
      out[tag] = (out[tag] ?? 0) + value
    }
  }
  return out
}

export function regionBonuses(bonuses: RegionBonuses): RegionBonuses {
  return { ...bonuses }
}

/** Default affinity: listed region tags score at 2, optional extras at 1. */
export function affinityFromTags(
  tags: readonly string[],
  extra: TagWeights = {}
): TagWeights {
  const affinity: TagWeights = { ...extra }
  for (const tag of tags) {
    affinity[tag] ??= 2
  }
  return affinity
}
