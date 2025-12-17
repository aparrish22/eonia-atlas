import fs from "fs"
import path from "path"

export type CoverPosition = {
  x: number
  y: number
}

type PositionMap = Record<string, CoverPosition>

const DATA_DIR = path.join(process.cwd(), "data")
const POSITIONS_FILE = path.join(DATA_DIR, "cover-positions.json")

function clamp(value: number) {
  if (Number.isNaN(value)) return 50
  return Math.min(100, Math.max(0, value))
}

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }

  if (!fs.existsSync(POSITIONS_FILE)) {
    fs.writeFileSync(POSITIONS_FILE, "{}", "utf8")
  }
}

function readStore(): PositionMap {
  try {
    ensureStore()
    const raw = fs.readFileSync(POSITIONS_FILE, "utf8")
    return raw ? (JSON.parse(raw) as PositionMap) : {}
  } catch (error) {
    console.error("Failed to read cover position store", error)
    return {}
  }
}

function writeStore(data: PositionMap) {
  ensureStore()
  fs.writeFileSync(POSITIONS_FILE, JSON.stringify(data, null, 2), "utf8")
}

export function normalizeKey(category: string, slug: string) {
  const safeCategory = category.replace(/[^a-z0-9/_-]/gi, "").slice(0, 120)
  const safeSlug = slug.replace(/[^a-z0-9/_-]/gi, "").slice(0, 120)
  return `${safeCategory}/${safeSlug}`
}

export function getCoverPosition(key: string): CoverPosition | null {
  const store = readStore()
  return store[key] ?? null
}

export function setCoverPosition(key: string, position: CoverPosition) {
  const store = readStore()
  store[key] = { x: clamp(position.x), y: clamp(position.y) }
  writeStore(store)
}
