"use client"

/**
 * WorldMap component
 * Renders an interactive world map with pins that can be viewed and edited.
 * Props:
 * - mapSrc: string - Source URL of the map image.
 * - mapWidth?: number - Optional width of the map image.
 * - mapHeight?: number - Optional height of the map image.
 * - initialPins: WorldMapPin[] - Initial array of pins to display on the map.
 * - entrySummaries: EntrySummary[] - Array of entry summaries for linking pins to content.
 * State:
 * - pins: WorldMapPin[] - Current array of pins on the map.
 * - selectedId: string | null - ID of the currently selected pin.
 * - isAdmin: boolean - Whether the user has admin privileges.
 * - isEditing: boolean - Whether the map is in editing mode.
 * - createMode: boolean - Whether the user is in create pin mode.
 * - draggingId: string | null - ID of the pin currently being dragged.
 * - isPanning: boolean - Whether the map is currently being panned.
 * - saveState: SaveState - Current state of saving pins ("idle", "saving", "saved", "error").
 * - confirmDeleteOpen: boolean - Whether the delete confirmation modal is open.
 * - navPrompt: { title: string; href: string } | null - Navigation prompt data for linking pins.
 * - navLoading: boolean - Whether navigation is in progress.
 * - message: string | null - User feedback message.
 * - error: string | null - Error message.
 * - activeMapIndex: number - Index of the currently active map variant.
 * - imgSize: { w: number; h: number } - Size of the map image.
 * - camera: { scale: number; tx: number; ty: number } - Camera state for zoom and pan.
 * Handlers:
 * - handleImageLoad: Updates image size on load.
 * - handleLogin: Handles admin login.
 * - handleLogout: Handles admin logout.
 * - setPin: Updates a pin's data.
 * - createPinAt: Creates a new pin at specified normalized coordinates.
 * - savePins: Saves the current pins to the server.
 * - requestDeleteSelected: Opens delete confirmation for selected pin.
 * - confirmDeleteSelected: Deletes the selected pin after confirmation.
 * - updateFromPointer: Updates pin position based on pointer event.
 * - onPinPointerDown/Move/Up: Handlers for dragging pins.
 * - onPinClick: Handler for clicking a pin.
 * - resetView: Resets camera view to default.
 * - zoomAt: Zooms the camera at specified client coordinates.
 * - onWheel: Handler for mouse wheel zooming.
 * - onViewportPointerDown/Move/Up: Handlers for panning the map.
 * - onViewportClick: Handler for creating pins on map click.
 * Renders:
 * - Header with title and controls.
 * - MapViewport component for displaying the map.
 * - PinsOverlay component for rendering pins.
 * - PinEditorPanel for editing pin details.
 * - DeletePinModal for confirming pin deletion.
 * - NavigateModal for confirming navigation to linked content.
 * Summary:
 * This component provides a full-featured interactive world map with pin management capabilities,
 * including viewing, creating, editing, deleting, and linking pins to content pages.
 * Some rules: do not use mapWidth/mapHeight for math anymore once imgSize exists. 
 * Those props can remain as initial fallbacks, but imgSize is the truth.
 * Camera clamping should always use imgSize.
 */

import { useEffect, useMemo, useRef, useState, type PointerEvent, type WheelEvent } from "react"
import { useRouter } from "next/navigation"
import type { EntrySummary } from "@/lib/content"
import type { WorldMapPin } from "@/lib/worldMapPins"
import { MapViewport } from "@/components/world-map/MapViewport"
import { PinsOverlay } from "@/components/world-map/PinsOverlay"
import { PinEditorPanel } from "@/components/world-map/PinEditorPanel"
import { DeletePinModal } from "@/components/world-map/DeletePinModal"
import { NavigateModal } from "@/components/world-map/NavigateModal"

type WorldMapProps = {
  mapSrc: string
  mapWidth?: number
  mapHeight?: number
  initialPins: WorldMapPin[]
  entrySummaries: EntrySummary[]
}

type SaveState = "idle" | "saving" | "saved" | "error"

const DRAG_THRESHOLD_PX = 4
const MIN_ZOOM = 0.25
const MAX_ZOOM = 4.0
const DEFAULT_ZOOM = 1.2

const MAP_LAYERS = [
  { id: "current", label: "Current", src: "/maps/world-map-current.png" },
  { id: "state", label: "State", src: "/maps/world-map-state.png" },
  { id: "height", label: "Height", src: "/maps/world-map-height.png" },
  { id: "biome", label: "Biome", src: "/maps/world-map-biome.png" },
] as const

