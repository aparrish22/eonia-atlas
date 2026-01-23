import { WorldMap } from "@/components/WorldMap"
import { getAllEntrySummaries } from "@/lib/content"
import { WORLD_MAPS, getMapById } from "@/lib/maps"
import { readWorldMapPins } from "@/lib/worldMapPins"
import { notFound } from "next/navigation"

export default async function Page({
    params,
    }: {
    params: Promise<{ mapId: string }>
    }) {
    const { mapId } = await params

    const selected = getMapById(mapId)
    if (!selected) notFound()

    const pins = readWorldMapPins()
    const entrySummaries = getAllEntrySummaries()

    return (
        <WorldMap
            maps={WORLD_MAPS}
            defaultMapId={selected.id}
            initialPins={pins}
            entrySummaries={entrySummaries}
        />
    )
}
