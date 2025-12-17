import { NextResponse } from "next/server"

const COOKIE_NAME = "eonia_admin"

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const password = body?.password as string | undefined
  const expected = process.env.ADMIN_PASSWORD

  if (!expected) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not configured on the server." },
      { status: 500 },
    )
  }

  if (!password || password !== expected) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return res
}
