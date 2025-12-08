"use client"

import { useEffect, useMemo, useRef, useState } from "react"

type Props = {
  src?: string
}

export function MusicPlayer({ src }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    try {
      return localStorage.getItem("eonia_music_enabled") === "true"
    } catch {
      return false
    }
  })

  useEffect(() => {
    localStorage.setItem("eonia_music_enabled", String(enabled))
  }, [enabled])

  // reload audio when src changes
  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.pause()
    audioRef.current.src = src ?? ""
    audioRef.current.load()

    if (enabled && src) {
      audioRef.current
        .play()
        .catch(() => {
          // ignore if browser blocks for any reason
        })
    }
  }, [src, enabled])

  const label = useMemo(() => (enabled ? "Ambience: On" : "Ambience: Off"), [enabled])

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => setEnabled((v) => !v)}
        className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs tracking-wide text-white/80 hover:text-white hover:bg-white/10 transition"
      >
        {label}
      </button>
      <audio ref={audioRef} loop preload="none" />
    </div>
  )
}
