/**
 * Character Origins — lore URL helpers aligned with App Router `/lore/[category]/[slug]`.
 * Client-safe: no static import of lib/content (fs). Use loreEntryExists only on server.
 */

import type { LoreCategory, LoreStatus, RegionDefinition } from "./types"

export function loreHref(category: LoreCategory, slug: string): string {
  return `/lore/${category}/${slug}`
}

export function resolveLoreHref(region: RegionDefinition): string | null {
  if (!region.loreSlug) return null
  return loreHref(region.loreCategory, region.loreSlug)
}

/** Server/build-time check: slug set but MDX file missing. Do not call from Client Components. */
export async function loreEntryExists(region: RegionDefinition): Promise<boolean> {
  if (!region.loreSlug) return false
  const { getEntry } = await import("@/lib/content")
  return getEntry(region.loreCategory, region.loreSlug) !== null
}

/** Registry-driven status for quiz results (client-safe). Sync registry when MDX ships. */
export function effectiveLoreStatus(region: RegionDefinition): LoreStatus {
  if (!region.loreSlug) return "missing"
  return region.loreStatus
}
