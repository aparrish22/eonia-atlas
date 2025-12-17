import fs from "fs"
import path from "path"

export type WorldMapPin = {
  id: string
  x: number // normalized 0..1
  y: number // normalized 0..1
  title: string
  subtitle?: string
  description?: string
  mdxCategory?: string
  mdxSlug?: string
}

type StoreShape = {
  pins: WorldMapPin[]
}

const DATA_DIR = path.join(process.cwd(), "data")
const PINS_FILE = path.join(DATA_DIR, "world-map-pins.json")

function clamp01(value: number) {
  if (Number.isNaN(value)) return 0.5
  return Math.min(1, Math.max(0, value))
}

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }

  if (!fs.existsSync(PINS_FILE)) {
    const initial: StoreShape = { pins: [] }
    fs.writeFileSync(PINS_FILE, JSON.stringify(initial, null, 2), "utf8")
  }
}

function normalizePin(pin: WorldMapPin): WorldMapPin {
  return {
    ...pin,
    x: clamp01(pin.x),
    y: clamp01(pin.y),
    title: (pin.title ?? "").trim() || "Untitled",
    subtitle: pin.subtitle?.trim() || undefined,
    description: pin.description?.trim() || undefined,
    mdxCategory: pin.mdxCategory?.trim() || undefined,
    mdxSlug: pin.mdxSlug?.trim() || undefined,
  }
}

export function readWorldMapPins(): WorldMapPin[] {
  try {
    ensureStore()
    const raw = fs.readFileSync(PINS_FILE, "utf8")
    const parsed = (raw ? JSON.parse(raw) : {}) as Partial<StoreShape> | WorldMapPin[]
    const pins = Array.isArray(parsed) ? parsed : parsed.pins
    if (!Array.isArray(pins)) return []
    return pins
      .filter((p): p is WorldMapPin => Boolean(p && typeof p === "object"))
      .map((p) => normalizePin(p as WorldMapPin))
  } catch (error) {
    console.error("Failed to read world map pins store", error)
    return []
  }
}

export function writeWorldMapPins(pins: WorldMapPin[]) {
  ensureStore()
  const data: StoreShape = { pins: pins.map(normalizePin) }
  fs.writeFileSync(PINS_FILE, JSON.stringify(data, null, 2), "utf8")
}

export function validatePins(input: unknown): WorldMapPin[] | null {
  if (!Array.isArray(input)) return null
  const pins: WorldMapPin[] = []

  for (const item of input) {
    if (!item || typeof item !== "object") return null
    const pin = item as Partial<WorldMapPin>

    if (typeof pin.id !== "string" || !pin.id.trim()) return null
    if (typeof pin.x !== "number" || typeof pin.y !== "number") return null
    if (typeof pin.title !== "string") return null

    pins.push(
      normalizePin({
        id: pin.id.trim(),
        x: pin.x,
        y: pin.y,
        title: pin.title,
        subtitle: typeof pin.subtitle === "string" ? pin.subtitle : undefined,
        description: typeof pin.description === "string" ? pin.description : undefined,
        mdxCategory: typeof pin.mdxCategory === "string" ? pin.mdxCategory : undefined,
        mdxSlug: typeof pin.mdxSlug === "string" ? pin.mdxSlug : undefined,
      }),
    )
  }

  return pins
}

