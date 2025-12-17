import { cookies } from "next/headers"
import { NextResponse } from "next/server"

const COOKIE_NAME = "eonia_admin"

export async function GET() {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get(COOKIE_NAME)?.value === "1"
  return NextResponse.json({ authenticated: isAdmin })
}
