/**
 * Character Origins — region registry (author canon, lore slugs, tag affinities).
 * Source of truth for outcomes until MDX frontmatter sync is automated.
 */

import { affinityFromTags } from "./scoring"
import type { RegionDefinition, RegionId, ScorableRegionId } from "./types"

function region(
  def: Omit<RegionDefinition, "tagAffinity"> & { tagAffinity?: RegionDefinition["tagAffinity"] }
): RegionDefinition {
  const tagAffinity = def.tagAffinity ?? affinityFromTags(def.tags)
  return { ...def, tagAffinity }
}

export const REGION_REGISTRY: readonly RegionDefinition[] = [
  region({
    id: "astia",
    displayName: "Astia",
    tags: ["martial", "honor", "frontier", "disciplined", "nationalism"],
    loreCategory: "locations",
    loreSlug: "astia-realm",
    loreStatus: "wip",
    scorable: true,
    fitBullets: [
      "Strong martial culture with clear duty traditions.",
      "Good for characters who value courage, chivalry, and nationalism.",
      "Border tensions make heroic backstories easy.",
    ],
    mapNote: "Central-west; Peluc Peaks; west of Lucelus Desert.",
  }),
  region({
    id: "blythgon-vale",
    displayName: "Blythgon Vale",
    tags: ["valley", "peaceful", "lake", "nature-arts"],
    loreCategory: "locations",
    loreSlug: "blythgon-region",
    loreStatus: "wip",
    scorable: true,
    fitBullets: [
      "Mostly druids and clerics; many communities favor pacifism.",
      "Hosted the peace summit (~1200 PT) between Lucia and Kircia.",
      "A sheltered valley rich in forest, lakes, and waterfalls between two great realms.",
    ],
    tagAffinity: affinityFromTags(["valley", "peaceful", "lake", "nature-arts"], { peaceful: 3 }),
    mapNote: "Between Lucia and Kircia; mountain-ringed.",
  }),
  region({
    id: "duris",
    displayName: "Duris",
    tags: ["dwarven", "artificers", "engineers", "miners", "isolationist"],
    loreCategory: "locations",
    loreSlug: "duris-realm",
    loreStatus: "wip",
    scorable: true,
    fitBullets: [
      "Home to the Drarven heirs of old dwarves — stout, hairy, and craft-proud.",
      "The King of the Duris Bloodline rules from Tyr Myhallis; the Kunrock kin stand apart.",
      "Soldiers of the Wall enforce isolation; winters dominate the calendar.",
    ],
    mapNote: "Far northwest; mountains and snow plains.",
  }),
  region({
    id: "edezia",
    displayName: "Edezia",
    tags: ["ruins", "monsters", "ancient", "survivors"],
    loreCategory: "locations",
    loreSlug: "edezia-realm",
    loreStatus: "wip",
    scorable: true,
    fitBullets: [
      "A realm that has persisted across the ages.",
      "Home to the most skilled monster hunters of Glaudire.",
      "Holds back horrors that would spill into softer lands beyond.",
    ],
    tagAffinity: affinityFromTags(["ruins", "monsters", "ancient", "survivors"], { monsters: 3 }),
    mapNote: "Far northeast; north of Lucia, east of Suiren Vale.",
  }),
  region({
    id: "eldora",
    displayName: "Eldora",
    tags: ["immortals", "world-tree", "defenders", "arcane"],
    loreCategory: "locations",
    loreSlug: "eldora-realm",
    loreStatus: "wip",
    scorable: true,
    fitBullets: [
      "Home to the Great World Tree and the long-lived Eldorans.",
      "Those who live past five centuries often dedicate themselves as guardians of the tree.",
      "A small island realm in the Kipuan Sea, far from the mainland.",
    ],
    mapNote: "Small continent in the Kipuan Sea, southeast of Glaudire.",
  }),
  region({
    id: "ikara",
    displayName: "Ikara",
    tags: ["survivors", "friendly", "hunters-gatherers", "frontier"],
    loreCategory: "locations",
    loreSlug: "ikara-realm",
    loreStatus: "wip",
    scorable: true,
    fitBullets: [
      "Ongoing territorial pressure against Astia and the Dreaded Wastes between them.",
      "A diverse people who welcome immigrants from across the Western Realm.",
      "Survival and border life shape everyday identity.",
    ],
    mapNote: "Northwest of Lucelus; north of Astia, past Peluc Peaks.",
  }),
  region({
    id: "kipuan-islands",
    displayName: "Kipuan Islands",
    tags: ["pirates", "overseas", "ships", "naval"],
    loreCategory: "locations",
    loreSlug: "kipuan-islands",
    loreStatus: "wip",
    scorable: true,
    fitBullets: [
      "Pirates and sea-farers haunt the archipelago southwest of Glaudire.",
      "Hidden jungles and coves still yield plunder and rumor.",
      "Life turns on tide, charter, and nerve.",
    ],
    mapNote: "Islands southwest of Glaudire at sea.",
  }),
  region({
    id: "kircia",
    displayName: "Kircia",
    tags: ["republic", "magitech", "gilded", "pre-renaissance"],
    loreCategory: "locations",
    loreSlug: "kircia-realm",
    loreStatus: "published",
    scorable: true,
    fitBullets: [
      "A republic of trade, magitech, and gilded politics anchored on the Cloudless Coast.",
      "Roanthur and Azuria shape law as much as any elected seat.",
      "Joint watches at Dislow bind Kircia to the desert frontier — and to Lucian allies.",
    ],
    mapNote: "Southeast; Dislow Heights to Glaudire's southeastern reach.",
  }),
  region({
    id: "lucia",
    displayName: "Lucia",
    tags: ["autocratic", "magocratic", "ascendancy", "factionalized"],
    loreCategory: "locations",
    loreSlug: "lucia-realm",
    loreStatus: "wip",
    scorable: true,
    fitBullets: [
      "High Houses on the cusp of declaring Sovereign status — intrigue is currency.",
      "House wars and rivalries make natural backstory fuel.",
      "Elite Lucian units share Dislow Garrison with Kircian forces.",
    ],
    mapNote: "Central-east; Dislow Heights to the Kipua Sea; north of Blythgon Vale.",
  }),
  region({
    id: "lucelus",
    displayName: "Lucelus Desert",
    tags: ["ruins", "desert", "capital"],
    loreCategory: "locations",
    loreSlug: "lucelus-desert",
    loreStatus: "wip",
    scorable: true,
    fitBullets: [
      "The vast central desert — Bal'moral and Zal'fari draw scholars and fortune-hunters.",
      "Tarpona, Sarkir, and bandit roads knit trade to risk.",
      "Many desert-born characters pass through the Free City of Tarkir at the oasis heart.",
    ],
    supplementalLoreSlug: "tarkir-city",
    supplementalLoreLabel: "The Free City of Tarkir",
    tagAffinity: affinityFromTags(["ruins", "desert", "capital"], { desert: 3, ruins: 2 }),
    mapNote: "Central Glaudire; Peluc west, Dislow east.",
  }),
  region({
    id: "reth",
    displayName: "Reth",
    tags: ["kingdom", "brink-of-civil-war", "rebellion", "secessionist"],
    loreCategory: "locations",
    loreSlug: "reth-realm",
    loreStatus: "wip",
    scorable: true,
    fitBullets: [
      "A southwestern kingdom fractured by assassination and a missing heir.",
      "Divided ideologies, rebellion, and secessionist provinces.",
      "Long alliance with Astia — though internal collapse strains every bond.",
    ],
    mapNote: "Southwest peninsula; south of Peluc Peaks and Lucelus.",
  }),
  region({
    id: "suiren-vale",
    displayName: "Suiren Vale",
    tags: ["valley", "sanctuary", "peaceful", "aisarai"],
    loreCategory: "locations",
    loreSlug: "suiren-vale",
    loreStatus: "wip",
    scorable: true,
    fitBullets: [
      "Home to the Aisarai and practitioners of Aicem Rings.",
      "Harmony Sanctuary and its monks anchor spiritual life.",
      "Communities favor animals, land, and deliberate peace.",
    ],
    mapNote: "Northern border of Lucia; Aicem Peaks east toward Edezia.",
  }),
  region({
    id: "tarkir",
    displayName: "Tarkir",
    tags: ["city", "capital", "desert"],
    loreCategory: "locations",
    loreSlug: "tarkir-city",
    loreStatus: "wip",
    scorable: false,
    fitBullets: [
      "The Free City at the oasis heart of Lucelus — expeditions to the great ruins begin here.",
    ],
    mapNote: "Center of Lucelus Desert; not a realm outcome.",
  }),
] as const

const byId = new Map<RegionId, RegionDefinition>(
  REGION_REGISTRY.map((r) => [r.id, r])
)

export function getRegionById(id: RegionId): RegionDefinition | undefined {
  return byId.get(id)
}

export function getScorableRegions(): RegionDefinition[] {
  return REGION_REGISTRY.filter((r): r is RegionDefinition & { id: ScorableRegionId } => r.scorable)
}

export function isScorableRegionId(id: RegionId): id is ScorableRegionId {
  return id !== "tarkir"
}
