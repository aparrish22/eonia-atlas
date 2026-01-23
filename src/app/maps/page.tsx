// Goal: page that lists your maps 
// with a clean grid/list of all maps (thumbnail + name). 
// Clicking a map opens the viewer with that map selected.

// new route: src/app/maps/[mapId]/page.tsx
// clicking a card navigates to /maps/[mapId]

// minimum deliverables:
// /maps shows a grid
// each card shows: image preview (use map.src as thumbnail),
// and map.label
// click opens that map 

import { WORLD_MAPS } from "@/lib/maps"
import Link from "next/link"
import Image from "next/image"

export default function MapsPage() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            { /* // render each map as a card */ }
            {WORLD_MAPS.map((map) => (
                <Link key={map.id} href={`/maps/${map.id}`} className="block border rounded-lg overflow-hidden hover:shadow-lg">
                    <Image src={map.src} alt={map.label} width={300} height={200} className="object-cover w-full h-48" />
                    <div className="p-2 text-center font-semibold">{map.label}</div>
                </Link>
            ))}
        </div>
    )
}