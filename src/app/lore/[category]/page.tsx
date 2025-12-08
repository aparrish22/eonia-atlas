import Link from "next/link"
import { notFound } from "next/navigation"
import { getEntriesByCategory } from "@/lib/content"
import { ScrollReveal } from "@/components/ScrollReveal"

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> | { category: string } }) {
  const resolved = await params
  if (!resolved || typeof resolved.category !== "string") return notFound()

  const entries = getEntriesByCategory(resolved.category)

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <ScrollReveal>
        <p className="text-xs uppercase tracking-[0.25em] text-white/60">
          Category
        </p>
        <h1 className="mt-2 text-3xl font-semibold">
          {resolved.category.charAt(0).toUpperCase() + resolved.category.slice(1)}
        </h1>
      </ScrollReveal>

      <div className="mt-8 grid gap-4">
        {entries.map((e) => (
          <ScrollReveal key={e.slug}>
            <Link
              href={`/lore/${e.category}/${e.slug}`}
              className="block rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-medium">{e.frontmatter.title}</h2>
                  <p className="mt-1 text-sm text-white/60">
                    {e.frontmatter.excerpt ?? "Open to read more."}
                  </p>
                </div>
                <span className="text-xs text-white/50">Open →</span>
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </main>
  )
}
