

// private constant variable for map file paths
const FILE_MAPS = {
    current: "/maps/world-map-current.png",
    state: "/maps/world-map-state.png",
    height: "/maps/world-map-height.png",
    biome: "/maps/world-map-biome.png",
} as const

// also private constant array for map info
// in case we want to add more maps later
const MAPS = [
    { id:'world-current', label: "Current Map", src: FILE_MAPS.current },
    { id:'world-state', label: "State Map", src: FILE_MAPS.state },
    { id:'world-height', label: "Height Map", src: FILE_MAPS.height },
    { id:'world-biome', label: "Biome Map", src: FILE_MAPS.biome },
] as const

// maps made public
export const WORLD_MAPS = MAPS

// for explicit map exports for easier imports
export const DEFAULT_MAP = MAPS[0];
export const STATE_MAP = MAPS[1];
export const HEIGHT_MAP = MAPS[2];
export const BIOME_MAP = MAPS[3];

// helper function get map info by id
/**
 * @param id - The ID of the map to retrieve.
 * @returns The MapInfo object with the specified ID, or null if not found.
 * 
 * example:
 * import { getMapById } from 'lib/maps';
 * 
 * const mapInfo = getMapById('world-height');
 * 
 */
export function getMapById(id: string): MapInfo | null {
    return MAPS.find((map) => map.id === id) ?? null
}


// Type representing a map info object
/**
 * example:
 * import type { MapInfo } from 'lib/maps';
 * 
 * type Props = { map: MapInfo };
 * 
 * another example:
 * const [activeMap, setActiveMap] = useState<MapInfo>(DEFAULT_MAP);
 */
export type MapInfo = (typeof MAPS)[number]

