import Link from "next/link"
import { getEntriesByCategory } from "@/lib/content"

type Props = {
  category: string
  slug: string
}

export default function LoreNav({ category, slug }: Props) {
  const entries = getEntriesByCategory(category)
  const idx = entries.findIndex((e) => e.slug === slug)
  const prev = idx > 0 ? entries[idx - 1] : null
  const next = idx >= 0 && idx < entries.length - 1 ? entries[idx + 1] : null

  return (
    <nav className="mx-auto max-w-5xl px-6 py-6">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:text-white hover:bg-white/10 transition"
        >
          Home
        </Link>

        <Link
          href={`/lore/${category}`}
          className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:text-white hover:bg-white/10 transition"
        >
          All {category.charAt(0).toUpperCase() + category.slice(1)}
        </Link>

        <div className="ml-auto flex items-center gap-2">
          {prev ? (
            <Link
              href={`/lore/${prev.category}/${prev.slug}`}
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:text-white hover:bg-white/10 transition"
            >
              ← {prev.frontmatter.title}
            </Link>
          ) : (
            <button className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/40 opacity-40 cursor-not-allowed">
              ← Prev
            </button>
          )}

          {next ? (
            <Link
              href={`/lore/${next.category}/${next.slug}`}
              className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:text-white hover:bg-white/10 transition"
            >
              {next.frontmatter.title} →
            </Link>
          ) : (
            <button className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/40 opacity-40 cursor-not-allowed">
              Next →
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}