function clamp01(value: number) {
  if (Number.isNaN(value)) return 0.5
  return Math.min(1, Math.max(0, value))
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return `pin_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export function WorldMap({
  mapSrc,
  mapWidth = 1600,
  mapHeight = 900,
  initialPins,
  entrySummaries,
}: WorldMapProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const viewportRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 })
  const cameraInitializedRef = useRef(false)
  const cameraRef = useRef<{ scale: number; tx: number; ty: number }>({ scale: DEFAULT_ZOOM, tx: 0, ty: 0 })
  const pinsRef = useRef<WorldMapPin[]>(initialPins)
  const dragCandidateRef = useRef<{
    id: string
    pointerId: number
    startClientX: number
    startClientY: number
    started: boolean
  } | null>(null)
  const panCandidateRef = useRef<{
    pointerId: number
    startClientX: number
    startClientY: number
    startTx: number
    startTy: number
    started: boolean
  } | null>(null)
  const lastPanEndedTimeStampRef = useRef<number>(0)
  const suppressNextClickRef = useRef<string | null>(null)
  const navTimeoutRef = useRef<number | null>(null)

  const [pins, setPins] = useState<WorldMapPin[]>(initialPins)
  const [selectedId, setSelectedId] = useState<string | null>(initialPins[0]?.id ?? null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [createMode, setCreateMode] = useState(false)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>("idle")
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [navPrompt, setNavPrompt] = useState<{ title: string; href: string } | null>(null)
  const [navLoading, setNavLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [activeMapIndex, setActiveMapIndex] = useState(0)
  const [imgSize, setImgSize] = useState({ w: mapWidth, h: mapHeight })

  const [camera, setCamera] = useState(() => ({ scale: DEFAULT_ZOOM, tx: 0, ty: 0 }))

  const handleImageLoad = (size: { w: number; h: number }) => {
    // ignore zeros (SVGs can sometimes do this) and ignore no-op updates
    if (!size.w || !size.h) return
    setImgSize((prev) => (prev.w === size.w && prev.h === size.h ? prev : size))
    // force the next viewport update to re-center using the new imgSize
    cameraInitializedRef.current = false
  }

  // Map layers configuration
  const activeMap = MAP_LAYERS[activeMapIndex] ?? MAP_LAYERS[0]

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

  const canEdit = isAdmin && isEditing
  const panelOpen = Boolean(selectedPin) || isEditing || confirmDeleteOpen

  useEffect(() => {
    cameraRef.current = camera
  }, [camera])

  useEffect(() => {
    pinsRef.current = pins
  }, [pins])

  const clampCamera = (next: { scale: number; tx: number; ty: number }) => {
    const scale = clamp(next.scale, MIN_ZOOM, MAX_ZOOM)

    const viewportWidth = viewportRef.current.width
    const viewportHeight = viewportRef.current.height
    if (viewportWidth <= 0 || viewportHeight <= 0) return { ...next, scale }

    const scaledWidth = imgSize.w * scale
    const scaledHeight = imgSize.h * scale

    const allowanceX = 0.5 * Math.min(viewportWidth, scaledWidth)
    const allowanceY = 0.5 * Math.min(viewportHeight, scaledHeight)

    const minTx = viewportWidth - scaledWidth - allowanceX
    const maxTx = allowanceX
    const minTy = viewportHeight - scaledHeight - allowanceY
    const maxTy = allowanceY

    return {
      scale,
      tx: clamp(next.tx, minTx, maxTx),
      ty: clamp(next.ty, minTy, maxTy),
    }
  }

  const clientToNormalized = (clientX: number, clientY: number) => {
    const el = containerRef.current
    if (!el) return null
    const rect = el.getBoundingClientRect()
    const cx = clientX - rect.left
    const cy = clientY - rect.top

    const { scale, tx, ty } = cameraRef.current
    const mapX = (cx - tx) / scale
    const mapY = (cy - ty) / scale

    return {
      x: clamp01(mapX / imgSize.w),
      y: clamp01(mapY / imgSize.h),
    }
  }

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
    const el = containerRef.current
    if (!el) return

    const updateViewportAndCamera = () => {
      const rect = el.getBoundingClientRect()
      viewportRef.current = { width: rect.width, height: rect.height }

      if (!cameraInitializedRef.current) {
        cameraInitializedRef.current = true
        setCamera(
          clampCamera({
            scale: DEFAULT_ZOOM,
            tx: (rect.width - imgSize.w * DEFAULT_ZOOM) / 2,
            ty: (rect.height - imgSize.h * DEFAULT_ZOOM) / 2,
          }),
        )
        return
      }

      setCamera((prev) => {
        const next = clampCamera(prev)
        if (next.scale === prev.scale && next.tx === prev.tx && next.ty === prev.ty) return prev
        return next
      })
    }

    const ro = new ResizeObserver(() => updateViewportAndCamera())
    ro.observe(el)

    const raf = window.requestAnimationFrame(() => updateViewportAndCamera())

    return () => {
      window.cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [imgSize.h, imgSize.w])

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

  // Ensures the next ResizeObserver tick will re-run the initial center block
  // for the newly selected map.
  useEffect(() => {
    cameraInitializedRef.current = false
  }, [activeMap.src])

  // checks if more maps are not counted than available
  // useEffect(() => {
  //   if (activeMapIndex < 0 || activeMapIndex >= MAP_LAYERS.length) {
  //     setActiveMapIndex(0)
  //   }
  // }, [activeMapIndex])



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
    const next = clientToNormalized(event.clientX, event.clientY)
    if (!next) return
    setPin(id, next)
  }

  const onPinPointerDown = (event: PointerEvent<HTMLButtonElement>, id: string) => {
    event.stopPropagation()
    if (!isEditing) return
    if (event.button !== 0) return
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
      const finalPos = clientToNormalized(event.clientX, event.clientY)
      if (finalPos) {
        const nextPins = pinsRef.current.map((p) => (p.id === candidate.id ? { ...p, ...finalPos } : p))
        pinsRef.current = nextPins
        setPins(nextPins)
        if (canEdit) void savePins(nextPins)
      }
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
    const isSamePin = selectedId === pin.id
    setSelectedId(pin.id)
    if (isEditing) {
      setCreateMode(false)
      return
    }
    if (suppressNextClickRef.current === pin.id) return

    if (!isSamePin) return

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

  const resetView = () => {
    const { width, height } = viewportRef.current
    setCamera(
      clampCamera({
        scale: DEFAULT_ZOOM,
        tx: (width - imgSize.w * DEFAULT_ZOOM) / 2,
        ty: (height - imgSize.h * DEFAULT_ZOOM) / 2,
      }),
    )
  }

  const zoomAt = (nextScale: number, clientX: number, clientY: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = clientX - rect.left
    const cy = clientY - rect.top

    setCamera((prev) => {
      const scale = clamp(nextScale, MIN_ZOOM, MAX_ZOOM)
      const mapX = (cx - prev.tx) / prev.scale
      const mapY = (cy - prev.ty) / prev.scale
      const tx = cx - mapX * scale
      const ty = cy - mapY * scale
      return clampCamera({ scale, tx, ty })
    })
  }

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (navPrompt) return

    const current = camera.scale
    const zoomFactor = Math.exp(-event.deltaY * 0.0015)
    const next = clamp(current * zoomFactor, MIN_ZOOM, MAX_ZOOM)
    zoomAt(next, event.clientX, event.clientY)
  }

  const onViewportPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    if (navPrompt) return
    event.currentTarget.focus()
    const { tx, ty } = cameraRef.current
    panCandidateRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startTx: tx,
      startTy: ty,
      started: false,
    }
  }

  const onViewportPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const pan = panCandidateRef.current
    if (!pan) return
    if (event.pointerId !== pan.pointerId) return
    if ((event.buttons & 1) !== 1) {
      panCandidateRef.current = null
      setIsPanning(false)
      return
    }

    const dx = event.clientX - pan.startClientX
    const dy = event.clientY - pan.startClientY

    if (!pan.started) {
      if (dx * dx + dy * dy < DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) return
      pan.started = true
      setIsPanning(true)
      setCreateMode(false)
      try {
        event.currentTarget.setPointerCapture(pan.pointerId)
      } catch {
        // ignore
      }
    }

    setCamera((prev) => clampCamera({ ...prev, tx: pan.startTx + dx, ty: pan.startTy + dy }))
  }

  const onViewportPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const pan = panCandidateRef.current
    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      // ignore
    }
    if (pan?.started) lastPanEndedTimeStampRef.current = event.timeStamp
    panCandidateRef.current = null
    setIsPanning(false)
  }

  const onViewportClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!canEdit || !createMode) return
    if (event.timeStamp - lastPanEndedTimeStampRef.current < 150) return
    const next = clientToNormalized(event.clientX, event.clientY)
    if (!next) return
    createPinAt(next.x, next.y)
    setCreateMode(false)
  }

  return (
    <main className="h-[100svh] p-4 sm:p-6">
      <div className="mx-auto flex h-full max-w-[1700px] flex-col gap-4">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-white/60">Atlas</p>
            <h1 className="mt-2 text-2xl md:text-3xl font-semibold">World Map</h1>
            <p className="mt-2 text-sm text-white/60">
              Drag to pan • Wheel to zoom • Click a pin to select
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-white/80">
            <button
              type="button"
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 hover:bg-white/10 transition"
              onClick={resetView}
            >
              Reset view
            </button>

            <div className="inline-flex overflow-hidden rounded-full border border-white/15 bg-white/5">
              { /* Map layer buttons */ }
              {MAP_LAYERS.map((m, i) => (
                <button
                  key={m.id}
                  type="button"
                  className={[
                    "px-3 py-2 text-sm transition",
                    i === activeMapIndex ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10",
                  ].join(" ")}
                  onClick={() => setActiveMapIndex(i)}
                  aria-pressed={i === activeMapIndex}
                >
                  {m.label}
                </button>
              ))}
            </div>
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
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 hover:bg-white/10 transition disabled:opacity-50"
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
        </header>

        <section className="relative flex-1 rounded-[28px] border border-white/10 bg-white/5 p-3 shadow-sm">
          <MapViewport
            containerRef={containerRef}
            camera={camera}
            imgSize={imgSize}
            mapSrc={activeMap.src}
            mapLabel={activeMap.label}
            isPanning={isPanning}
            canEdit={canEdit}
            createMode={createMode}
            onWheel={onWheel}
            onPointerDown={onViewportPointerDown}
            onPointerMove={onViewportPointerMove}
            onPointerUp={onViewportPointerUp}
            onClick={onViewportClick}
            onImageLoad={handleImageLoad}
          >
            <PinsOverlay
              pins={pins}
              selectedId={selectedId}
              camera={camera}
              imgSize={imgSize}
              isEditing={isEditing}
              draggingId={draggingId}
              onPinPointerDown={onPinPointerDown}
              onPinPointerMove={onPinPointerMove}
              onPinPointerUp={onPinPointerUp}
              onPinClick={onPinClick}
            />
          </MapViewport>

          <div className="absolute left-6 top-6 z-30 flex flex-col gap-2">
            <button
              type="button"
              className="h-10 w-10 rounded-xl border border-white/15 bg-black/40 text-white/80 hover:bg-black/55 transition"
              onClick={() => {
                const rect = containerRef.current?.getBoundingClientRect()
                if (!rect) return
                zoomAt(clamp(camera.scale * 1.25, MIN_ZOOM, MAX_ZOOM), rect.left + rect.width / 2, rect.top + rect.height / 2)
              }}
              aria-label="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              className="h-10 w-10 rounded-xl border border-white/15 bg-black/40 text-white/80 hover:bg-black/55 transition"
              onClick={() => {
                const rect = containerRef.current?.getBoundingClientRect()
                if (!rect) return
                zoomAt(clamp(camera.scale / 1.25, MIN_ZOOM, MAX_ZOOM), rect.left + rect.width / 2, rect.top + rect.height / 2)
              }}
              aria-label="Zoom out"
            >
              −
            </button>
          </div>

          {isAdmin && isEditing && createMode ? (
            <div className="pointer-events-none absolute inset-x-0 top-6 z-30 flex justify-center">
              <div className="rounded-full border border-white/15 bg-black/55 px-4 py-2 text-xs text-white/80 shadow-sm backdrop-blur">
                Click on the map to place a new pin
              </div>
            </div>
          ) : null}

          {(saveState === "saving" || saveState === "saved" || saveState === "error") ? (
            <div className="pointer-events-none absolute right-6 top-6 z-30">
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

          <PinEditorPanel
            open={panelOpen}
            isAdmin={isAdmin}
            isEditing={isEditing}
            canEdit={canEdit}
            createMode={createMode}
            saveState={saveState}
            cameraScale={camera.scale}
            selectedPin={selectedPin}
            categories={categories}
            slugsForCategory={slugsForCategory}
            onToggleCreateMode={() => setCreateMode((prev) => !prev)}
            onRequestDelete={requestDeleteSelected}
            onSave={() => void savePins()}
            onSetPin={setPin}
            message={message}
            error={error}
          />
        </section>
      </div>

      <DeletePinModal
        open={Boolean(confirmDeleteOpen && selectedPin)}
        pinTitle={selectedPin?.title ?? ""}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={confirmDeleteSelected}
      />

      <NavigateModal
        open={Boolean(navPrompt)}
        title={navPrompt?.title ?? ""}
        loading={navLoading}
        onCancel={() => {
          if (navTimeoutRef.current) window.clearTimeout(navTimeoutRef.current)
          navTimeoutRef.current = null
          setNavLoading(false)
          setNavPrompt(null)
        }}
        onConfirm={() => {
          if (!navPrompt) return
          setNavLoading(true)
          if (navTimeoutRef.current) window.clearTimeout(navTimeoutRef.current)
          navTimeoutRef.current = window.setTimeout(() => {
            router.push(navPrompt.href)
          }, 1000)
        }}
      />
    </main>
  )
}
