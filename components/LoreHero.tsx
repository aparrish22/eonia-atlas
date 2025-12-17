"use client"

import { useEffect, useRef, useState, type PointerEvent } from "react"
import Image from "next/image"
import { ScrollReveal } from "@/components/ScrollReveal"
import { MusicPlayer } from "@/components/MusicPlayer"
import type { CoverPosition } from "@/lib/coverPositions"

type LoreHeroProps = {
  title: string
  region?: string
  type?: string
  category: string
  slug: string
  cover?: string
  music?: string
  initialPosition?: CoverPosition | null
}

type SaveState = "idle" | "saving" | "saved" | "error"

const DEFAULT_POSITION: CoverPosition = { x: 50, y: 40 }

export function LoreHero({
  title,
  region,
  type,
  category,
  slug,
  cover,
  music,
  initialPosition,
}: LoreHeroProps) {
  const [position, setPosition] = useState<CoverPosition>(initialPosition ?? DEFAULT_POSITION)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>("idle")
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    let cancelled = false
    const checkStatus = async () => {
      try {
        const res = await fetch("/api/admin/status", { cache: "no-store" })
        const data = (await res.json()) as { authenticated?: boolean }
        if (!cancelled) setIsAdmin(Boolean(data.authenticated))
      } catch {
        if (!cancelled) setIsAdmin(false)
      }
    }
    checkStatus()
    return () => {
      cancelled = true
    }
  }, [])

  const handleLogin = async () => {
    const password = window.prompt("Enter admin password")
    if (!password) return

    setError(null)
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error ?? "Login failed.")
        return
      }

      setIsAdmin(true)
    } catch (err) {
      console.error(err)
      setError("Could not log in.")
    }
  }

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    setIsAdmin(false)
    setIsEditing(false)
  }

  const updatePositionFromEvent = (event: PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    setPosition({
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    })
  }

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!isEditing) return
    if (event.button !== 0) return
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // ignore
    }
    setDragging(true)
    updatePositionFromEvent(event)
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isEditing || !dragging) return
    if ((event.buttons & 1) !== 1) {
      setDragging(false)
      return
    }
    updatePositionFromEvent(event)
  }

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      // ignore
    }
    setDragging(false)
  }
  const onPointerLeave = () => setDragging(false)

  const handleSave = async () => {
    setSaveState("saving")
    setError(null)
    try {
      const res = await fetch("/api/cover-position", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          slug,
          x: position.x,
          y: position.y,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error ?? "Save failed.")
        setSaveState("error")
        return
      }

      setSaveState("saved")
      setTimeout(() => setSaveState("idle"), 2000)
      setIsEditing(false)
    } catch (err) {
      console.error(err)
      setSaveState("error")
      setError("Save failed.")
    }
  }

  const objectPosition = `${position.x}% ${position.y}%`
  const label = region ?? type ?? category

  return (
    <section ref={containerRef} className="relative h-[55vh] min-h-[360px] w-full overflow-hidden">
      {cover ? (
        <Image
          src={cover}
          alt={title}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
          style={{ objectPosition }}
        />
      ) : (
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/10 via-black to-black" />
      )}

      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/30 via-black/40 to-black" />

      <div className="relative z-20 mx-auto flex h-full max-w-5xl flex-col justify-end px-6 pb-10">
        <ScrollReveal>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/60">
                {label}
              </p>
              <h1 className="mt-2 text-3xl md:text-5xl font-semibold">
                {title}
              </h1>
            </div>
            <div className="relative z-20 flex flex-col items-end gap-2">
              <div className={isEditing ? "pointer-events-none opacity-0 transition" : "transition"}>
                <MusicPlayer src={music} />
              </div>
              <div className="flex items-center gap-2 text-xs text-white/70">
                {isAdmin ? (
                  <>
                    {!isEditing ? (
                      <button
                        type="button"
                        className="rounded-full border border-white/20 bg-white/10 px-3 py-1 hover:bg-white/15 transition"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit cover
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className={`rounded-full border border-white/20 bg-white/5 px-3 py-1 hover:bg-white/10 transition ${isEditing ? "pointer-events-none opacity-0" : ""}`}
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="rounded-full border border-white/15 bg-white/5 px-3 py-1 hover:bg-white/10 transition"
                    onClick={handleLogin}
                  >
                    Admin login
                  </button>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {isAdmin && isEditing ? (
        <div
          className="absolute inset-0 z-30 cursor-grab"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerLeave}
        >
          <div
            className="absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/70 bg-white/10 backdrop-blur"
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
          />
          {/* <div className="absolute inset-x-0 bottom-4 flex justify-center">
            <div className="rounded-full bg-black/60 px-4 py-2 text-xs text-white/80 shadow-lg backdrop-blur">
              Drag to reposition • {position.x.toFixed(1)}%, {position.y.toFixed(1)}%
            </div>
          </div> */}
        </div>
      ) : null}

      {isAdmin && (
        <div className="absolute bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 text-xs">
          {isEditing ? (
            <>
              <button
                type="button"
                className="rounded-full border border-white/25 bg-white/15 px-4 py-2 text-white hover:bg-white/25 transition"
                onClick={handleSave}
                disabled={saveState === "saving"}
              >
                {saveState === "saving" ? "Saving..." : "Save position"}
              </button>
              <button
                type="button"
                className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-white/80 hover:bg-white/10 transition"
                onClick={() => setPosition(initialPosition ?? DEFAULT_POSITION)}
              >
                Reset
              </button>
              <button
                type="button"
                className="rounded-full border border-white/20 bg-white/10 px-3 py-2 text-white hover:bg-white/20 transition"
                onClick={() => {
                  setDragging(false)
                  setIsEditing(false)
                }}
              >
                Exit edit
              </button>
              {saveState === "saved" ? (
                <span className="text-green-200">Saved</span>
              ) : null}
              {error ? <span className="text-red-200">{error}</span> : null}
            </>
          ) : null}
        </div>
      )}
      {error && !isEditing ? (
        <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-red-700/70 px-4 py-2 text-xs text-white/90">
          {error}
        </div>
      ) : null}
    </section>
  )
}
