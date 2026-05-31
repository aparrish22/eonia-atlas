/**
 * Character Origins — version ids and scorable region allowlist.
 */

import type { RegionId, ScorableRegionId } from "./types"

export const QUIZ_VERSION = "origins-v1-10x3"

/** Regions that may appear as primary or alternate outcomes. */
export const SCORABLE_REGION_IDS: readonly ScorableRegionId[] = [
  "astia",
  "blythgon-vale",
  "duris",
  "edezia",
  "eldora",
  "ikara",
  "kipuan-islands",
  "kircia",
  "lucia",
  "lucelus",
  "reth",
  "suiren-vale",
] as const

export const TARKIR_REGION_ID = "tarkir" as const satisfies RegionId

/** Minimum accumulated desert|ruins|capital tag score to show optional Tarkir link when primary is Lucelus. */
export const TARKIR_LINK_TAG_THRESHOLD = 4

export const TARKIR_LINK_TAGS = ["desert", "ruins", "capital"] as const
