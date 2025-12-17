import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { normalizeKey, setCoverPosition } from "@/lib/coverPositions"

const COOKIE_NAME = "eonia_admin"

function clamp(value: number) {
  if (Number.isNaN(value)) return 50
  return Math.min(100, Math.max(0, value))
}

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get(COOKIE_NAME)?.value === "1"
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const { category, slug, x, y } = body as {
    category?: string
    slug?: string
    x?: number
    y?: number
  }

  if (!category || !slug || typeof x !== "number" || typeof y !== "number") {
    return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 })
  }

  const key = normalizeKey(category, slug)
  const position = { x: clamp(x), y: clamp(y) }

  setCoverPosition(key, position)

  return NextResponse.json({ ok: true, position })
}
