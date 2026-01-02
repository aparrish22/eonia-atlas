"use client"


import type { MouseEvent, PointerEvent, ReactNode, RefObject, WheelEvent } from "react"
import Image from "next/image"

const DEBUG = process.env.NODE_ENV !== "production"

export type Camera = {
  scale: number
  tx: number
  ty: number
}

export type ImgSize = {
  w: number
  h: number
}

type MapViewportProps = {
  containerRef: RefObject<HTMLDivElement | null>
  camera: Camera
  imgSize: ImgSize
  mapSrc: string
  mapLabel: string
  isPanning: boolean
  canEdit: boolean
  createMode: boolean
  onWheel: (event: WheelEvent<HTMLDivElement>) => void
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void
  onPointerUp: (event: PointerEvent<HTMLDivElement>) => void
  onClick: (event: MouseEvent<HTMLDivElement>) => void
  onImageLoad: (size: ImgSize) => void
  children?: ReactNode
}

export function MapViewport({
  containerRef,
  camera,
  imgSize,
  mapSrc,
  mapLabel,
  isPanning,
  canEdit,
  createMode,
  onWheel,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onClick,
  onImageLoad,
  children,
}: MapViewportProps) {
  return (
    <div
      ref={containerRef}
      tabIndex={0}
      className={[
        "relative h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 outline-none",
        isPanning ? "cursor-grabbing" : createMode && canEdit ? "cursor-crosshair" : "cursor-grab",
      ].join(" ")}
      style={{ touchAction: "none" }}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={onClick}
    >
      <div
        className="absolute left-0 top-0 will-change-transform"
        style={{
          width: imgSize.w,
          height: imgSize.h,
          transformOrigin: "0 0", // critical fix 12/25/2025
          transform: `matrix(${camera.scale}, 0, 0, ${camera.scale}, ${camera.tx}, ${camera.ty})`,
        }}
      >
        <Image
          src={mapSrc}
          alt="Map"
          width={imgSize.w}
          height={imgSize.h}
          style={{ width: "100%", height: "100%" }}
          priority
          className="select-none pointer-events-none"
          draggable={false}
          unoptimized
          onLoadingComplete={(img) => 
            onImageLoad({ 
              w: img.naturalWidth || imgSize.w,
              h: img.naturalHeight || imgSize.h,
            })
          }
        />

        {/* DEBUG: red dot at center of the map in map-pixel space */}
        { DEBUG &&
        <div
          style={{
            position: "absolute",
            left: imgSize.w / 2,
            top: imgSize.h / 2,
            width: 10,
            height: 10,
            borderRadius: 9999,
            background: "red",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            zIndex: 50,
          }}
        />
        }

      </div>

      {children}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50" />
    </div>
  )
}
