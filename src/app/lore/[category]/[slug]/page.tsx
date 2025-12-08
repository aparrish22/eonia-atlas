import Image from "next/image"
import { notFound } from "next/navigation"
import { getEntry } from "@/lib/content"
import { ScrollReveal } from "@/components/ScrollReveal"
import { MusicPlayer } from "@/components/MusicPlayer"
import { MdxRender } from "@/components/MdxRender"
import LoreNav from "@/components/LoreNav"

export default async function LorePage({ params }: { params: Promise<{ category: string; slug: string }> | { category: string; slug: string } }) {
  const resolved = await params
  const entry = getEntry(resolved.category, resolved.slug)
  if (!entry) return notFound()

  const { frontmatter, content } = entry

  // MDX renders as a component automatically with Next MDX config.
  // We can import it dynamically by using the filesystem route,
  // but simplest v1 approach: render markdown content as raw MDX component
  // via a dedicated "ContentRenderer" would be next step.
  //
  // Since file-based MDX pages are not routed as components here,
  // we will keep v1 minimal by showing the content string in a simple block
  // and replace this later with a proper MDX renderer.
  //
  // If you want full MDX component rendering now, I’ll give you the add-on file.

  return (
    <main className="min-h-screen">
      {/* Cinematic cover */}
      <section className="relative h-[55vh] min-h-[360px] w-full overflow-hidden">
        {frontmatter.cover ? (
          <Image
            src={frontmatter.cover}
            alt={frontmatter.title}
            fill
            priority
            className="object-cover opacity-70"
          />
        ) : (
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/10 via-black to-black" />
        )}

        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/30 via-black/40 to-black" />

        <div className="relative mx-auto flex h-full max-w-5xl flex-col justify-end px-6 pb-10">
          <ScrollReveal>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-white/60">
                  {frontmatter.region ?? frontmatter.type ?? resolved.category}
                </p>
                <h1 className="mt-2 text-3xl md:text-5xl font-semibold">
                  {frontmatter.title}
                </h1>
              </div>
              <MusicPlayer src={frontmatter.music} />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Navigation */}
      <LoreNav category={resolved.category} slug={resolved.slug} />

      {/* Lore body */}
      <section className="mx-auto max-w-3xl px-6 py-14">
        <ScrollReveal>
          {frontmatter.excerpt ? (
            <p className="text-lg text-white/70">{frontmatter.excerpt}</p>
          ) : null}
        </ScrollReveal>

        <div className="mt-10 space-y-6">
          {/* Simple v1 renderer placeholder */}
          <ScrollReveal>
            <MdxRender source={content} />
          </ScrollReveal>
        </div>
      </section>
    </main>
  )
}
