import { WorldMap } from "@/components/WorldMap"
import { getAllEntrySummaries } from "@/lib/content"
import { readWorldMapPins } from "@/lib/worldMapPins"

export const dynamic = "force-dynamic"

export default function WorldMapPage() {
  const pins = readWorldMapPins()
  const entrySummaries = getAllEntrySummaries()

  return (
    <WorldMap
      mapSrc="/images/world-map.svg"
      initialPins={pins}
      entrySummaries={entrySummaries}
    />
  )
}

