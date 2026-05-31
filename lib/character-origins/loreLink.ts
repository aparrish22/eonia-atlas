/**
 * Character Origins — lore URL helpers aligned with App Router `/lore/[category]/[slug]`.
 */

import { getEntry } from "@/lib/content"
import type { LoreCategory, LoreStatus, RegionDefinition } from "./types"

export function loreHref(category: LoreCategory, slug: string): string {
  return `/lore/${category}/${slug}`
}

export function resolveLoreHref(region: RegionDefinition): string | null {
  if (!region.loreSlug) return null
  return loreHref(region.loreCategory, region.loreSlug)
}

/** Server/build-time check: slug set but MDX file missing. Do not call from Client Components. */
export function loreEntryExists(region: RegionDefinition): boolean {
  if (!region.loreSlug) return false
  return getEntry(region.loreCategory, region.loreSlug) !== null
}

/** Registry-driven status for quiz results (client-safe). Sync registry when MDX ships. */
export function effectiveLoreStatus(region: RegionDefinition): LoreStatus {
  if (!region.loreSlug) return "missing"
  return region.loreStatus
}
