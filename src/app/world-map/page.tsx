import { WorldMap } from "@/components/WorldMap"
import { getAllEntrySummaries } from "@/lib/content"
import { readWorldMapPins } from "@/lib/worldMapPins"
import { WORLD_MAPS, DEFAULT_MAP } from "@/lib/maps"

export const dynamic = "force-dynamic"

export default function WorldMapPage() {
  const pins = readWorldMapPins()
  const entrySummaries = getAllEntrySummaries()

  return (
    <WorldMap
      maps={WORLD_MAPS}
      defaultMapId={DEFAULT_MAP.id}
      initialPins={pins}
      entrySummaries={entrySummaries}
    />
  )
}

