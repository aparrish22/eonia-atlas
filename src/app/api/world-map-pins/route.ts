import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { readWorldMapPins, validatePins, writeWorldMapPins } from "@/lib/worldMapPins"

const COOKIE_NAME = "eonia_admin"

export async function GET() {
  const pins = readWorldMapPins()
  return NextResponse.json({ pins })
}

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get(COOKIE_NAME)?.value === "1"
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const pins = validatePins(body?.pins)
  if (!pins) {
    return NextResponse.json({ error: "Invalid pins payload" }, { status: 400 })
  }

  writeWorldMapPins(pins)
  return NextResponse.json({ ok: true, pins })
}

