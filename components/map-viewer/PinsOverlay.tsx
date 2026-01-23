"use client"

import type { MouseEvent, PointerEvent } from "react"
import type { WorldMapPin } from "@/lib/worldMapPins"
import type { Camera, ImgSize } from "@/components/map-viewer/MapViewport"

const DEBUG = process.env.NODE_ENV !== "production"

type PinsOverlayProps = {
  pins: WorldMapPin[]
  selectedId: string | null
  camera: Camera
  imgSize: ImgSize
  isEditing: boolean
  draggingId: string | null
  onPinPointerDown: (event: PointerEvent<HTMLButtonElement>, id: string) => void
  onPinPointerMove: (event: PointerEvent<HTMLButtonElement>) => void
  onPinPointerUp: (event: PointerEvent<HTMLButtonElement>) => void
  onPinClick: (event: MouseEvent, pin: WorldMapPin) => void
}

export function PinsOverlay({
  pins,
  selectedId,
  camera,
  imgSize,
  isEditing,
  draggingId,
  onPinPointerDown,
  onPinPointerMove,
  onPinPointerUp,
  onPinClick,
}: PinsOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20">

      {/* DEBUG: blue dot for where map center should appear on screen */}
      { DEBUG && 
      <div
        style={{
          position: "absolute",
          left: 0.5 * imgSize.w * camera.scale + camera.tx,
          top: 0.5 * imgSize.h * camera.scale + camera.ty,
          width: 10,
          height: 10,
          borderRadius: 9999,
          background: "dodgerblue",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none",
          zIndex: 999,
        }}
      />
      }

      {pins.map((pin) => {
        const isSelected = pin.id === selectedId
        const left = pin.x * imgSize.w * camera.scale + camera.tx
        const top = pin.y * imgSize.h * camera.scale + camera.ty

        return (
          <div
            key={pin.id}
            className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left, top }}
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
              onPointerMove={isEditing ? onPinPointerMove : undefined}
              onPointerUp={isEditing ? onPinPointerUp : undefined}
              onClick={(e) => onPinClick(e, pin)}
              aria-label={pin.title}
            >
              <span className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-[140%] inline-flex flex-col items-start rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-[11px] text-white/85 opacity-0 shadow-sm backdrop-blur transition-opacity duration-150 group-hover:opacity-100">
                <span className="block whitespace-nowrap text-[11px] font-medium leading-tight text-white/90">
                  {pin.title}
                </span>
                {pin.subtitle ? (
                  <span className="block min-w-0 max-h-0 max-w-0 overflow-hidden whitespace-nowrap text-[10px] leading-tight text-white/70 opacity-0 transition-[max-height,max-width,opacity,margin] duration-200 group-hover:mt-0.5 group-hover:max-h-6 group-hover:max-w-[240px] group-hover:opacity-100 group-hover:delay-1000">
                    {pin.subtitle}
                  </span>
                ) : null}
              </span>
            </button>
          </div>
        )
      })}
    </div>
  )
}
