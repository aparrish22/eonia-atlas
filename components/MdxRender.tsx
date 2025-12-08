import { MDXRemote } from "next-mdx-remote/rsc"
import { marked } from "marked"

export function MdxRender({ source }: { source: any }) {
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
