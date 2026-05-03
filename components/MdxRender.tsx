/*
 * Renders lore body content from the file-backed content pipeline.
 * Today the common input is a raw Markdown string parsed with `marked`; the
 * fallback path preserves support for pre-serialized MDXRemote-compatible data.
 */
import { MDXRemote } from "next-mdx-remote/rsc"
import { marked } from "marked"
import type { ComponentProps } from "react"

type MdxRemoteSource = ComponentProps<typeof MDXRemote>["source"]

export function MdxRender({ source }: { source: string | MdxRemoteSource }) {
  // If `source` is a raw markdown/MDX string, render it to HTML as a reliable
  // fallback. If it's already a serialized MDX object, let `MDXRemote` handle it.
  if (typeof source === "string") {
    const html = marked.parse(source)
    return <article className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
  }

  return (
    <article className="prose prose-invert max-w-none">
      <MDXRemote source={source} />
    </article>
  )
}
