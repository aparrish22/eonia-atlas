"use client"

type BadgeProps = {
  text: string
}

const palettes = [
  "border-emerald-400/40 bg-emerald-500/10 text-emerald-100",
  "border-sky-400/40 bg-sky-500/10 text-sky-100",
  "border-amber-400/40 bg-amber-500/10 text-amber-100",
  "border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-100",
  "border-rose-400/40 bg-rose-500/10 text-rose-100",
  "border-indigo-400/40 bg-indigo-500/10 text-indigo-100",
]

function toneFor(text: string) {
  const hash = Array.from(text).reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return palettes[hash % palettes.length]
}

export default function Badge({ text }: BadgeProps) {
  const tone = toneFor(text.toLowerCase())

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs lowercase tracking-wide ${tone}`}
      aria-label={`Tag ${text}`}
    >
      <span className="text-white/60">#</span>
      <span>{text}</span>
    </span>
  )
}

export function BadgeButton() {
  return (
    <button className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 hover:bg-white/20 transition">
      Click Me
    </button>
  )
}
