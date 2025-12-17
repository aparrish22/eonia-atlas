"use client"

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import type { EntrySummary } from "@/lib/content"
import type { WorldMapPin } from "@/lib/worldMapPins"

type WorldMapProps = {
  mapSrc: string
  initialPins: WorldMapPin[]
  entrySummaries: EntrySummary[]
}

type SaveState = "idle" | "saving" | "saved" | "error"

const DRAG_THRESHOLD_PX = 4

function clamp01(value: number) {
  if (Number.isNaN(value)) return 0.5
  return Math.min(1, Math.max(0, value))
}

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return `pin_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export function WorldMap({ mapSrc, initialPins, entrySummaries }: WorldMapProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const dragCandidateRef = useRef<{
    id: string
    pointerId: number
    startClientX: number
    startClientY: number
    started: boolean
  } | null>(null)
  const suppressNextClickRef = useRef<string | null>(null)
  const navTimeoutRef = useRef<number | null>(null)

  const [pins, setPins] = useState<WorldMapPin[]>(initialPins)
  const [selectedId, setSelectedId] = useState<string | null>(initialPins[0]?.id ?? null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [createMode, setCreateMode] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<SaveState>("idle")
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [navPrompt, setNavPrompt] = useState<{ title: string; href: string } | null>(null)
  const [navLoading, setNavLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const selectedPin = useMemo(() => pins.find((p) => p.id === selectedId) ?? null, [pins, selectedId])
  const selectedMdxCategory = selectedPin?.mdxCategory

  const entryTitleByKey = useMemo(() => {
    const map = new Map<string, string>()
    for (const e of entrySummaries) {
      map.set(`${e.category}/${e.slug}`, e.title)
    }
    return map
  }, [entrySummaries])

  const categories = useMemo(() => {
    const set = new Set(entrySummaries.map((e) => e.category))
    return Array.from(set).sort()
  }, [entrySummaries])

  const slugsForCategory = useMemo(() => {
    if (!selectedMdxCategory) return []
    return entrySummaries
      .filter((e) => e.category === selectedMdxCategory)
      .map((e) => ({ slug: e.slug, title: e.title }))
      .sort((a, b) => a.title.localeCompare(b.title))
  }, [entrySummaries, selectedMdxCategory])

  useEffect(() => {
    let cancelled = false
    const checkAdminStatus = async () => {
      try {
        const res = await fetch("/api/admin/status", { cache: "no-store" })
        const data = (await res.json()) as { authenticated?: boolean }
        if (!cancelled) setIsAdmin(Boolean(data.authenticated))
      } catch {
        if (!cancelled) setIsAdmin(false)
      }
    }
    void checkAdminStatus()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    return () => {
      if (navTimeoutRef.current) window.clearTimeout(navTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(null), 2500)
    return () => clearTimeout(t)
  }, [message])

  const exitEditMode = () => {
    setIsEditing(false)
    setCreateMode(false)
    setDraggingId(null)
    dragCandidateRef.current = null
  }

  const toggleEditMode = () => {
    if (isEditing) {
      exitEditMode()
    } else {
      setIsEditing(true)
    }
  }

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
    } catch {
      setError("Could not log in.")
    }
  }

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" })
    setIsAdmin(false)
    exitEditMode()
  }

  const setPin = (id: string, patch: Partial<WorldMapPin>) => {
    setPins((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  const createPinAt = (x: number, y: number) => {
    const id = newId()
    const pin: WorldMapPin = { id, x: clamp01(x), y: clamp01(y), title: "New pin" }
    setPins((prev) => [pin, ...prev])
    setSelectedId(id)
    setMessage("Created a new pin.")
  }

  const savePins = async (pinsToSave?: WorldMapPin[]) => {
    setSaveState("saving")
    setError(null)
    try {
      const res = await fetch("/api/world-map-pins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pins: pinsToSave ?? pins }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data?.error ?? "Save failed.")
        setSaveState("error")
        return
      }
      setSaveState("saved")
      setTimeout(() => setSaveState("idle"), 1500)
      setMessage("Pins saved.")
    } catch {
      setError("Save failed.")
      setSaveState("error")
    }
  }

  const requestDeleteSelected = () => {
    if (!selectedPin || !isAdmin || !isEditing) return
    setConfirmDeleteOpen(true)
  }

  const confirmDeleteSelected = async () => {
    if (!selectedId) return
    setConfirmDeleteOpen(false)
    const nextPins = pins.filter((p) => p.id !== selectedId)
    setPins(nextPins)
    setSelectedId(null)
    setMessage("Pin deleted. Saving…")

    await savePins(nextPins)
  }

  const updateFromPointer = (event: PointerEvent, id: string) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clamp01((event.clientX - rect.left) / rect.width)
    const y = clamp01((event.clientY - rect.top) / rect.height)
    setPin(id, { x, y })
  }

  const onPinPointerDown = (event: PointerEvent<HTMLButtonElement>, id: string) => {
    if (!isEditing) return
    if (event.button !== 0) return
    event.stopPropagation()
    setSelectedId(id)
    dragCandidateRef.current = {
      id,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      started: false,
    }
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // ignore
    }
  }

  const onPinPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!isEditing) return
    const candidate = dragCandidateRef.current
    const id = candidate?.id
    if (!id) return
    if ((event.buttons & 1) !== 1) {
      setDraggingId(null)
      dragCandidateRef.current = null
      return
    }
    if (!candidate.started) {
      const dx = event.clientX - candidate.startClientX
      const dy = event.clientY - candidate.startClientY
      if (dx * dx + dy * dy < DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) return
      candidate.started = true
      setDraggingId(id)
    }
    event.stopPropagation()
    updateFromPointer(event, id)
  }

  const onPinPointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      // ignore
    }
    const candidate = dragCandidateRef.current
    if (candidate?.started) {
      updateFromPointer(event, candidate.id)
      suppressNextClickRef.current = candidate.id
      setTimeout(() => {
        if (suppressNextClickRef.current === candidate.id) suppressNextClickRef.current = null
      }, 0)
    }
    setDraggingId(null)
    dragCandidateRef.current = null
  }

  const onPinClick = (event: React.MouseEvent, pin: WorldMapPin) => {
    event.stopPropagation()
    setSelectedId(pin.id)
    if (isEditing) {
      setCreateMode(false)
      return
    }
    if (suppressNextClickRef.current === pin.id) return
    if (pin.mdxCategory && pin.mdxSlug) {
      const href = `/lore/${pin.mdxCategory}/${pin.mdxSlug}`
      const title = entryTitleByKey.get(`${pin.mdxCategory}/${pin.mdxSlug}`) ?? href
      setNavLoading(false)
      setNavPrompt({ title, href })
      return
    }
    setMessage("This pin doesn't have a linked MDX page yet.")
    console.log("WorldMap pin missing link:", pin)
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <section className="flex-1">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/60">Atlas</p>
              <h1 className="mt-2 text-2xl md:text-3xl font-semibold">World Map</h1>
            </div>

            <div className="flex items-center gap-2 text-sm text-white/80">
              {isAdmin ? (
                <>
	                  <button
	                    type="button"
	                    className="rounded-full border border-white/15 bg-white/5 px-4 py-2 hover:bg-white/10 transition"
	                    onClick={toggleEditMode}
	                  >
	                    {isEditing ? "Exit edit" : "Admin edit"}
	                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-white/15 bg-white/5 px-4 py-2 hover:bg-white/10 transition"
                    onClick={handleLogout}
                    disabled={isEditing}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 hover:bg-white/10 transition"
                  onClick={handleLogin}
                >
                  Admin login
                </button>
              )}
            </div>
          </div>

          <div
            ref={containerRef}
            className={[
              "relative mt-6 w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-sm aspect-video",
              isEditing && isAdmin && createMode ? "cursor-crosshair" : "cursor-default",
            ].join(" ")}
            onClick={(event) => {
              if (!isAdmin || !isEditing || !createMode) return
              const rect = event.currentTarget.getBoundingClientRect()
              const x = clamp01((event.clientX - rect.left) / rect.width)
              const y = clamp01((event.clientY - rect.top) / rect.height)
              createPinAt(x, y)
              setCreateMode(false)
            }}
          >
            <Image
              src={mapSrc}
              alt="World map"
              fill
              sizes="(min-width: 768px) 70vw, 100vw"
              priority
              className="object-cover opacity-90"
              unoptimized
            />

            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/20 via-transparent to-black/40" />

            {isAdmin && isEditing && createMode ? (
              <div className="pointer-events-none absolute inset-x-0 top-4 z-20 flex justify-center">
                <div className="rounded-full border border-white/15 bg-black/50 px-4 py-2 text-xs text-white/80 shadow-sm backdrop-blur">
                  Click anywhere on the map to place a new pin
                </div>
              </div>
            ) : null}

            {(saveState === "saving" || saveState === "saved" || saveState === "error") ? (
              <div className="pointer-events-none absolute right-4 top-4 z-20">
                <div
                  className={[
                    "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs shadow-sm backdrop-blur",
                    "transition-opacity",
                    saveState === "saving"
                      ? "border-white/15 bg-black/40 text-white/80"
                      : saveState === "saved"
                        ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                        : "border-rose-400/30 bg-rose-500/10 text-rose-100",
                  ].join(" ")}
                >
                  {saveState === "saving" ? (
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/50 border-t-transparent" />
                  ) : null}
                  <span>
                    {saveState === "saving"
                      ? "Saving…"
                      : saveState === "saved"
                        ? "Saved"
                        : "Save failed"}
                  </span>
                </div>
              </div>
            ) : null}

            {pins.map((pin) => {
              const isSelected = pin.id === selectedId
              return (
                <div
                  key={pin.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${pin.x * 100}%`, top: `${pin.y * 100}%` }}
                >
                  <button
                    type="button"
                    className={[
                      "group relative rounded-full",
                      "h-4 w-4 border border-white/70 bg-white/20 shadow",
                      "hover:bg-white/30 transition",
                      isSelected ? "ring-2 ring-white/80" : "ring-0",
                      isEditing ? (draggingId === pin.id ? "cursor-grabbing" : "cursor-grab") : "cursor-pointer",
                    ].join(" ")}
                    onPointerDown={(e) => onPinPointerDown(e, pin.id)}
                    onPointerMove={onPinPointerMove}
                    onPointerUp={onPinPointerUp}
                    onClick={(e) => onPinClick(e, pin)}
                    aria-label={pin.title}
                  >
                    <span className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-[140%] whitespace-nowrap rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[11px] text-white/85 opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100">
                      {pin.title}
                    </span>
                  </button>
                </div>
              )
            })}
          </div>

          {message ? (
            <div className="mt-4 text-sm text-white/70">{message}</div>
          ) : null}
          {error ? (
            <div className="mt-2 text-sm text-red-200">{error}</div>
          ) : null}
        </section>

        <aside className="w-full md:w-96">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
	            <div className="flex items-center justify-between gap-3">
	              <h2 className="text-lg font-semibold">Pins</h2>
	              <div className="flex items-center gap-2">
	                <button
	                  type="button"
	                  className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition disabled:opacity-50"
	                  onClick={() => {
	                    if (!isAdmin || !isEditing) return
	                    setCreateMode((prev) => !prev)
	                  }}
	                  disabled={!isAdmin || !isEditing}
	                >
	                  {createMode ? "Cancel" : "Create Pin"}
	                </button>
	                <button
	                  type="button"
	                  className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition disabled:opacity-50"
	                  onClick={requestDeleteSelected}
	                  disabled={!isAdmin || !isEditing || !selectedPin}
	                >
	                  Delete
	                </button>
	              </div>
            </div>

            <div className="mt-4 space-y-3">
              <button
                type="button"
                className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition disabled:opacity-50"
                onClick={() => void savePins()}
                disabled={!isAdmin || !isEditing || saveState === "saving"}
              >
                {saveState === "saving" ? "Saving..." : "Save"}
              </button>

              {selectedPin ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-white/60">Title</label>
                    <input
                      className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                      value={selectedPin.title}
                      disabled={!isAdmin || !isEditing}
                      onChange={(e) => setPin(selectedPin.id, { title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/60">Subtitle</label>
                    <input
                      className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                      value={selectedPin.subtitle ?? ""}
                      disabled={!isAdmin || !isEditing}
                      onChange={(e) => setPin(selectedPin.id, { subtitle: e.target.value || undefined })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-white/60">Description</label>
                    <textarea
                      className="mt-1 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                      rows={4}
                      value={selectedPin.description ?? ""}
                      disabled={!isAdmin || !isEditing}
                      onChange={(e) => setPin(selectedPin.id, { description: e.target.value || undefined })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-white/60">MDX Category</label>
                      <select
                        className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                        value={selectedPin.mdxCategory ?? ""}
                        disabled={!isAdmin || !isEditing}
                        onChange={(e) => {
                          const nextCategory = e.target.value || undefined
                          setPin(selectedPin.id, { mdxCategory: nextCategory, mdxSlug: undefined })
                        }}
                      >
                        <option value="">(none)</option>
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-white/60">MDX Slug</label>
                      <select
                        className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                        value={selectedPin.mdxSlug ?? ""}
                        disabled={!isAdmin || !isEditing || !selectedPin.mdxCategory}
                        onChange={(e) => setPin(selectedPin.id, { mdxSlug: e.target.value || undefined })}
                      >
                        <option value="">(none)</option>
                        {slugsForCategory.map((s) => (
                          <option key={s.slug} value={s.slug}>
                            {s.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-xs text-white/70">
                    Drag the pin on the map to move it. Coordinates:{" "}
                    {(selectedPin.x * 100).toFixed(1)}%, {(selectedPin.y * 100).toFixed(1)}%
                  </div>
                </div>
              ) : (
                <p className="text-sm text-white/60">Select a pin to edit it.</p>
              )}
            </div>
          </div>
        </aside>
      </div>

      {confirmDeleteOpen && selectedPin ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/60 p-5 shadow-xl backdrop-blur">
            <h3 className="text-lg font-semibold">Delete pin?</h3>
            <p className="mt-2 text-sm text-white/70">
              This will permanently remove{" "}
              <span className="font-medium text-white">{selectedPin.title}</span> from the map.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition"
                onClick={() => setConfirmDeleteOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-full border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-100 hover:bg-rose-500/20 transition"
                onClick={confirmDeleteSelected}
              >
                Delete & Save
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {navPrompt ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/60 p-5 shadow-xl backdrop-blur">
            <h3 className="text-lg font-semibold">Open page?</h3>
            <p className="mt-2 text-sm text-white/70">
              Do you want to go to{" "}
              <span className="font-medium text-white">{navPrompt.title}</span>?
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition disabled:opacity-50"
                disabled={navLoading}
                onClick={() => {
                  if (navTimeoutRef.current) window.clearTimeout(navTimeoutRef.current)
                  navTimeoutRef.current = null
                  setNavLoading(false)
                  setNavPrompt(null)
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100 hover:bg-emerald-500/20 transition disabled:opacity-50"
                disabled={navLoading}
                onClick={() => {
                  setNavLoading(true)
                  if (navTimeoutRef.current) window.clearTimeout(navTimeoutRef.current)
                  navTimeoutRef.current = window.setTimeout(() => {
                    router.push(navPrompt.href)
                  }, 1000)
                }}
              >
                {navLoading ? (
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-emerald-200/70 border-t-transparent" />
                ) : null}
                {navLoading ? "Opening…" : "Yes, open"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}
