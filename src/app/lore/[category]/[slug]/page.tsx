import { notFound } from "next/navigation"
import { getEntry } from "@/lib/content"
import { MdxRender } from "@/components/MdxRender"
import LoreNav from "@/components/LoreNav"
import Badge from "@/components/Badge"
import { ScrollReveal } from "@/components/ScrollReveal"
import { LoreHero } from "@/components/LoreHero"
import { getCoverPosition, normalizeKey } from "@/lib/coverPositions"

export const dynamic = "force-dynamic"

export default async function LorePage({ params }: { params: Promise<{ category: string; slug: string }> | { category: string; slug: string } }) {
  const resolved = await params
  const entry = getEntry(resolved.category, resolved.slug)
  if (!entry) return notFound()

  const { frontmatter, content } = entry
  const coverPosition = getCoverPosition(normalizeKey(resolved.category, resolved.slug))

  // We pass the raw content string into `MdxRender` which will render it
  // using a reliable markdown renderer as a fallback (or MDXRemote when
  // serialized objects are used). This avoids situations where MDXRemote
  // doesn't render correctly in the environment.
  // If you prefer full MDX component rendering, we can switch back to
  // `serialize(content)` + `MDXRemote` after confirming configuration.
  // const mdxSource = await serialize(content)

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
      <LoreHero
        title={frontmatter.title}
        region={frontmatter.region}
        type={frontmatter.type}
        category={resolved.category}
        slug={resolved.slug}
        cover={frontmatter.cover}
        music={frontmatter.music}
        initialPosition={coverPosition}
      />

      {/* Navigation */}
      <LoreNav category={resolved.category} slug={resolved.slug} />

      {/* Lore body */}
      {/* Tags */}
      {/* TODO Implement Tag page feature */}
      <section className="mx-auto max-w-3xl px-6 py-14">
        <ScrollReveal>
          {frontmatter.tags && frontmatter.tags.length > 0 ? (
            <div className="flex flex-wrap gap-3 text-sm text-white/60">
              {frontmatter.tags.map((tag) => (
                <Badge key={tag} text={tag} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/50">No tags yet</p>
          )}
        </ScrollReveal>
        
        <ScrollReveal>
          {frontmatter.excerpt ? (
            <p className="text-lg text-white/70 italic pt-10">{frontmatter.excerpt}</p>
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
