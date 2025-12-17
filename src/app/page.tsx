import Image from "next/image"
import Link from "next/link"
import { getAllCategories, getEntriesByCategory } from "@/lib/content"
import { ScrollReveal } from "@/components/ScrollReveal"

export default function HomePage() {
  const categories = getAllCategories()
  const heroImage = "/images/roanthur.jpg"

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt="Eonia vista"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-60"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black" />
        </div>

        <div className="relative mx-auto max-w-5xl px-6 py-24">
          <ScrollReveal>
            <p className="text-xs uppercase tracking-[0.25em] text-white/60">
              The World of Eonia
            </p>
            <h1 className="mt-3 text-4xl md:text-6xl font-semibold tracking-tight">
              A simple atlas of legends,
              <span className="text-white/70"> built to grow.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-white/70">
              Explore locations, events, characters, and fragments of lore.
              This is the living archive of your world — one page at a time.
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/world-map"
                className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15 transition"
              >
                World Map →
              </Link>
              {categories.map((c) => (
                <Link
                  key={c}
                  href={`/lore/${c}`}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition"
                >
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </Link>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Featured preview */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        {categories.map((category) => {
          const entries = getEntriesByCategory(category).slice(0, 3)
          if (!entries.length) return null

          return (
            <div key={category} className="mt-14">
              <ScrollReveal>
                <div className="flex items-end justify-between">
                  <h2 className="text-xl font-semibold">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </h2>
                  <Link
                    href={`/lore/${category}`}
                    className="text-xs text-white/60 hover:text-white"
                  >
                    View all →
                  </Link>
                </div>
              </ScrollReveal>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {entries.map((e) => (
                  <ScrollReveal key={e.slug}>
                    <Link
                      href={`/lore/${e.category}/${e.slug}`}
                      className="block rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
                    >
                      <p className="text-xs text-white/50 uppercase tracking-wider">
                        {e.frontmatter.region ?? e.frontmatter.type ?? "Eonia"}
                      </p>
                      <h3 className="mt-2 text-lg font-medium">
                        {e.frontmatter.title}
                      </h3>
                      <p className="mt-2 text-sm text-white/65">
                        {e.frontmatter.excerpt ?? "A page of lore awaits."}
                      </p>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          )
        })}
      </section>
    </main>
  )
}
