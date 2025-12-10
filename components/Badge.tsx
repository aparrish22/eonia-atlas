"use client"

export default function Badge({ text }: { text: string }) {
    return (
        <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
            {text}
        </span>
    )
}

export function BadgeButton() {
    return (
        <button href="#" className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 hover:bg-white/20 transition">
            Click Me
        </button>
    )
}